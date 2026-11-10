import { useRef, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { imageUrl } from '../lib/supabase'
import type { ImageRef } from '../lib/types'
import { uploadImage } from './images'

type Item = ImageRef & { id: string }

/**
 * Gerenciador visual de fotos: upload múltiplo, prévia, arrastar para ordenar,
 * definir capa, trocar, remover, texto alternativo e legenda.
 */
export function GalleryManager({
  items,
  onChange,
  folder,
  withCover = true,
  withCaption = true,
}: {
  items: Item[]
  onChange: (items: Item[]) => void
  folder: string
  withCover?: boolean
  withCaption?: boolean
}) {
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  // estado mais recente para uploads em sequência
  const latest = useRef(items)
  latest.current = items

  async function addFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (!list.length) return
    setErrors([])
    setBusy({ done: 0, total: list.length })
    const errs: string[] = []
    for (const [i, f] of list.entries()) {
      try {
        const img = (await uploadImage(folder, f)) as Item
        const next = [...latest.current, img]
        latest.current = next
        onChange(next)
      } catch (e) {
        errs.push((e as Error).message)
      }
      setBusy({ done: i + 1, total: list.length })
    }
    setBusy(null)
    setErrors(errs)
  }

  async function replace(index: number, file: File) {
    setBusy({ done: 0, total: 1 })
    try {
      const img = (await uploadImage(folder, file)) as Item
      const old = latest.current[index]
      const next = latest.current.map((x, i) => (i === index ? { ...img, alt: old.alt, caption: old.caption, is_cover: old.is_cover } : x))
      onChange(next)
    } catch (e) {
      setErrors([(e as Error).message])
    }
    setBusy(null)
  }

  const update = (index: number, patch: Partial<Item>) => onChange(items.map((x, i) => (i === index ? { ...x, ...patch } : x)))
  const setCover = (index: number) => onChange(items.map((x, i) => ({ ...x, is_cover: i === index })))
  const remove = (index: number) => {
    if (!confirm('Remover esta foto? O arquivo é apagado quando você salvar.')) return
    onChange(items.filter((_, i) => i !== index))
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((x) => x.id === active.id)
    const to = items.findIndex((x) => x.id === over.id)
    onChange(arrayMove(items, from, to))
  }
  const hasCover = items.some((x) => x.is_cover)

  return (
    <div className="gm">
      <div
        className={`gm__drop${drag ? ' gm__drop--on' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <p>
          Arraste fotos para cá ou{' '}
          <button type="button" className="a-link" onClick={() => input.current?.click()} disabled={!!busy}>
            escolha arquivos
          </button>
        </p>
        <small>JPG, PNG, WebP ou HEIC convertido. As fotos são reduzidas automaticamente (até 2000 px) antes do envio.</small>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          data-testid="gallery-input"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {busy && (
          <p className="gm__progress" role="status">
            Enviando {busy.done}/{busy.total}…
          </p>
        )}
        {errors.map((e) => (
          <p key={e} className="a-error" role="alert">
            {e}
          </p>
        ))}
      </div>

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((x) => x.id)} strategy={rectSortingStrategy}>
            <ol className="gm__list">
              {items.map((it, i) => (
                <Tile
                  key={it.id}
                  item={it}
                  index={i}
                  isCover={withCover && (it.is_cover || (!hasCover && i === 0))}
                  withCover={withCover}
                  withCaption={withCaption}
                  onCover={() => setCover(i)}
                  onRemove={() => remove(i)}
                  onReplace={(f) => replace(i, f)}
                  onUpdate={(p) => update(i, p)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      {items.length > 1 && <p className="a-hint">Arraste pelas fotos para mudar a ordem (ou use Tab + Espaço + setas).</p>}
    </div>
  )
}

function Tile({
  item, index, isCover, withCover, withCaption, onCover, onRemove, onReplace, onUpdate,
}: {
  item: Item
  index: number
  isCover: boolean
  withCover: boolean
  withCaption: boolean
  onCover: () => void
  onRemove: () => void
  onReplace: (f: File) => void
  onUpdate: (p: Partial<Item>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const rep = useRef<HTMLInputElement>(null)
  return (
    <li
      ref={setNodeRef}
      className={`gm__tile${isDragging ? ' gm__tile--drag' : ''}${isCover ? ' gm__tile--cover' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-testid="gallery-tile"
    >
      <div className="gm__thumb" {...attributes} {...listeners} aria-label={`Foto ${index + 1}. Arraste para reordenar.`}>
        <img src={imageUrl(item.thumb || item.path)} alt="" />
        <span className="gm__n">{index + 1}</span>
        {isCover && <span className="gm__cover">Capa</span>}
        <span className="gm__dim">{item.width}×{item.height}</span>
      </div>
      <div className="gm__actions">
        {withCover && !isCover && (
          <button type="button" onClick={onCover}>★ Definir capa</button>
        )}
        <button type="button" onClick={() => rep.current?.click()}>Trocar</button>
        <button type="button" className="danger" onClick={onRemove}>Remover</button>
        <input ref={rep} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onReplace(e.target.files[0])} />
      </div>
      <input className="gm__field" placeholder="Texto alternativo (descreva a foto)" value={item.alt ?? ''} onChange={(e) => onUpdate({ alt: e.target.value })} aria-label="Texto alternativo" />
      {withCaption && (
        <input className="gm__field" placeholder="Legenda (opcional)" value={item.caption ?? ''} onChange={(e) => onUpdate({ caption: e.target.value })} aria-label="Legenda" />
      )}
    </li>
  )
}
