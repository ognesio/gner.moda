import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListPieces, updateRow } from '../lib/api'
import { CATEGORIES, STATUS, byPosition, categoryLabel, pieceUrl, sizeLabel, slugify } from '../lib/format'
import { imageUrl } from '../lib/supabase'
import type { Piece, PieceStatus } from '../lib/types'

export default function PiecesList() {
  const [items, setItems] = useState<Piece[] | null>(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [st, setSt] = useState('')
  const [savedId, setSavedId] = useState('')

  useEffect(() => {
    adminListPieces().then(setItems, (e: Error) => setError(e.message))
  }, [])

  if (!items) return error ? <p className="a-error">{error}</p> : <p>Carregando…</p>

  async function patch(p: Piece, values: Partial<Piece>) {
    const before = items!
    setItems(items!.map((x) => (x.id === p.id ? { ...x, ...values } : x)))
    try {
      await updateRow('pieces', p.id, values)
      setSavedId(p.id)
      setTimeout(() => setSavedId((s) => (s === p.id ? '' : s)), 1500)
    } catch (e) {
      setItems(before)
      setError((e as Error).message)
    }
  }

  const t = slugify(q)
  const visible = items.filter(
    (p) => (!cat || p.category === cat) && (!st || p.status === st) && (!t || slugify(p.name).includes(t) || slugify(p.code).includes(t)),
  )

  return (
    <section>
      <div className="a-head">
        <h1>Acervo</h1>
        <Link className="a-btn a-btn--primary" to="/admin/acervo/novo">+ Nova peça</Link>
      </div>
      {error && <p className="a-error">{error}</p>}
      <div className="a-toolbar">
        <input className="a-search" type="search" placeholder="Buscar por nome ou código" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="Status">
          <option value="">Todos os status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="a-hint">{visible.length} de {items.length}</span>
      </div>
      <p className="a-hint">O status muda na hora no site — não precisa salvar.</p>
      <ul className="a-rows">
        {visible.map((p) => {
          const img = byPosition(p.piece_images)[0]
          return (
            <li key={p.id} className={`a-row${p.is_published ? '' : ' a-row--off'}`}>
              <div className="a-row__img a-row__img--piece">{img && <img src={imageUrl(img.thumb || img.path)} alt="" />}</div>
              <div className="a-row__main">
                <Link to={`/admin/acervo/${p.id}`} className="a-row__title">{p.name}</Link>
                <span className="a-row__sub">{p.code} · {categoryLabel(p.category)}{p.sizes.length ? ` · ${sizeLabel(p.sizes)}` : ''}{!p.is_published && ' · fora do site'}</span>
              </div>
              <select className={`a-status a-status--${p.status}`} value={p.status} aria-label={`Status de ${p.name}`}
                onChange={(e) => patch(p, { status: e.target.value as PieceStatus })}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <span className="a-saved" aria-live="polite">{savedId === p.id ? 'Salvo ✓' : ''}</span>
              <div className="a-row__links">
                <Link to={`/admin/acervo/${p.id}`}>Editar</Link>
                <a href={pieceUrl(p)} target="_blank" rel="noopener">Ver ↗</a>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
