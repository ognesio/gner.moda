import { projetos } from '../data/content'
import { listPublishedProjects } from '../lib/api'
import { ProjectRow } from '../components/ProjectRow'
import { LoadError, Star, useAsync, useMeta } from '../components/ui'

export default function Projetos() {
  useMeta('Projetos', projetos.abertura)
  const { data, error, loading } = useAsync(listPublishedProjects, [])
  return (
    <div className="page">
      <Star className="star--corner" />
      <header className="page-head">
        <h1 className="page-title">Projetos</h1>
        <p className="lead">{projetos.abertura}</p>
      </header>
      {error && <LoadError message={error} />}
      <div className="plist">
        {loading && Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton skeleton--row" />)}
        {data?.map((p) => <ProjectRow key={p.id} project={p} />)}
        {data && data.length === 0 && <p className="muted">Novos projetos em breve.</p>}
      </div>
    </div>
  )
}
