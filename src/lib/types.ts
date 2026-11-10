export type PieceCategory = 'superior' | 'inferior' | 'conjuntos' | 'externas' | 'acessorios' | 'calcados'
export type PieceStatus = 'disponivel' | 'reservada' | 'alugada' | 'sob_consulta'
export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface ImageRef {
  id?: string
  path: string
  thumb?: string | null
  width: number
  height: number
  alt?: string | null
  caption?: string | null
  position?: number
  is_cover?: boolean
}

export interface ProjectRef {
  id: string
  slug: string
  title: string
  status?: ProjectStatus
}

export interface Piece {
  id: string
  code: string
  slug: string
  name: string
  category: PieceCategory
  sizes: string[]
  colors: string[]
  materials: string[]
  status: PieceStatus
  description?: string | null
  measurements?: string | null
  condition?: string | null
  price_note?: string | null
  is_published: boolean
  sort_order: number
  piece_images: ImageRef[]
  project_pieces?: { projects: ProjectRef | null }[]
}

export interface Credit {
  id?: string
  name: string
  role?: string | null
  position?: number
}

export interface Project {
  id: string
  code: string
  slug: string
  title: string
  artist?: string | null
  stylist?: string | null
  short_description?: string | null
  body?: string | null
  category?: string | null
  project_date?: string | null
  status: ProjectStatus
  published_at?: string | null
  sort_order: number
  featured_home: boolean
  is_test: boolean
  updated_at?: string
  project_images: ImageRef[]
  project_credits?: Credit[]
  project_pieces?: { position: number; pieces: Piece | null }[]
}
