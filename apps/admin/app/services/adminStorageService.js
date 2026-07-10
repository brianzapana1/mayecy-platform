import { getSupabaseClient } from '~/utils/supabaseClient'
import { slugify } from '~/utils/slugify'

export const uploadProductImage = async (file, productName, productId = 'new') => {
  if (!file) return null

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Solo se permiten imágenes JPG, PNG o WEBP.')
  }

  const maxSize = 5 * 1024 * 1024

  if (file.size > maxSize) {
    throw new Error('La imagen no debe superar los 5 MB.')
  }

  const supabase = getSupabaseClient()
  const extension = file.name.split('.').pop()
  const safeName = slugify(productName || file.name)
  const filePath = `products/${productId}/${safeName}-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

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
    throw new Error(error.message)
  }

  return true
}