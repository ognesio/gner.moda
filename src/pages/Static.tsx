import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { contato, fotos, referenciasAbertura, sobreMim } from '../data/content'
import { waGeneral } from '../lib/format'
import { ButtonLink, Img, Rich, Star, WhatsIcon, staticImg, useMeta } from '../components/ui'
import { RefGrid } from './Home'

export function SobreMim() {
  useMeta('Sobre mim', sobreMim.subtitulo)
  return (
    <div className="page about">
      <Star className="star--about" />
      <header className="page-head">
        <h1 className="page-title">{sobreMim.titulo}</h1>
        <p className="kicker">{sobreMim.subtitulo}</p>
      </header>
      <div className="about__grid">
        <div className="about__text">
          {sobreMim.paragrafos.map((p, i) => (
            <p key={i}>
              <Rich text={p} />
            </p>
          ))}
          <p className="about__end">
            <Rich text={sobreMim.fecho} />
          </p>
        </div>
        <div className="about__photos">
          {fotos.sobre.map((f) => (
            <Img key={f.src} image={staticImg(f.src, f.w, f.h, f.alt)} sizes="(max-width: 900px) 50vw, 25vw" className="bw" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Referencias() {
  useMeta('Referências', referenciasAbertura)
  return (
    <div className="page">
      <Star className="star--corner" />
      <header className="page-head">
        <h1 className="page-title">Referências</h1>
        <p className="lead">{referenciasAbertura}</p>
      </header>
      <RefGrid />
    </div>
  )
}

export function Contato() {
  useMeta('Contato', contato.abertura)
  return (
    <div className="page contact">
      <Star className="star--corner" />
      <header className="page-head">
        <h1 className="page-title">Contato</h1>
        <p className="lead">{contato.abertura}</p>
      </header>
      <p className="handle handle--big">
        <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer">
          @{site.instagram}
        </a>
      </p>
      <div className="btn-row">
        <a className="btn" href={`mailto:${site.email}`}>
          <span>Enviar e-mail ({site.email})</span>
        </a>
        <a className="btn btn--solid" href={waGeneral()} target="_blank" rel="noopener noreferrer">
          <WhatsIcon /> <span>WhatsApp</span>
        </a>
      </div>
    </div>
  )
}

export default function NotFoundPage() {
  useMeta('Página não encontrada')
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">404</h1>
        <p className="lead">Esta página não existe ou não está publicada.</p>
      </header>
      <div className="btn-row">
        <ButtonLink to="/acervo">Ver o acervo</ButtonLink>
        <Link className="tlink" to="/">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
