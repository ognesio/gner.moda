import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Acervo from './pages/Acervo'
import Peca from './pages/Peca'
import Projetos from './pages/Projetos'
import Projeto from './pages/Projeto'
import NotFound, { Contato, Referencias, SobreMim } from './pages/Static'

// O painel é carregado à parte: visitantes não baixam esse código.
const Admin = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p className="state-msg">Carregando painel…</p>}>
              <Admin />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="acervo" element={<Acervo />} />
          <Route path="acervo/:slug" element={<Peca />} />
          <Route path="projetos" element={<Projetos />} />
          <Route path="projetos/:slug" element={<Projeto />} />
          <Route path="sobre-mim" element={<SobreMim />} />
          <Route path="referencias" element={<Referencias />} />
          <Route path="contato" element={<Contato />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
