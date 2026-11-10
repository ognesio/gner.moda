// SOMENTE PARA TESTE LOCAL — imita as rotas do Supabase que o site usa
// (Auth, REST/PostgREST e Storage) sobre um Postgres real com as mesmas regras de RLS.
// Não faz parte do site publicado.
import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const PORT = Number(process.env.PORT || 54321)
const pool = new pg.Pool({ host: '/tmp', port: 5499, user: 'postgres', database: process.env.DB || 't' })
const SECRET = 'test-secret'
const FILES = process.env.FILES || '/tmp/fake-storage'
const PASSWORD = 'teste123'
fs.mkdirSync(FILES, { recursive: true })

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const sign = (payload) => {
  const h = b64({ alg: 'HS256', typ: 'JWT' }), p = b64(payload)
  return `${h}.${p}.${crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url')}`
}
const verify = (tok) => {
  try {
    const [h, p, s] = tok.split('.')
    if (crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url') !== s) return null
    const c = JSON.parse(Buffer.from(p, 'base64url').toString())
    return c.exp * 1000 > Date.now() ? c : null
  } catch { return null }
}
const claimsOf = (req) => verify((req.headers.authorization || '').replace(/^Bearer /, ''))

const PIECE_JSON = (a) => `to_jsonb(${a}) || jsonb_build_object('piece_images', coalesce((select jsonb_agg(to_jsonb(i) order by i.position) from public.piece_images i where i.piece_id = ${a}.id), '[]'))`
const SELECT = {
  pieces: `select ${PIECE_JSON('t')} || jsonb_build_object('project_pieces', coalesce((select jsonb_agg(jsonb_build_object('projects', (select jsonb_build_object('id',p.id,'slug',p.slug,'title',p.title,'status',p.status) from public.projects p where p.id = pp.project_id))) from public.project_pieces pp where pp.piece_id = t.id), '[]')) as j from public.pieces t`,
  projects: `select to_jsonb(t)
     || jsonb_build_object('project_images', coalesce((select jsonb_agg(to_jsonb(i) order by i.position) from public.project_images i where i.project_id = t.id), '[]'))
     || jsonb_build_object('project_credits', coalesce((select jsonb_agg(to_jsonb(c) order by c.position) from public.project_credits c where c.project_id = t.id), '[]'))
     || jsonb_build_object('project_pieces', coalesce((select jsonb_agg(jsonb_build_object('position', pp.position, 'pieces', (select ${PIECE_JSON('x')} from public.pieces x where x.id = pp.piece_id)) order by pp.position) from public.project_pieces pp where pp.project_id = t.id), '[]')) as j
     from public.projects t`,
  admins: `select to_jsonb(t) as j from public.admins t`,
}

async function asRole(claims, fn) {
  const c = await pool.connect()
  try {
    await c.query('begin')
    await c.query(`set local role ${claims ? 'authenticated' : 'anon'}`)
    await c.query(`select set_config('request.jwt.claim.sub', $1, true)`, [claims?.sub || ''])
    const r = await fn(c)
    await c.query('commit')
    return r
  } catch (e) { await c.query('rollback'); throw e } finally { c.release() }
}

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'content-type': type, 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' })
  res.end(type === 'application/json' ? JSON.stringify(body) : body)
}
const readBody = (req) => new Promise((r) => { const ch = []; req.on('data', (d) => ch.push(d)); req.on('end', () => r(Buffer.concat(ch))) })
const ident = (s) => { if (!/^[a-z_]+$/.test(s)) throw new Error('bad ident ' + s); return s }

function where(params, alias = 't') {
  const conds = [], vals = []
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset'].includes(k) || k.includes('.')) continue
    const m = v.match(/^eq\.(.*)$/)
    if (!m) continue
    vals.push(m[1]); conds.push(`${alias}.${ident(k)}::text = $${vals.length}`)
  }
  return { sql: conds.length ? ' where ' + conds.join(' and ') : '', vals }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const p = url.pathname
  if (req.method === 'OPTIONS') return send(res, 204, '')
  const log = () => process.env.VERBOSE && console.log(req.method, p + url.search)
  log()
  try {
    // ---------------- Auth ----------------
    if (p === '/auth/v1/token') {
      const b = JSON.parse((await readBody(req)).toString() || '{}')
      const { rows } = await pool.query('select id, email from auth.users where email = $1', [b.email])
      if (!rows[0] || b.password !== PASSWORD) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials', code: 400 })
      const u = { id: rows[0].id, email: rows[0].email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
      const exp = Math.floor(Date.now() / 1000) + 3600
      return send(res, 200, { access_token: sign({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', exp }), token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: 'r-' + u.id, user: u })
    }
    if (p === '/auth/v1/user') {
      const c = claimsOf(req)
      if (!c) return send(res, 401, { msg: 'invalid JWT' })
      return send(res, 200, { id: c.sub, email: c.email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} })
    }
    if (p === '/auth/v1/logout') return send(res, 204, '')

    // ---------------- REST ----------------
    const rpc = p.match(/^\/rest\/v1\/rpc\/(\w+)$/)
    if (rpc) {
      const b = JSON.parse((await readBody(req)).toString())
      const out = await asRole(claimsOf(req), (c) => c.query(`select public.${ident(rpc[1])}($1::jsonb) as r`, [JSON.stringify(b.p)]))
      return send(res, 200, out.rows[0].r)
    }
    const tbl = p.match(/^\/rest\/v1\/(\w+)$/)
    if (tbl) {
      const t = ident(tbl[1])
      if (req.method === 'GET') {
        const w = where(url.searchParams)
        const order = (url.searchParams.get('order') || '').split(',').filter(Boolean).map((o) => { const [col, dir] = o.split('.'); return `t.${ident(col)} ${dir === 'desc' ? 'desc' : 'asc'} nulls last` })
        const limit = Number(url.searchParams.get('limit')) || null
        const sql = `${SELECT[t]}${w.sql}${order.length ? ' order by ' + order.join(',') : ''}${limit ? ' limit ' + limit : ''}`
        const out = await asRole(claimsOf(req), (c) => c.query(sql, w.vals))
        return send(res, 200, out.rows.map((r) => r.j))
      }
      if (req.method === 'PATCH') {
        const b = JSON.parse((await readBody(req)).toString())
        const w = where(url.searchParams, t)
        const cols = Object.keys(b).map(ident)
        const vals = [...w.vals, ...cols.map((k) => b[k])]
        const sets = cols.map((k, i) => `${k} = $${w.vals.length + i + 1}`).join(', ')
        const out = await asRole(claimsOf(req), (c) => c.query(`update public.${t} set ${sets}${w.sql.replace(/ t\./g, ` ${t}.`)} returning id`, vals))
        return send(res, 200, out.rows)
      }
    }

    // ---------------- Storage ----------------
    const pub = p.match(/^\/storage\/v1\/object\/public\/media\/(.+)$/)
    if (pub && req.method === 'GET') {
      const f = path.join(FILES, decodeURIComponent(pub[1]))
      if (!f.startsWith(FILES) || !fs.existsSync(f)) return send(res, 404, { message: 'not found' })
      return send(res, 200, fs.readFileSync(f), f.endsWith('.webp') ? 'image/webp' : 'image/jpeg')
    }
    const up = p.match(/^\/storage\/v1\/object\/media\/(.+)$/)
    if (up && req.method === 'POST') {
      const name = decodeURIComponent(up[1])
      const body = await readBody(req)
      await asRole(claimsOf(req), (c) => c.query(`insert into storage.objects (bucket_id, name) values ('media', $1)`, [name]))
      const f = path.join(FILES, name)
      fs.mkdirSync(path.dirname(f), { recursive: true })
      // supabase-js envia multipart quando recebe Blob; extrai o conteúdo do arquivo
      const ct = req.headers['content-type'] || ''
      let data = body
      if (ct.startsWith('multipart/form-data')) {
        const boundary = '--' + ct.split('boundary=')[1]
        const s = body.indexOf(Buffer.from('\r\n\r\n')) + 4
        const e = body.lastIndexOf(Buffer.from('\r\n' + boundary))
        data = body.subarray(s, e)
      }
      fs.writeFileSync(f, data)
      return send(res, 200, { Key: `media/${name}`, Id: crypto.randomUUID() })
    }
    if (p === '/storage/v1/object/media' && req.method === 'DELETE') {
      const b = JSON.parse((await readBody(req)).toString())
      const out = await asRole(claimsOf(req), (c) => c.query(`delete from storage.objects where bucket_id='media' and name = any($1) returning name`, [b.prefixes]))
      for (const r of out.rows) fs.rmSync(path.join(FILES, r.name), { force: true })
      return send(res, 200, out.rows.map((r) => ({ name: r.name })))
    }
    send(res, 404, { message: 'rota não simulada: ' + p })
  } catch (e) {
    const denied = e.code === '42501'
    send(res, denied ? 403 : 400, { message: e.message, code: e.code, details: e.detail ?? null, hint: null })
  }
})
server.listen(PORT, () => console.log('fake supabase on', PORT))
