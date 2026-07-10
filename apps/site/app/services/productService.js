import { getSupabaseClient } from '~/utils/supabaseClient'

const PRODUCT_SELECT = `
  id_producto,
  id_categoria,
  codigo,
  nombre,
  slug,
  descripcion,
  imagen_url,
  estado_web,
  destacado,
  marca,
  compatibilidad,
  seo_titulo,
  seo_descripcion,
  categorias (
    id_categoria,
    nombre,
    slug
  ),
  product_images (
    id_product_image,
    image_url,
    alt_text,
    sort_order,
    is_primary
  )
`

const normalizeProductImages = (product) => {
  const images = [...(product.product_images || [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return Number(a.sort_order || 0) - Number(b.sort_order || 0)
    })

  const fallbackImages = product.imagen_url
    ? [
        {
          id_product_image: `fallback-${product.id_producto}`,
          image_url: product.imagen_url,
          alt_text: product.nombre,
          sort_order: 1,
          is_primary: true
        }
      ]
    : []

  return {
    ...product,
    product_images: images.length ? images : fallbackImages
  }
}

export const getPublicProducts = async () => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCT_SELECT)
    .eq('visible_web', true)
    .order('destacado', { ascending: false })
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(normalizeProductImages)
}

export const getPublicProductBySlug = async (slug) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCT_SELECT)
    .eq('visible_web', true)
    .eq('slug', slug)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return normalizeProductImages(data)
}