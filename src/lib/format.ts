import { site } from '../config/site'
import type { ImageRef, Piece, PieceCategory, PieceStatus, Project } from './types'

export const CATEGORIES: { value: PieceCategory; label: string }[] = [
  { value: 'superior', label: 'Superior' },
  { value: 'inferior', label: 'Inferior' },
  { value: 'conjuntos', label: 'Conjuntos' },
  { value: 'externas', label: 'Externas' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'calcados', label: 'Calçados' },
]
export const categoryLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c

export const STATUS: Record<PieceStatus, { label: string; available: boolean }> = {
  disponivel: { label: 'Disponível', available: true },
  sob_consulta: { label: 'Sob consulta', available: true },
  reservada: { label: 'Reservada', available: false },
  alugada: { label: 'Alugada', available: false },
}

export const PROJECT_STATUS = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
} as const

const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único']
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b)
    if (ia >= 0 && ib >= 0) return ia - ib
    if (ia >= 0) return -1
    if (ib >= 0) return 1
    return a.localeCompare(b, 'pt-BR', { numeric: true })
  })
}
export const sizeLabel = (sizes: string[]) => (sizes.length ? sortSizes(sizes).join('/') : '')

export function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const pieceUrl = (p: Pick<Piece, 'slug'>) => `/acervo/${p.slug}`
export const projectUrl = (p: Pick<Project, 'slug'>) => `/projetos/${p.slug}`

export function coverOf(images: ImageRef[] = []): ImageRef | undefined {
  const sorted = [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  return sorted.find((i) => i.is_cover) ?? sorted[0]
}
export const byPosition = <T extends { position?: number }>(xs: T[] = []) =>
  [...xs].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

// ---------- WhatsApp -------------------------------------------------
export const waLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

export const waGeneral = () =>
  waLink('Olá, Gner! Vim pelo site GNER.MODA e gostaria de mais informações.')

export interface RentalRequest {
  nome?: string
  retirada?: string
  devolucao?: string
}

const fmtDate = (d?: string) => (d ? d.split('-').reverse().join('/') : '')

export function waPiece(p: Piece, req: RentalRequest = {}) {
  const link = `${site.domain}${pieceUrl(p)}`
  const tam = sizeLabel(p.sizes)
  const available = STATUS[p.status].available
  let msg = available
    ? `Olá, Gner! Tenho interesse em consultar a disponibilidade da peça ${p.name}, código ${p.code}${tam ? `, tamanho ${tam}` : ''}. Encontrei a peça no seu site: ${link}`
    : `Olá, Gner! Vi que a peça ${p.name}, código ${p.code}${tam ? `, tamanho ${tam}` : ''}, está indisponível no momento. Pode me avisar quando ela voltar? Link: ${link}`
  const extra = [
    req.nome && `Nome: ${req.nome}`,
    req.retirada && `Retirada: ${fmtDate(req.retirada)}`,
    req.devolucao && `Devolução: ${fmtDate(req.devolucao)}`,
  ].filter(Boolean)
  if (extra.length) msg += '\n\n' + extra.join('\n')
  return waLink(msg)
}
