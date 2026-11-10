import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../config/site'

export const supabase = createClient(supabaseConfig.url, supabaseConfig.key, {
  auth: { persistSession: true, autoRefreshToken: true },
})

/** Endereço público de uma imagem: fotos iniciais ficam no site (/static/...), novas no Storage. */
export function imageUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('/') || path.startsWith('http')) return path
  return `${supabaseConfig.url}/storage/v1/object/public/${supabaseConfig.bucket}/${path}`
}
