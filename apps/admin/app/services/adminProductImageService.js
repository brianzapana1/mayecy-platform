import { getSupabaseClient } from '~/utils/supabaseClient'
import { removeProductStorageFile } from '~/services/adminStorageService'

export const getAdminProductImages = async (productId) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('product_images')
    .select(`
      id_product_image,
      id_producto,
      image_url,
      storage_path,
      alt_text,
      sort_order,
      is_primary,
      creado
    `)
    .eq('id_producto', productId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const createAdminProductImage = async (payload) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('product_images')
    .insert(payload)
    .select(`
      id_product_image,
      id_producto,
      image_url,
      storage_path,
      alt_text,
      sort_order,
      is_primary
    `)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const deleteAdminProductImage = async (image) => {
  const supabase = getSupabaseClient()

  if (image.storage_path) {
    await removeProductStorageFile(image.storage_path)
  }

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id_product_image', image.id_product_image)

  if (error) {
    throw new Error(error.message)
  }

  return true
}