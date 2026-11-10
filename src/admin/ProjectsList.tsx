import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { adminListProjects, updateRow } from '../lib/api'
import { PROJECT_STATUS, coverOf, projectUrl } from '../lib/format'
import { imageUrl } from '../lib/supabase'
import type { Project, ProjectStatus } from '../lib/types'

export default function ProjectsList() {
  const [items, setItems] = useState<Project[] | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'all' | ProjectStatus>('all')
  const [q, setQ] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const load = () => adminListProjects().then(setItems, (e: Error) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  if (error) return <p className="a-error">{error}</p>
  if (!items) return <p>Carregando…</p>

  const term = q.trim().toLowerCase()
  const visible = items.filter(
    (p) =>
      (tab === 'all' || p.status === tab) &&
      (!term || [p.title, p.artist, p.code, p.stylist].some((v) => v?.toLowerCase().includes(term))),
  )
  const canSort = tab === 'all' && !term
  const count = (s: ProjectStatus) => items.filter((p) => p.status === s).length

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id || !items) return
    const next = arrayMove(items, items.findIndex((x) => x.id === active.id), items.findIndex((x) => x.id === over.id))
    setItems(next.map((p, i) => ({ ...p, sort_order: i })))
    try {
      await Promise.all(next.map((p, i) => (p.sort_order !== i ? updateRow('projects', p.id, { sort_order: i }) : null)))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function toggleFeatured(p: Project) {
    setItems(items!.map((x) => (x.id === p.id ? { ...x, featured_home: !x.featured_home } : x)))
    await updateRow('projects', p.id, { featured_home: !p.featured_home }).catch((e) => setError(e.message))
  }

  return (
    <section>
      <div className="a-head">
        <h1>Projetos &amp; Cases</h1>
        <Link className="a-btn a-btn--primary" to="/admin/projetos/novo">+ Novo projeto</Link>
      </div>
      <div className="a-toolbar">
        <div className="a-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>Todos ({items.length})</button>
          {(['draft', 'published', 'archived'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}>
              {PROJECT_STATUS[s]} ({count(s)})
            </button>
          ))}
        </div>
        <input className="a-search" type="search" placeholder="Buscar por nome, artista ou código" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {canSort && items.length > 1 && <p className="a-hint">Arraste as linhas (⋮⋮) para definir a ordem de exibição no site.</p>}

      {visible.length === 0 ? (
        <p className="a-empty">Nenhum projeto aqui ainda.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={visible.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="a-rows">
              {visible.map((p) => (
                <Row key={p.id} p={p} sortable={canSort} onFeatured={() => toggleFeatured(p)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  )
}

function Row({ p, sortable, onFeatured }: { p: Project; sortable: boolean; onFeatured: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: p.id, disabled: !sortable })
  const cover = coverOf(p.project_images)
  return (
    <li ref={setNodeRef} className="a-row" style={{ transform: CSS.Transform.toString(transform), transition }}>
      {sortable && <span className="a-handle" {...attributes} {...listeners} aria-label={`Reordenar ${p.title}`}>⋮⋮</span>}
      <div className="a-row__img">{cover && <img src={imageUrl(cover.thumb || cover.path)} alt="" />}</div>
      <div className="a-row__main">
        <Link to={`/admin/projetos/${p.id}`} className="a-row__title">{p.title}</Link>
        <span className="a-row__sub">
          {p.code} · {[p.artist, p.category].filter(Boolean).join(' · ') || 'sem artista'}
          {p.is_test && ' · TESTE'}
        </span>
      </div>
      <span className={`a-pill a-pill--${p.status}`}>{PROJECT_STATUS[p.status]}</span>
      <button className={`a-star${p.featured_home ? ' a-star--on' : ''}`} onClick={onFeatured} title="Destaque na página inicial" aria-pressed={p.featured_home}>
        ★
      </button>
      <div className="a-row__links">
        <Link to={`/admin/projetos/${p.id}`}>Editar</Link>
        <a href={projectUrl(p)} target="_blank" rel="noopener">{p.status === 'published' ? 'Ver' : 'Prévia'} ↗</a>
      </div>
    </li>
  )
}
