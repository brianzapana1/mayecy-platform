import { getSupabaseClient } from '~/utils/supabaseClient'
import { slugify } from '~/utils/slugify'

const CATEGORY_SELECT = `
  id_categoria,
  nombre,
  descripcion,
  slug,
  visible_web,
  creado,
  actualizado,
  productos (
    id_producto
  )
`

const normalizeCategory = (category) => {
  return {
    ...category,
    product_count: category.productos?.length || 0
  }
}

export const getAdminCategories = async () => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('categorias')
    .select(CATEGORY_SELECT)
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(normalizeCategory)
}

export const createAdminCategory = async (payload) => {
  const supabase = getSupabaseClient()

  const cleanName = String(payload.nombre || '').trim()

  if (!cleanName) {
    throw new Error('El nombre de la categoría es obligatorio.')
  }

  const categoryPayload = {
    nombre: cleanName,
    descripcion: payload.descripcion?.trim() || null,
    slug: payload.slug?.trim() || slugify(cleanName),
    visible_web: Boolean(payload.visible_web)
  }

  const { data, error } = await supabase
    .from('categorias')
    .insert(categoryPayload)
    .select(CATEGORY_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return normalizeCategory(data)
}

export const updateAdminCategory = async (id, payload) => {
  const supabase = getSupabaseClient()

  const cleanName = String(payload.nombre || '').trim()

  if (!cleanName) {
    throw new Error('El nombre de la categoría es obligatorio.')
  }

  const categoryPayload = {
    nombre: cleanName,
    descripcion: payload.descripcion?.trim() || null,
    slug: payload.slug?.trim() || slugify(cleanName),
    visible_web: Boolean(payload.visible_web),
    actualizado: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('categorias')
    .update(categoryPayload)
    .eq('id_categoria', id)
    .select(CATEGORY_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return normalizeCategory(data)
}

export const deleteAdminCategory = async (id) => {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id_categoria', id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}