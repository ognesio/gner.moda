import { Link } from 'react-router-dom'
import { byPosition, categoryLabel, pieceUrl, sizeLabel } from '../lib/format'
import type { Piece } from '../lib/types'
import { Img, StatusBadge } from './ui'

export function PieceCard({ piece }: { piece: Piece }) {
  const img = byPosition(piece.piece_images)[0]
  const tam = sizeLabel(piece.sizes)
  return (
    <Link to={pieceUrl(piece)} className="pcard">
      <div className="pcard__media">
        {img ? <Img image={img} sizes="(max-width: 700px) 50vw, 30vw" alt={piece.name} /> : <span className="pcard__noimg">Sem foto</span>}
        <StatusBadge status={piece.status} />
      </div>
      <div className="pcard__info">
        <h3 className="pcard__name">{piece.name}</h3>
        <p className="pcard__meta">
          {categoryLabel(piece.category)}
          {tam && <> · Tam. {tam}</>}
        </p>
      </div>
    </Link>
  )
}
