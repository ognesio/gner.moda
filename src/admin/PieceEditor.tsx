import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminGetPiece, adminListPieces, rpcSave } from '../lib/api'
import { CATEGORIES, STATUS, byPosition, pieceUrl, slugify, sortSizes } from '../lib/format'
import type { ImageRef, PieceCategory, PieceStatus, ProjectRef } from '../lib/types'
import { GalleryManager } from './GalleryManager'
import { removeFiles } from './images'

type Img = ImageRef & { id: string }
interface Form {
  id: string
  code?: string
  name: string
  slug: string
  category: PieceCategory
  sizes: string[]
  colors: string[]
  materials: string[]
  status: PieceStatus
  description: string
  measurements: string
  condition: string
  price_note: string
  is_published: boolean
  sort_order: number
  images: Img[]
}
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único']

const empty = (): Form => ({
  id: crypto.randomUUID(), name: '', slug: '', category: 'superior', sizes: [], colors: [], materials: [], status: 'sob_consulta',
  description: '', measurements: '', condition: '', price_note: '', is_published: true, sort_order: 0, images: [],
})

export default function PieceEditor() {
  const { id = 'novo' } = useParams()
  const isNew = id === 'novo'
  const nav = useNavigate()
  const [form, setForm] = useState<Form | null>(isNew ? empty() : null)
  const [saved, setSaved] = useState(isNew ? JSON.stringify(empty()) : '')
  const [projects, setProjects] = useState<ProjectRef[]>([])
  const [suggest, setSuggest] = useState<{ colors: string[]; materials: string[] }>({ colors: [], materials: [] })
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [newSize, setNewSize] = useState('')

  useEffect(() => {
    adminListPieces().then((all) =>
      setSuggest({
        colors: [...new Set(all.flatMap((p) => p.colors))].sort(),
        materials: [...new Set(all.flatMap((p) => p.materials))].sort(),
      }),
    )
    if (isNew) return
    adminGetPiece(id).then(
      (p) => {
        if (!p) return setMsg({ kind: 'err', text: 'Peça não encontrada.' })
        const f: Form = {
          id: p.id, code: p.code, name: p.name, slug: p.slug, category: p.category, sizes: p.sizes, colors: p.colors,
          materials: p.materials, status: p.status, description: p.description ?? '', measurements: p.measurements ?? '',
          condition: p.condition ?? '', price_note: p.price_note ?? '', is_published: p.is_published, sort_order: p.sort_order,
          images: byPosition(p.piece_images) as Img[],
        }
        setForm(f)
        setSaved(JSON.stringify(f))
        setProjects((p.project_pieces ?? []).map((x) => x.projects).filter(Boolean) as ProjectRef[])
      },
      (e: Error) => setMsg({ kind: 'err', text: e.message }),
    )
  }, [id, isNew])

  const dirty = useMemo(() => form !== null && JSON.stringify(form) !== saved, [form, saved])
  if (!form) return msg ? <p className="a-error">{msg.text}</p> : <p>Carregando…</p>
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))
  const toggleSize = (s: string) => set('sizes', sortSizes(form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s]))

  async function save() {
    const f = form!
    setBusy(true)
    setMsg(null)
    // slug novo: nome + código (o código só existe depois de salvar; até lá, nome + id curto)
    const slug = f.slug || `${slugify(f.name)}-${f.id.slice(0, 6)}`
    try {
      const res = await rpcSave('save_piece', {
        ...f, slug,
        images: f.images.map((i) => ({ id: i.id, path: i.path, thumb: i.thumb, width: i.width, height: i.height, alt: i.alt })),
      })
      await removeFiles(res.removed_paths)
      const next = { ...f, slug: res.slug, code: res.code }
      setForm(next)
      setSaved(JSON.stringify(next))
      setMsg({ kind: 'ok', text: 'Peça salva — já atualizada no site.' })
      if (isNew) nav(`/admin/acervo/${res.id}`, { replace: true })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="ed" onSubmit={(e) => { e.preventDefault(); save() }}>
      <div className="a-head">
        <div>
          <Link to="/admin/acervo" className="a-link">← Acervo</Link>
          <h1>{form.name || 'Nova peça'}</h1>
          <p className="a-row__sub">{form.code ?? 'Código gerado ao salvar'}{dirty && <span className="a-dirty"> · alterações não salvas</span>}</p>
        </div>
      </div>

      <fieldset className="ed__card">
        <legend>Dados da peça</legend>
        <div className="ed__grid">
          <label className="ed__full">Nome *<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>
            Categoria *
            <select value={form.category} onChange={(e) => set('category', e.target.value as PieceCategory)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => set('status', e.target.value as PieceStatus)}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <div className="ed__full">
            <span className="ed__lbl">Tamanhos (marque todos que a peça veste)</span>
            <div className="a-chips">
              {[...new Set([...SIZES, ...form.sizes])].map((s) => (
                <button type="button" key={s} aria-pressed={form.sizes.includes(s)} className={form.sizes.includes(s) ? 'on' : ''} onClick={() => toggleSize(s)}>{s}</button>
              ))}
              <input className="a-chips__add" placeholder="Outro (ex.: 43)" value={newSize} onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newSize.trim()) toggleSize(newSize.trim()); setNewSize('') } }} />
            </div>
          </div>
          <TagInput label="Cores" value={form.colors} onChange={(v) => set('colors', v)} options={suggest.colors} />
          <TagInput label="Tecido / material" value={form.materials} onChange={(v) => set('materials', v)} options={suggest.materials} />
          <label className="ed__full">Descrição<textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
          <label>Medidas<input value={form.measurements} onChange={(e) => set('measurements', e.target.value)} /></label>
          <label>Condição<input value={form.condition} onChange={(e) => set('condition', e.target.value)} /></label>
          <label>Valor<input value={form.price_note} onChange={(e) => set('price_note', e.target.value)} placeholder="ex.: R$ 80 / diária" /></label>
          <label className="a-check"><input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} /> Mostrar no site</label>
        </div>
        <p className="a-hint">Campos vazios não aparecem na página da peça.</p>
      </fieldset>

      <fieldset className="ed__card">
        <legend>Fotos ({form.images.length})</legend>
        <GalleryManager items={form.images} onChange={(v) => set('images', v)} folder={`pieces/${form.id}`} withCover={false} withCaption={false} />
        <p className="a-hint">A primeira foto é a principal no catálogo.</p>
      </fieldset>

      {projects.length > 0 && (
        <fieldset className="ed__card">
          <legend>Aparece em</legend>
          <ul>{projects.map((p) => <li key={p.id}><Link to={`/admin/projetos/${p.id}`}>{p.title}</Link></li>)}</ul>
          <p className="a-hint">O vínculo é feito no cadastro do projeto.</p>
        </fieldset>
      )}

      <div className="ed__bar">
        {msg && <p className={msg.kind === 'ok' ? 'a-ok' : 'a-error'} role="status">{msg.text}</p>}
        <div className="ed__actions">
          <button className="a-btn a-btn--primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar peça'}</button>
          {!isNew && <a className="a-btn" href={pieceUrl(form)} target="_blank" rel="noopener">Ver no site ↗</a>}
        </div>
      </div>
    </form>
  )
}

function TagInput({ label, value, onChange, options }: { label: string; value: string[]; onChange: (v: string[]) => void; options: string[] }) {
  const [t, setT] = useState('')
  const listId = `dl-${slugify(label)}`
  const add = () => {
    const v = t.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setT('')
  }
  return (
    <div>
      <span className="ed__lbl">{label}</span>
      <div className="a-tags">
        {value.map((v) => (
          <span key={v} className="a-tag">{v} <button type="button" aria-label={`Remover ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}>×</button></span>
        ))}
        <input list={listId} value={t} placeholder="Adicionar e Enter" onChange={(e) => setT(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} onBlur={add} aria-label={label} />
        <datalist id={listId}>{options.map((o) => <option key={o} value={o} />)}</datalist>
      </div>
    </div>
  )
}
