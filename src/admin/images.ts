import { supabase } from '../lib/supabase'
import { supabaseConfig } from '../config/site'
import type { ImageRef } from '../lib/types'

const BIG = 2000
const SMALL = 800

async function encode(bitmap: ImageBitmap, max: number): Promise<{ blob: Blob; w: number; h: number }> {
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  // WebP quando o navegador suporta; senão JPEG (ex.: Safari antigo).
  let blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.82))
  if (!blob || blob.type !== 'image/webp') blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Não foi possível processar a imagem.')
  return { blob, w, h }
}

/** Reduz a foto no navegador (2000 px e 800 px), envia ao Storage e devolve a referência pronta para salvar. */
export async function uploadImage(folder: string, file: File): Promise<ImageRef> {
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" não é uma imagem.`)
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const big = await encode(bitmap, BIG)
  const small = await encode(bitmap, SMALL)
  bitmap.close?.()
  const id = crypto.randomUUID()
  const ext = big.blob.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${folder}/${id}.${ext}`
  const thumb = `${folder}/${id}-sm.${ext}`
  const bucket = supabase.storage.from(supabaseConfig.bucket)
  const opts = { contentType: big.blob.type, cacheControl: '31536000', upsert: false }
  const a = await bucket.upload(path, big.blob, opts)
  if (a.error) throw new Error(`Falha ao enviar ${file.name}: ${a.error.message}`)
  const b = await bucket.upload(thumb, small.blob, opts)
  if (b.error) throw new Error(`Falha ao enviar ${file.name}: ${b.error.message}`)
  return { id, path, thumb, width: big.w, height: big.h, alt: '', caption: '' }
}

/** Apaga do Storage os arquivos que deixaram de ser usados (fotos iniciais em /static não são tocadas). */
export async function removeFiles(paths: string[] = []) {
  const files = paths.filter((p) => p && !p.startsWith('/') && !p.startsWith('http'))
  if (files.length) await supabase.storage.from(supabaseConfig.bucket).remove(files)
}
