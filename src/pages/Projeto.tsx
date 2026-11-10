import { Link, useParams } from 'react-router-dom'
import { getProject } from '../lib/api'
import { PROJECT_STATUS, byPosition, coverOf } from '../lib/format'
import type { Project } from '../lib/types'
import { PieceCard } from '../components/PieceCard'
import { Img, LoadError, useAsync, useMeta } from '../components/ui'
import NotFound from './NotFound'

export default function Projeto() {
  const { slug = '' } = useParams()
  const { data, error, loading } = useAsync(() => getProject(slug), [slug])
  useMeta(data?.title, data?.short_description ?? undefined)
  if (loading) return <div className="page"><div className="skeleton skeleton--hero" /></div>
  if (error) return <div className="page"><LoadError message={error} /></div>
  if (!data) return <NotFound />
  return <ProjectView project={data} />
}

function ProjectView({ project }: { project: Project }) {
  const images = byPosition(project.project_images)
  const cover = coverOf(images)
  const gallery = images.filter((i) => i !== cover)
  const credits = byPosition(project.project_credits).filter((c) => c.name)
  const pieces = byPosition(project.project_pieces).map((pp) => pp.pieces).filter(Boolean)
  const meta: [string, string | null | undefined][] = [
    ['Artista', project.artist],
    ['Stylist', project.stylist],
    ['Categoria', project.category],
    ['Ano', project.project_date],
  ]

  return (
    <article className="page project">
      {project.status !== 'published' && (
        <div className="preview-bar" role="status">
          Pré-visualização — {PROJECT_STATUS[project.status]}. Visível apenas para administradores.{' '}
          <Link to={`/admin/projetos/${project.id}`}>Voltar ao editor</Link>
        </div>
      )}
      <nav className="crumbs" aria-label="Caminho">
        <Link to="/projetos">Projetos</Link> / {project.title}
      </nav>
      <header className="project__head">
        <h1 className="page-title">{project.title}</h1>
        <dl className="project__meta">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      </header>

      {cover && (
        <figure className="project__cover">
          <Img image={cover} sizes="100vw" eager />
          {cover.caption && <figcaption>{cover.caption}</figcaption>}
        </figure>
      )}

      {(project.short_description || project.body) && (
        <div className="project__text">
          {project.short_description && <p className="lead">{project.short_description}</p>}
          {project.body?.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="gallery">
          {gallery.map((im) => (
            <figure key={im.id ?? im.path} className={im.width > im.height ? 'gallery__wide' : ''}>
              <Img image={im} sizes={im.width > im.height ? '100vw' : '(max-width: 700px) 100vw, 50vw'} />
              {im.caption && <figcaption>{im.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {credits.length > 0 && (
        <section className="credits" aria-labelledby="h-cred">
          <h2 id="h-cred" className="section-title">Créditos</h2>
          <dl>
            {credits.map((c, i) => (
              <div key={c.id ?? i}>
                <dt>{c.role || '—'}</dt>
                <dd>{c.name}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {pieces.length > 0 && (
        <section aria-labelledby="h-pecas">
          <h2 id="h-pecas" className="section-title">Peças usadas</h2>
          <div className="grid grid--4">
            {pieces.map((p) => (
              <PieceCard key={p!.id} piece={p!} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
