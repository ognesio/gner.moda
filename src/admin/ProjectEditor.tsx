import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminGetProject, rpcSave } from '../lib/api'
import { PROJECT_STATUS, byPosition, projectUrl, slugify } from '../lib/format'
import type { Credit, ImageRef, Piece, ProjectStatus } from '../lib/types'
import { GalleryManager } from './GalleryManager'
import { PiecePicker } from './PiecePicker'
import { removeFiles } from './images'

type Img = ImageRef & { id: string }
interface Form {
  id: string
  code?: string
  title: string
  slug: string
  artist: string
  stylist: string
  category: string
  project_date: string
  short_description: string
  body: string
  status: ProjectStatus
  featured_home: boolean
  sort_order: number
  is_test: boolean
  wasPublished: boolean
  images: Img[]
  credits: Credit[]
  pieces: Piece[]
}

const empty = (): Form => ({
  id: crypto.randomUUID(), title: '', slug: '', artist: '', stylist: '', category: '', project_date: '',
  short_description: '', body: '', status: 'draft', featured_home: false, sort_order: 0, is_test: false,
  wasPublished: false, images: [], credits: [], pieces: [],
})

const CATEGORIAS = ['Editorial', 'Campanha', 'Styling', 'Projeto autoral', 'Colaboração', 'Desfile', 'Videoclipe']

export default function ProjectEditor() {
  const { id = 'novo' } = useParams()
  const isNew = id === 'novo'
  const nav = useNavigate()
  const [form, setForm] = useState<Form | null>(isNew ? empty() : null)
  const [saved, setSaved] = useState<string>(isNew ? JSON.stringify(empty()) : '')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isNew) {
      const f = empty()
      setForm(f)
      setSaved(JSON.stringify(f))
      setSlugTouched(false)
      return
    }
    adminGetProject(id).then(
      (p) => {
        if (!p) return setMsg({ kind: 'err', text: 'Projeto não encontrado.' })
        const f: Form = {
          id: p.id, code: p.code, title: p.title, slug: p.slug, artist: p.artist ?? '', stylist: p.stylist ?? '',
          category: p.category ?? '', project_date: p.project_date ?? '', short_description: p.short_description ?? '',
          body: p.body ?? '', status: p.status, featured_home: p.featured_home, sort_order: p.sort_order, is_test: p.is_test,
          wasPublished: Boolean(p.published_at),
          images: byPosition(p.project_images) as Img[],
          credits: byPosition(p.project_credits),
          pieces: byPosition(p.project_pieces).map((x) => x.pieces).filter(Boolean) as Piece[],
        }
        setForm(f)
        setSaved(JSON.stringify(f))
      },
      (e: Error) => setMsg({ kind: 'err', text: e.message }),
    )
  }, [id, isNew])

  const dirty = useMemo(() => form !== null && JSON.stringify(form) !== saved, [form, saved])
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  if (!form) return msg ? <p className="a-error">{msg.text}</p> : <p>Carregando…</p>
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))

  async function save(status: ProjectStatus = form!.status, preview = false) {
    const f = form!
    setMsg(null)
    if (status === 'published' && f.images.length === 0) {
      setMsg({ kind: 'err', text: 'Para publicar, envie ao menos uma imagem.' })
      return
    }
    const win = preview ? window.open('about:blank', '_blank') : null
    setBusy(true)
    try {
      const res = await rpcSave('save_project', {
        id: f.id, title: f.title, slug: f.slug, artist: f.artist, stylist: f.stylist, category: f.category,
        project_date: f.project_date, short_description: f.short_description, body: f.body, status,
        sort_order: f.sort_order, featured_home: f.featured_home,
        images: f.images.map((i) => ({ id: i.id, path: i.path, thumb: i.thumb, width: i.width, height: i.height, alt: i.alt, caption: i.caption, is_cover: Boolean(i.is_cover) })),
        credits: f.credits.filter((c) => c.name.trim()).map((c) => ({ name: c.name, role: c.role })),
        piece_ids: f.pieces.map((p) => p.id),
      })
      await removeFiles(res.removed_paths)
      const next: Form = {
        ...f, status, code: res.code, wasPublished: f.wasPublished || status === 'published',
        credits: f.credits.filter((c) => c.name.trim()),
      }
      setForm(next)
      setSaved(JSON.stringify(next))
      setSlugTouched(true)
      const label = { draft: 'Rascunho salvo.', published: 'Projeto publicado — já está no site.', archived: 'Projeto arquivado (fora do site, histórico mantido).' }[status]
      setMsg({ kind: 'ok', text: label })
      if (win) win.location.href = window.location.origin + projectUrl(next)
      if (isNew) nav(`/admin/projetos/${res.id}`, { replace: true })
    } catch (e) {
      win?.close()
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const onTitle = (v: string) => setForm((f) => (f ? { ...f, title: v, slug: slugTouched ? f.slug : slugify(v) } : f))
  const credits = form.credits
  const setCredit = (i: number, patch: Partial<Credit>) => set('credits', credits.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const moveCredit = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= credits.length) return
    const next = [...credits]
    ;[next[i], next[j]] = [next[j], next[i]]
    set('credits', next)
  }

  return (
    <form className="ed" onSubmit={(e) => { e.preventDefault(); save() }}>
      <div className="a-head">
        <div>
          <Link to="/admin/projetos" className="a-link">← Projetos &amp; Cases</Link>
          <h1>{form.title || (isNew ? 'Novo projeto' : 'Sem título')}</h1>
          <p className="a-row__sub">
            {form.code ?? 'Código gerado ao salvar'} · <span className={`a-pill a-pill--${form.status}`}>{PROJECT_STATUS[form.status]}</span>
            {form.is_test && ' · projeto de teste'}
            {dirty && <span className="a-dirty"> · alterações não salvas</span>}
          </p>
        </div>
      </div>

      <fieldset className="ed__card">
        <legend>Principais</legend>
        <div className="ed__grid">
          <label className="ed__full">Nome do projeto *<input required value={form.title} onChange={(e) => onTitle(e.target.value)} /></label>
          <label className="ed__full">
            URL amigável *
            <span className="ed__slug">
              <span>gnermoda.com/projetos/</span>
              <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug}
                onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }} />
            </span>
            {form.wasPublished && <small className="a-warn">Mudar a URL de um projeto já publicado quebra links compartilhados.</small>}
          </label>
          <label>Artista<input value={form.artist} onChange={(e) => set('artist', e.target.value)} placeholder="ex.: @dfideliz" /></label>
          <label>Stylist<input value={form.stylist} onChange={(e) => set('stylist', e.target.value)} /></label>
          <label>
            Categoria
            <input list="cats" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Editorial, Campanha…" />
            <datalist id="cats">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>Ano ou data<input value={form.project_date} onChange={(e) => set('project_date', e.target.value)} placeholder="2026" /></label>
          <label className="ed__full">Descrição curta<textarea rows={2} maxLength={280} value={form.short_description} onChange={(e) => set('short_description', e.target.value)} /><small>Aparece na lista de projetos. Até 280 caracteres.</small></label>
          <label className="ed__full">Descritivo / conceito<textarea rows={7} value={form.body} onChange={(e) => set('body', e.target.value)} /><small>Deixe uma linha em branco entre parágrafos.</small></label>
        </div>
      </fieldset>

      <fieldset className="ed__card">
        <legend>Galeria ({form.images.length})</legend>
        <GalleryManager items={form.images} onChange={(v) => set('images', v)} folder={`projects/${form.id}`} />
      </fieldset>

      <fieldset className="ed__card">
        <legend>Créditos</legend>
        <p className="a-hint">Fotografia, beleza, produção, direção… Linhas vazias não aparecem no site.</p>
        <ol className="cred">
          {credits.map((c, i) => (
            <li key={i}>
              <input aria-label="Função" placeholder="Função (ex.: Fotografia)" value={c.role ?? ''} onChange={(e) => setCredit(i, { role: e.target.value })} />
              <input aria-label="Nome" placeholder="Nome" value={c.name} onChange={(e) => setCredit(i, { name: e.target.value })} />
              <button type="button" className="a-link" onClick={() => moveCredit(i, -1)} aria-label="Subir">↑</button>
              <button type="button" className="a-link" onClick={() => moveCredit(i, 1)} aria-label="Descer">↓</button>
              <button type="button" className="a-link danger" onClick={() => set('credits', credits.filter((_, j) => j !== i))}>Remover</button>
            </li>
          ))}
        </ol>
        <button type="button" className="a-btn" onClick={() => set('credits', [...credits, { name: '', role: '' }])}>+ Adicionar crédito</button>
      </fieldset>

      <fieldset className="ed__card">
        <legend>Peças do acervo ({form.pieces.length})</legend>
        <PiecePicker value={form.pieces} onChange={(v) => set('pieces', v)} />
      </fieldset>

      <fieldset className="ed__card">
        <legend>Exibição</legend>
        <label className="a-check"><input type="checkbox" checked={form.featured_home} onChange={(e) => set('featured_home', e.target.checked)} /> Destaque na página inicial</label>
        <label className="ed__small">Ordem de exibição<input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} /><small>Menor aparece primeiro. Também dá para arrastar na lista.</small></label>
      </fieldset>

      <div className="ed__bar">
        {msg && <p className={msg.kind === 'ok' ? 'a-ok' : 'a-error'} role="status">{msg.text}</p>}
        <div className="ed__actions">
          {form.status === 'draft' && <button type="button" className="a-btn" disabled={busy} onClick={() => save('draft')}>Salvar rascunho</button>}
          {form.status !== 'draft' && <button type="button" className="a-btn" disabled={busy} onClick={() => save()}>Salvar</button>}
          <button type="button" className="a-btn" disabled={busy || !form.slug} onClick={() => save(form.status, true)}>Pré-visualizar ↗</button>
          {form.status !== 'published' && <button type="button" className="a-btn a-btn--primary" disabled={busy} onClick={() => save('published')}>Publicar</button>}
          {form.status === 'published' && <button type="button" className="a-btn" disabled={busy} onClick={() => save('draft')}>Despublicar</button>}
          {form.status !== 'archived' && !isNew && <button type="button" className="a-btn danger" disabled={busy}
            onClick={() => confirm('Arquivar este projeto? Ele sai do site, mas nada é apagado.') && save('archived')}>Arquivar</button>}
          {form.status === 'archived' && <button type="button" className="a-btn" disabled={busy} onClick={() => save('draft')}>Restaurar como rascunho</button>}
        </div>
      </div>
    </form>
  )
}
