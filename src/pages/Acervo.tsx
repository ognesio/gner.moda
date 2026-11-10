import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { acervo } from '../data/content'
import { listPieces } from '../lib/api'
import { CATEGORIES, sortSizes, waGeneral } from '../lib/format'
import type { Piece } from '../lib/types'
import { PieceCard } from '../components/PieceCard'
import { Arrow, LoadError, Star, WhatsIcon, useAsync, useMeta } from '../components/ui'

type Key = 'cat' | 'tam' | 'cor' | 'mat' | 'disp'

export default function Acervo() {
  useMeta('Acervo', acervo.abertura)
  const { data, error, loading } = useAsync(listPieces, [])
  const [params, setParams] = useSearchParams()
  const f = {
    cat: params.get('cat') ?? '',
    tam: params.get('tam') ?? '',
    cor: params.get('cor') ?? '',
    mat: params.get('mat') ?? '',
    disp: params.get('disp') === '1',
  }
  const [more, setMore] = useState(Boolean(f.cor || f.mat))

  const set = (k: Key, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }
  const clear = () => setParams(new URLSearchParams(), { replace: true })

  const pieces = useMemo(() => data ?? [], [data])
  const options = useMemo(() => {
    const uniq = (get: (p: Piece) => string[]) => [...new Set(pieces.flatMap(get))]
    return {
      sizes: sortSizes(uniq((p) => p.sizes)),
      colors: uniq((p) => p.colors).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      materials: uniq((p) => p.materials).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    }
  }, [pieces])

  const result = pieces.filter(
    (p) =>
      (!f.cat || p.category === f.cat) &&
      (!f.tam || p.sizes.includes(f.tam)) &&
      (!f.cor || p.colors.includes(f.cor)) &&
      (!f.mat || p.materials.includes(f.mat)) &&
      (!f.disp || p.status === 'disponivel'),
  )
  const active = Boolean(f.cat || f.tam || f.cor || f.mat || f.disp)

  return (
    <div className="page">
      <Star className="star--corner" />
      <header className="page-head">
        <h1 className="page-title">Acervo</h1>
        <p className="lead">{acervo.abertura}</p>
      </header>

      <div className="filters" role="group" aria-label="Filtros do acervo">
        <div className="tabs" role="radiogroup" aria-label="Categoria">
          <Chip on={!f.cat} onClick={() => set('cat', '')} kind="tab">
            Todas
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.value} on={f.cat === c.value} onClick={() => set('cat', c.value)} kind="tab">
              {c.label}
            </Chip>
          ))}
        </div>

        <div className="filters__row">
          <div className="chips" role="radiogroup" aria-label="Tamanho">
            <span className="filters__label">Tamanho</span>
            <Chip on={!f.tam} onClick={() => set('tam', '')}>
              Todos
            </Chip>
            {options.sizes.map((s) => (
              <Chip key={s} on={f.tam === s} onClick={() => set('tam', s)}>
                {s}
              </Chip>
            ))}
          </div>
          <label className="switch">
            <input type="checkbox" checked={f.disp} onChange={(e) => set('disp', e.target.checked ? '1' : '')} />
            <span>Só disponíveis</span>
          </label>
          <button className="linkbtn" aria-expanded={more} onClick={() => setMore((m) => !m)}>
            {more ? 'Menos filtros' : 'Mais filtros'}
          </button>
        </div>

        {more && (
          <div className="filters__more">
            <div className="chips" role="radiogroup" aria-label="Cor">
              <span className="filters__label">Cor</span>
              <Chip on={!f.cor} onClick={() => set('cor', '')}>
                Todas
              </Chip>
              {options.colors.map((c) => (
                <Chip key={c} on={f.cor === c} onClick={() => set('cor', c)}>
                  {c}
                </Chip>
              ))}
            </div>
            <div className="chips" role="radiogroup" aria-label="Tecido ou material">
              <span className="filters__label">Tecido</span>
              <Chip on={!f.mat} onClick={() => set('mat', '')}>
                Todos
              </Chip>
              {options.materials.map((m) => (
                <Chip key={m} on={f.mat === m} onClick={() => set('mat', m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="filters__status" aria-live="polite">
          {!loading && (
            <span>
              {result.length} {result.length === 1 ? 'peça' : 'peças'}
            </span>
          )}
          {active && (
            <button className="linkbtn" onClick={clear}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {error && <LoadError message={error} />}
      <div className="grid grid--3">
        {loading && Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton skeleton--card" />)}
        {result.map((p) => (
          <PieceCard key={p.id} piece={p} />
        ))}
      </div>
      {!loading && !error && result.length === 0 && (
        <div className="empty">
          <p>{acervo.vazio}</p>
          <button className="btn" onClick={clear}>
            <span>Limpar filtros</span>
            <Arrow />
          </button>
        </div>
      )}

      <div className="center">
        <a className="btn" href={waGeneral()} target="_blank" rel="noopener noreferrer">
          <WhatsIcon />
          <span>Entre em contato pelo WhatsApp</span>
          <Arrow />
        </a>
      </div>
    </div>
  )
}

function Chip({ on, onClick, children, kind = 'chip' }: { on: boolean; onClick: () => void; children: React.ReactNode; kind?: 'chip' | 'tab' }) {
  return (
    <button type="button" role="radio" aria-checked={on} className={`${kind}${on ? ` ${kind}--on` : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}
