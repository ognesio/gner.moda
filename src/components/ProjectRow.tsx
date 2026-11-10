import { Link } from 'react-router-dom'
import { coverOf, projectUrl } from '../lib/format'
import type { Project } from '../lib/types'
import { Arrow, Img } from './ui'

/** Linha editorial da lista de projetos (imagem + título + descrição + Ver projeto →). */
export function ProjectRow({ project }: { project: Project }) {
  const cover = coverOf(project.project_images)
  return (
    <article className="prow">
      <Link to={projectUrl(project)} className="prow__media" tabIndex={-1} aria-hidden="true">
        {cover && <Img image={cover} sizes="(max-width: 700px) 100vw, 40vw" className="bw-hover" alt="" />}
      </Link>
      <div className="prow__text">
        <h3 className="prow__title">
          <Link to={projectUrl(project)}>{project.title}</Link>
        </h3>
        {(project.artist || project.category) && (
          <p className="prow__meta">{[project.artist, project.category, project.project_date].filter(Boolean).join(' · ')}</p>
        )}
        {project.short_description && <p className="prow__desc">{project.short_description}</p>}
        <Link to={projectUrl(project)} className="tlink tlink--red">
          Ver projeto <Arrow />
        </Link>
      </div>
    </article>
  )
}
