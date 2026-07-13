import { getSupabaseClient } from '~/utils/supabaseClient'
import { slugify } from '~/utils/slugify'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const MIME_BY_EXTENSION = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif'
}

const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION))
const ALLOWED_EXTENSIONS = new Set(Object.keys(MIME_BY_EXTENSION))

const getFileExtension = (fileName) => {
  return String(fileName || '')
    .split('.')
    .pop()
    ?.toLowerCase()
    .trim() || ''
}

const resolveContentType = (file, extension) => {
  const browserMime = String(file?.type || '').toLowerCase()

  if (browserMime === 'image/jpg') {
    return 'image/jpeg'
  }

  if (ALLOWED_MIME_TYPES.has(browserMime)) {
    return browserMime
  }

  return MIME_BY_EXTENSION[extension] || ''
}

const createUniqueFileId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const uploadProductImage = async (
  file,
  productName,
  productId = 'new'
) => {
  if (!file) return null

  const extension = getFileExtension(file.name)
  const contentType = resolveContentType(file, extension)

  if (
    !ALLOWED_EXTENSIONS.has(extension) ||
    !ALLOWED_MIME_TYPES.has(contentType)
  ) {
    throw new Error(
      'Formato no permitido. Usa imágenes JPG, JPEG, PNG, WEBP o AVIF.'
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('La imagen no debe superar los 5 MB.')
  }

  const supabase = getSupabaseClient()

  const safeName =
    slugify(productName || file.name) ||
    'producto'

  const uniqueId = createUniqueFileId()

  const filePath =
    `products/${productId}/${safeName}-${uniqueId}.${extension}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '31536000',
      contentType,
      upsert: false
    })

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`)
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  if (!data?.publicUrl) {
    throw new Error('La imagen se subió, pero no se obtuvo su URL pública.')
  }

  return {
    publicUrl: data.publicUrl,
    storagePath: filePath
  }
}

export const removeProductStorageFile = async (storagePath) => {
  if (!storagePath) return true

  const supabase = getSupabaseClient()

  const { error } = await supabase.storage
    .from('product-images')
    .remove([storagePath])

  if (error) {
    throw new Error(`No se pudo eliminar la imagen: ${error.message}`)
  }

  return true
}