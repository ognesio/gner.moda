// Netlify Edge Function — injeta título, descrição e foto da peça/projeto no HTML,
// para que WhatsApp, Instagram e afins mostrem a prévia correta do link.
// Não altera o que o visitante vê: só os metadados do <head>.

const SUPABASE_URL = 'https://opktiobdvseegrrwmoje.supabase.co'
const SUPABASE_KEY = 'sb_publishable_LDxZEEjTwi_ZZp3eZKbbOw_YcTaZuOn'
const SITE = 'https://gnermoda.com'

const CATEGORY: Record<string, string> = {
  superior: 'Superior', inferior: 'Inferior', conjuntos: 'Conjuntos',
  externas: 'Externas', acessorios: 'Acessórios', calcados: 'Calçados',
}

type Img = { path: string; position: number; is_cover?: boolean }
type Ctx = { next: () => Promise<Response> }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const imgUrl = (p?: string) =>
  !p ? '' : p.startsWith('http') ? p : p.startsWith('/') ? SITE + p.replace(/\.webp$/, '.jpg') : `${SUPABASE_URL}/storage/v1/object/public/media/${p}`
const pick = (imgs: Img[] = []) => {
  const s = [...imgs].sort((a, b) => a.position - b.position)
  return s.find((i) => i.is_cover) ?? s[0]
}

async function query(path: string, env?: { url?: string; key?: string }) {
  const url = env?.url ?? SUPABASE_URL
  const key = env?.key ?? SUPABASE_KEY
  const r = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Accept: 'application/json' } })
  if (!r.ok) return null
  const rows = await r.json()
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

export async function metaFor(pathname: string, env?: { url?: string; key?: string }) {
  const m = pathname.match(/^\/(acervo|projetos)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  if (!m) return null
  const [, kind, slug] = m
  if (kind === 'acervo') {
    const p = await query(`pieces?slug=eq.${slug}&select=name,code,category,sizes,description,piece_images(path,position)&limit=1`, env)
    if (!p) return null
    const tam = p.sizes?.length ? ` · Tam. ${p.sizes.join('/')}` : ''
    return {
      title: `${p.name} — GNER.MODA`,
      description: p.description || `${p.name} · ${p.code} · ${CATEGORY[p.category] ?? ''}${tam}. Peça do acervo GNER.MODA para locação.`,
      image: imgUrl(pick(p.piece_images)?.path),
      url: `${SITE}/acervo/${slug}`,
    }
  }
  // Só projetos publicados são devolvidos pela chave pública (regra do banco)
  const p = await query(`projects?slug=eq.${slug}&status=eq.published&select=title,artist,short_description,project_images(path,position,is_cover)&limit=1`, env)
  if (!p) return null
  return {
    title: `${p.title} — GNER.MODA`,
    description: p.short_description || [p.artist, 'Projeto GNER.MODA'].filter(Boolean).join(' · '),
    image: imgUrl(pick(p.project_images)?.path),
    url: `${SITE}/projetos/${slug}`,
  }
}

export function inject(html: string, meta: { title: string; description: string; image: string; url: string }) {
  const set = (h: string, re: RegExp, tag: string) => (re.test(h) ? h.replace(re, tag) : h.replace('</head>', `${tag}\n</head>`))
  let h = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
  h = set(h, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(meta.description)}" />`)
  h = set(h, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(meta.title)}" />`)
  h = set(h, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(meta.description)}" />`)
  h = set(h, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(meta.url)}" />`)
  if (meta.image) h = set(h, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(meta.image)}" />`)
  return h
}

export default async (request: Request, context: Ctx) => {
  const res = await context.next()
  if (!(res.headers.get('content-type') ?? '').includes('text/html')) return res
  try {
    const meta = await metaFor(new URL(request.url).pathname)
    if (!meta) return res
    const html = inject(await res.text(), meta)
    const headers = new Headers(res.headers)
    headers.delete('content-length')
    return new Response(html, { status: res.status, headers })
  } catch {
    return res
  }
}
