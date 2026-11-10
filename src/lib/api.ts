import { supabase } from './supabase'
import type { Piece, Project } from './types'

const IMG = 'id,path,thumb,width,height,alt,position'
const PIECE = `id,code,slug,name,category,sizes,colors,materials,status,description,measurements,condition,price_note,is_published,sort_order,piece_images(${IMG})`
const PROJECT_LIST = `id,code,slug,title,artist,stylist,short_description,category,project_date,status,sort_order,featured_home,is_test,updated_at,project_images(${IMG},caption,is_cover)`
const PROJECT_FULL = `${PROJECT_LIST},body,published_at,project_credits(id,name,role,position),project_pieces(position,pieces(${PIECE}))`

function check<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message)
  return r.data as T
}

// ---------- Público --------------------------------------------------
export async function listPieces(): Promise<Piece[]> {
  return check(
    await supabase.from('pieces').select(PIECE).eq('is_published', true).order('sort_order').order('code'),
  ) as unknown as Piece[]
}

export async function getPiece(slug: string): Promise<Piece | null> {
  const rows = check(
    await supabase
      .from('pieces')
      .select(`${PIECE},project_pieces(projects(id,slug,title,status))`)
      .eq('slug', slug)
      .limit(1),
  ) as unknown as Piece[]
  return rows[0] ?? null
}

export async function listPublishedProjects(): Promise<Project[]> {
  return check(
    await supabase.from('projects').select(PROJECT_LIST).eq('status', 'published').order('sort_order').order('published_at', { ascending: false }),
  ) as unknown as Project[]
}

/** Visitante só recebe projetos publicados (regra do banco). Admin logado recebe também rascunhos → pré-visualização. */
export async function getProject(slug: string): Promise<Project | null> {
  const rows = check(await supabase.from('projects').select(PROJECT_FULL).eq('slug', slug).limit(1)) as unknown as Project[]
  return rows[0] ?? null
}

// ---------- Admin ----------------------------------------------------
export async function adminListProjects(): Promise<Project[]> {
  return check(await supabase.from('projects').select(PROJECT_LIST).order('sort_order').order('updated_at', { ascending: false })) as unknown as Project[]
}

export async function adminGetProject(id: string): Promise<Project | null> {
  const rows = check(await supabase.from('projects').select(PROJECT_FULL).eq('id', id).limit(1)) as unknown as Project[]
  return rows[0] ?? null
}

export async function adminListPieces(): Promise<Piece[]> {
  return check(await supabase.from('pieces').select(PIECE).order('sort_order').order('code')) as unknown as Piece[]
}

export async function adminGetPiece(id: string): Promise<Piece | null> {
  const rows = check(
    await supabase.from('pieces').select(`${PIECE},project_pieces(projects(id,slug,title,status))`).eq('id', id).limit(1),
  ) as unknown as Piece[]
  return rows[0] ?? null
}

export interface SaveResult {
  id: string
  code: string
  slug: string
  status?: string
  removed_paths: string[]
}

export async function rpcSave(fn: 'save_project' | 'save_piece', payload: unknown): Promise<SaveResult> {
  return check(await supabase.rpc(fn, { p: payload })) as SaveResult
}

export async function updateRow(table: 'projects' | 'pieces', id: string, values: Record<string, unknown>) {
  check(await supabase.from(table).update(values).eq('id', id).select('id'))
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) return false
  const r = await supabase.from('admins').select('user_id').eq('user_id', u.user.id).limit(1)
  return !r.error && (r.data?.length ?? 0) > 0
}
