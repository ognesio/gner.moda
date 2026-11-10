import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { imageUrl } from '../lib/supabase'
import type { ImageRef, PieceStatus } from '../lib/types'
import { STATUS } from '../lib/format'
import { site } from '../config/site'

/** Logo: troque o arquivo public/logo.svg pelo logo oficial. */
export function Logo({ invert = false }: { invert?: boolean }) {
  return <img src="/logo.svg" alt={site.name} className={`logo${invert ? ' logo--invert' : ''}`} width={160} height={40} />
}

/** Estrela/swoosh vermelho — elemento gráfico da identidade. */
export function Star({ className = '' }: { className?: string }) {
  return (
    <svg className={`star ${className}`} viewBox="0 0 400 200" aria-hidden="true" focusable="false">
      <path d="M200 0C206 70 228 92 400 100C228 108 206 130 200 200C194 130 172 108 0 100C172 92 194 70 200 0Z" />
    </svg>
  )
}

export const Arrow = () => <span className="arrow" aria-hidden="true">→</span>

/** Imagem com proporção reservada (sem “pulo” de layout). `src` aceita caminho do Storage ou /static sem extensão. */
export function Img({
  image,
  sizes = '100vw',
  className = '',
  eager = false,
  alt,
}: {
  image: Pick<ImageRef, 'path' | 'thumb' | 'width' | 'height' | 'alt'>
  sizes?: string
  className?: string
  eager?: boolean
  alt?: string
}) {
  const big = imageUrl(image.path)
  const small = image.thumb ? imageUrl(image.thumb) : null
  return (
    <img
      className={className}
      src={big}
      srcSet={small ? `${small} 800w, ${big} ${Math.max(image.width, 801)}w` : undefined}
      sizes={small ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt ?? image.alt ?? ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

/** Atalho para imagens estáticas do site (/static/x → x.webp e x-sm.webp). */
export const staticImg = (src: string, w: number, h: number, alt = ''): ImageRef => ({
  path: `${src}.webp`,
  thumb: `${src}-sm.webp`,
  width: w,
  height: h,
  alt,
})

export function StatusBadge({ status }: { status: PieceStatus }) {
  const s = STATUS[status]
  return <span className={`badge badge--${status}${s.available ? '' : ' badge--off'}`}>{s.label}</span>
}

export function ButtonLink({ to, children, external = false }: { to: string; children: ReactNode; external?: boolean }) {
  return external ? (
    <a className="btn" href={to} target="_blank" rel="noopener noreferrer">
      <span>{children}</span>
      <Arrow />
    </a>
  ) : (
    <Link className="btn" to={to}>
      <span>{children}</span>
      <Arrow />
    </Link>
  )
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="tlink" to={to}>
      {children} <Arrow />
    </Link>
  )
}

export const WhatsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
  </svg>
)

/** Renderiza *trechos* em itálico (marcação usada no texto do Sobre mim). */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g)
  return (
    <>
      {parts.map((p, i) => (p.startsWith('*') && p.endsWith('*') ? <em key={i}>{p.slice(1, -1)}</em> : <span key={i}>{p}</span>))}
    </>
  )
}

/** Carregamento simples de dados com estado de erro. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fn().then(
      (data) => alive && setState({ data, loading: false }),
      (e: Error) => alive && setState({ error: e.message, loading: false }),
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}

export function LoadError({ message }: { message: string }) {
  return (
    <p className="state-msg" role="alert">
      Não foi possível carregar o conteúdo agora. Tente novamente em instantes.
      <small>{message}</small>
    </p>
  )
}

/** Título da aba + meta description no navegador (os robôs de prévia recebem isso pelo Netlify). */
export function useMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.name} — Acervo, projetos e referências`
    const d = document.querySelector('meta[name="description"]')
    if (d) d.setAttribute('content', description || site.description)
  }, [title, description])
}
