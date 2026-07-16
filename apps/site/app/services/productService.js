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

const PRODUCT_LIST_SELECT = `
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

const sanitizeProductSearch = (value) => {
  return String(value || '')
    .trim()
    .replace(/[,()%"'\\]/g, ' ')
    .replace(/\s+/g, ' ')
}

export const getPublicProductsPage = async ({
  page = 1,
  pageSize = 9,
  search = '',
  categoryId = null,
  categorySearchIds = []
} = {}) => {
  const supabase = getSupabaseClient()

  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.max(1, Number(pageSize) || 9)

  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1

  let query = supabase
    .from('productos')
    .select(PRODUCT_LIST_SELECT, {
      count: 'exact'
    })
    .eq('visible_web', true)

  if (categoryId) {
    query = query.eq(
      'id_categoria',
      Number(categoryId)
    )
  }

  const cleanSearch = sanitizeProductSearch(search)

  if (cleanSearch) {
    const matchingCategoryIds = [
      ...new Set(
        (categorySearchIds || [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id))
      )
    ]

    const searchFilters = [
      `nombre.ilike.%${cleanSearch}%`,
      `marca.ilike.%${cleanSearch}%`,
      `codigo.ilike.%${cleanSearch}%`
    ]

    /*
     * Conserva la posibilidad de encontrar productos
     * escribiendo el nombre de una categoría.
     */
    if (matchingCategoryIds.length) {
      searchFilters.push(
        `id_categoria.in.(${matchingCategoryIds.join(',')})`
      )
    }

    query = query.or(searchFilters.join(','))
  }

  const { data, error, count } = await query
    .order('destacado', {
      ascending: false
    })
    .order('nombre', {
      ascending: true
    })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    items: (data || []).map(normalizeProductImages),
    total: count || 0
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