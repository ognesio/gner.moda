import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isCurrentUserAdmin } from '../lib/api'
import ProjectsList from './ProjectsList'
import ProjectEditor from './ProjectEditor'
import PiecesList from './PiecesList'
import PieceEditor from './PieceEditor'
import './admin.css'

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [admin, setAdmin] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    document.title = 'Painel — GNER.MODA'
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex')
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === undefined) return
    if (!session) return setAdmin(false)
    setAdmin(undefined)
    isCurrentUserAdmin().then(setAdmin)
  }, [session])

  if (session === undefined || (session && admin === undefined)) return <p className="a-center">Carregando…</p>
  if (!session) return <Login />
  if (!admin)
    return (
      <div className="a-center a-box">
        <h1>Sem permissão</h1>
        <p>A conta {session.user.email} entrou, mas não está autorizada como administradora do site.</p>
        <button className="a-btn" onClick={() => supabase.auth.signOut()}>Sair</button>
      </div>
    )

  return (
    <div className="admin">
      <header className="a-top">
        <Link to="/admin" className="a-brand">GNER.MODA <span>painel</span></Link>
        <nav>
          <NavLink to="/admin/projetos">Projetos &amp; Cases</NavLink>
          <NavLink to="/admin/acervo">Acervo</NavLink>
          <a href="/" target="_blank" rel="noopener">Ver site ↗</a>
        </nav>
        <div className="a-user">
          <span>{session.user.email}</span>
          <button className="a-link" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </header>
      <main className="a-main">
        <Routes>
          <Route index element={<Navigate to="projetos" replace />} />
          <Route path="projetos" element={<ProjectsList />} />
          <Route path="projetos/:id" element={<ProjectEditor />} />
          <Route path="acervo" element={<PiecesList />} />
          <Route path="acervo/:id" element={<PieceEditor />} />
          <Route path="*" element={<Navigate to="projetos" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
    else nav('/admin/projetos', { replace: true })
  }

  return (
    <form className="a-center a-box a-login" onSubmit={submit}>
      <h1>GNER.MODA — painel</h1>
      <label>
        E-mail
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Senha
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="a-error" role="alert">{error}</p>}
      <button className="a-btn a-btn--primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      <Link to="/" className="a-link">← Voltar ao site</Link>
    </form>
  )
}
