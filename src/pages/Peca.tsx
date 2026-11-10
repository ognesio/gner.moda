import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { acervo } from '../data/content'
import { getPiece } from '../lib/api'
import { imageUrl } from '../lib/supabase'
import { STATUS, byPosition, categoryLabel, projectUrl, sizeLabel, waPiece } from '../lib/format'
import type { Piece } from '../lib/types'
import { Arrow, Img, LoadError, StatusBadge, WhatsIcon, useAsync, useMeta } from '../components/ui'
import NotFound from './NotFound'

export default function Peca() {
  const { slug = '' } = useParams()
  const { data, error, loading } = useAsync(() => getPiece(slug), [slug])
  useMeta(data?.name, data ? `${data.name} · ${data.code} — ${categoryLabel(data.category)}. Acervo GNER.MODA para locação.` : undefined)

  if (loading) return <div className="page"><div className="skeleton skeleton--hero" /></div>
  if (error) return <div className="page"><LoadError message={error} /></div>
  if (!data) return <NotFound />
  return <PieceView piece={data} />
}

function PieceView({ piece }: { piece: Piece }) {
  const images = byPosition(piece.piece_images)
  const [current, setCurrent] = useState(0)
  const img = images[current]
  const projects = (piece.project_pieces ?? []).map((pp) => pp.projects).filter((p) => p && p.status === 'published')
  const available = STATUS[piece.status].available
  const tam = sizeLabel(piece.sizes)

  const rows: [string, string | null | undefined][] = [
    ['Categoria', categoryLabel(piece.category)],
    ['Tamanho', tam],
    ['Cor', piece.colors.join(', ')],
    ['Tecido', piece.materials.join(', ')],
    ['Medidas', piece.measurements],
    ['Condição', piece.condition],
    ['Valor', piece.price_note],
    ['Regras', acervo.regras],
  ]

  return (
    <div className="page piece">
      <nav className="crumbs" aria-label="Caminho">
        <Link to="/acervo">Acervo</Link> / <Link to={`/acervo?cat=${piece.category}`}>{categoryLabel(piece.category)}</Link>
      </nav>

      <div className="piece__grid">
        <div className="piece__gallery">
          <div className="piece__main">
            {img ? <Img image={img} sizes="(max-width: 900px) 100vw, 55vw" eager alt={img.alt || piece.name} /> : <span className="pcard__noimg">Sem foto</span>}
          </div>
          {images.length > 1 && (
            <div className="piece__thumbs" role="tablist" aria-label="Fotos da peça">
              {images.map((im, i) => (
                <button key={im.id ?? i} role="tab" aria-selected={i === current} onClick={() => setCurrent(i)}>
                  <Img image={im} sizes="120px" alt={`Foto ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
          {img && (
            <a className="tlink" href={imageUrl(img.path)} download target="_blank" rel="noopener">
              Baixar imagem <Arrow />
            </a>
          )}
        </div>

        <div className="piece__info">
          <p className="piece__code">{piece.code}</p>
          <h1 className="piece__name">{piece.name}</h1>
          <StatusBadge status={piece.status} />
          {piece.description && <p className="lead">{piece.description}</p>}

          <dl className="specs">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>

          {projects.length > 0 && (
            <p className="appears">
              <span>Aparece em:</span>{' '}
              {projects.map((p, i) => (
                <span key={p!.id}>
                  {i > 0 && ', '}
                  <Link to={projectUrl(p!)}>{p!.title}</Link>
                </span>
              ))}
            </p>
          )}

          <RequestBox piece={piece} available={available} />
        </div>
      </div>
    </div>
  )
}

function RequestBox({ piece, available }: { piece: Piece; available: boolean }) {
  const [nome, setNome] = useState('')
  const [retirada, setRetirada] = useState('')
  const [devolucao, setDevolucao] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    window.open(waPiece(piece, { nome, retirada, devolucao }), '_blank', 'noopener')
  }

  if (!available) {
    return (
      <section className="request request--off" aria-labelledby="req-title">
        <h2 id="req-title" className="request__title">Peça indisponível no momento</h2>
        <p className="muted">Ela continua no acervo. Peça para ser avisado quando voltar — sem data prometida.</p>
        <div className="btn-row">
          <a className="btn btn--solid" href={waPiece(piece)} target="_blank" rel="noopener noreferrer">
            <WhatsIcon /> <span>Avisar quando voltar</span>
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="request" aria-labelledby="req-title">
      <h2 id="req-title" className="request__title">
        {piece.status === 'disponivel' ? 'Solicitar aluguel' : 'Consultar disponibilidade'}
      </h2>
      <p className="muted">{acervo.semCheckout}</p>
      <form onSubmit={send} className="form">
        <label>
          Seu nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
        </label>
        <div className="form__2">
          <label>
            Retirada
            <input type="date" min={today} value={retirada} onChange={(e) => setRetirada(e.target.value)} />
          </label>
          <label>
            Devolução
            <input type="date" min={retirada || today} value={devolucao} onChange={(e) => setDevolucao(e.target.value)} />
          </label>
        </div>
        <div className="btn-row">
          <button className="btn btn--solid" type="submit">
            <WhatsIcon /> <span>Enviar pedido</span>
          </button>
          <a className="btn" href={waPiece(piece)} target="_blank" rel="noopener noreferrer">
            <span>Ver disponibilidade</span> <Arrow />
          </a>
        </div>
        <p className="form__hint">O pedido abre no WhatsApp com a peça, o código e o tamanho já preenchidos.</p>
      </form>
    </section>
  )
}
