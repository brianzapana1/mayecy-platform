import { getSupabaseClient } from '~/utils/supabaseClient'
import { generateProductSlug, slugify } from '~/utils/slugify'

const PRODUCT_SELECT = `
  id_producto,
  id_categoria,
  codigo,
  nombre,
  slug,
  descripcion,
  imagen_url,
  estado_web,
  visible_web,
  destacado,
  marca,
  compatibilidad,
  seo_titulo,
  seo_descripcion,
  creado,
  actualizado,
  categorias (
    id_categoria,
    nombre,
    slug
  ),
  product_images (
    id_product_image,
    image_url,
    storage_path,
    alt_text,
    sort_order,
    is_primary
  )
`

export const getAdminProducts = async () => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCT_SELECT)
    .order('actualizado', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const createAdminProduct = async (payload) => {
  const supabase = getSupabaseClient()

  const cleanName = String(payload.nombre || '').trim()

  if (!cleanName) {
    throw new Error('El nombre del producto es obligatorio.')
  }

  const productPayload = {
    id_categoria: payload.id_categoria ? Number(payload.id_categoria) : null,
    codigo: payload.codigo?.trim() || null,
    nombre: cleanName,
    slug: payload.slug?.trim() || generateProductSlug(cleanName),
    descripcion: payload.descripcion?.trim() || null,
    imagen_url: payload.imagen_url?.trim() || null,
    estado_web: payload.estado_web || 'disponible',
    visible_web: Boolean(payload.visible_web),
    destacado: Boolean(payload.destacado),
    marca: payload.marca?.trim() || null,
    compatibilidad: payload.compatibilidad?.trim() || null,
    seo_titulo:
      payload.seo_titulo?.trim() ||
      `${cleanName} en La Paz Bolivia | Mayecy`,
    seo_descripcion:
      payload.seo_descripcion?.trim() ||
      `Consulta ${cleanName} en Mayecy, La Paz Bolivia.`
  }

  const { data, error } = await supabase
    .from('productos')
    .insert(productPayload)
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateAdminProduct = async (id, payload) => {
  const supabase = getSupabaseClient()

  const cleanName = String(payload.nombre || '').trim()

  if (!cleanName) {
    throw new Error('El nombre del producto es obligatorio.')
  }

  const productPayload = {
    id_categoria: payload.id_categoria ? Number(payload.id_categoria) : null,
    codigo: payload.codigo?.trim() || null,
    nombre: cleanName,
    slug: payload.slug?.trim() || slugify(cleanName),
    descripcion: payload.descripcion?.trim() || null,
    imagen_url: payload.imagen_url?.trim() || null,
    estado_web: payload.estado_web || 'disponible',
    visible_web: Boolean(payload.visible_web),
    destacado: Boolean(payload.destacado),
    marca: payload.marca?.trim() || null,
    compatibilidad: payload.compatibilidad?.trim() || null,
    seo_titulo:
      payload.seo_titulo?.trim() ||
      `${cleanName} en La Paz Bolivia | Mayecy`,
    seo_descripcion:
      payload.seo_descripcion?.trim() ||
      `Consulta ${cleanName} en Mayecy, La Paz Bolivia.`,
    actualizado: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('productos')
    .update(productPayload)
    .eq('id_producto', id)
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const deleteAdminProduct = async (id) => {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id_producto', id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}