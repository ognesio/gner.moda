import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../config/site'
import { waGeneral } from '../lib/format'
import { Logo } from './ui'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/acervo', label: 'Acervo' },
  { to: '/projetos', label: 'Projetos' },
  { to: '/sobre-mim', label: 'Sobre mim' },
  { to: '/referencias', label: 'Referências' },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="header">
        <Link to="/" className="header__logo" aria-label={`${site.name} — início`}>
          <Logo />
        </Link>
        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Fechar' : 'Menu'}
        </button>
        <nav id="menu" className={`nav${open ? ' nav--open' : ''}`} aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="nav__link">
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <Logo invert />
        <div className="footer__cols">
          <div>
            <h2 className="footer__title">Explore</h2>
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/contato">Contato</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer__title">Contact</h2>
            <ul>
              <li>
                <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer">
                  @{site.instagram}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={waGeneral()} target="_blank" rel="noopener noreferrer">
                  WhatsApp — {site.whatsappLabel}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="footer__legal">© {new Date().getFullYear()} GNER.MODA — ALL RIGHTS RESERVED</p>
    </footer>
  )
}
