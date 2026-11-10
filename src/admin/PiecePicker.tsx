import { useEffect, useMemo, useState } from 'react'
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { adminListPieces } from '../lib/api'
import { STATUS, byPosition, categoryLabel, slugify } from '../lib/format'
import { imageUrl } from '../lib/supabase'
import type { Piece } from '../lib/types'

/** Pesquisa e seleção de peças do acervo para vincular ao projeto (por ID, nunca por semelhança). */
export function PiecePicker({ value, onChange }: { value: Piece[]; onChange: (v: Piece[]) => void }) {
  const [all, setAll] = useState<Piece[]>([])
  const [q, setQ] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  useEffect(() => {
    adminListPieces().then(setAll, () => setAll([]))
  }, [])

  const chosen = new Set(value.map((p) => p.id))
  const results = useMemo(() => {
    const t = slugify(q)
    if (!t) return []
    return all.filter((p) => !chosen.has(p.id) && (slugify(p.name).includes(t) || p.code.toLowerCase().includes(t.replace(/-/g, '')) || slugify(p.code).includes(t))).slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, all, value])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onChange(arrayMove(value, value.findIndex((x) => x.id === active.id), value.findIndex((x) => x.id === over.id)))
  }

  return (
    <div className="pp">
      <input
        type="search"
        className="a-search"
        placeholder="Buscar peça por nome ou código (ex.: jaqueta, GM-0012)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Buscar peça do acervo"
      />
      {results.length > 0 && (
        <ul className="pp__results" role="listbox">
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => { onChange([...value, p]); setQ('') }}>
                <PieceThumb p={p} />
                <span><b>{p.name}</b> <small>{p.code} · {categoryLabel(p.category)}</small></span>
                <span className="pp__add">+ Adicionar</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q && results.length === 0 && <p className="a-hint">Nenhuma peça encontrada.</p>}

      {value.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={value.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ol className="pp__chosen">
              {value.map((p) => (
                <Chosen key={p.id} p={p} onRemove={() => onChange(value.filter((x) => x.id !== p.id))} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="a-hint">Nenhuma peça vinculada.</p>
      )}
    </div>
  )
}

function PieceThumb({ p }: { p: Piece }) {
  const img = byPosition(p.piece_images)[0]
  return <span className="pp__thumb">{img && <img src={imageUrl(img.thumb || img.path)} alt="" />}</span>
}

function Chosen({ p, onRemove }: { p: Piece; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: p.id })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-testid="chosen-piece">
      <span className="a-handle" {...attributes} {...listeners} aria-label={`Reordenar ${p.name}`}>⋮⋮</span>
      <PieceThumb p={p} />
      <span className="pp__name"><b>{p.name}</b> <small>{p.code} · {STATUS[p.status].label}{!p.is_published && ' · não publicada'}</small></span>
      <button type="button" className="a-link danger" onClick={onRemove}>Remover</button>
    </li>
  )
}
