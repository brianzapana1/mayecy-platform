import { getSupabaseClient } from '~/utils/supabaseClient'

const safeCount = async (queryBuilder) => {
  const { count, error } = await queryBuilder

  if (error) {
    console.error('Error al calcular un contador del dashboard:', error)
    return 0
  }

  return count || 0
}

/**
 * Cuenta los productos que no tienen ninguna imagen.
 *
 * Un producto tiene imagen cuando:
 * 1. Tiene al menos un registro en product_images; o
 * 2. Conserva una URL antigua válida en productos.imagen_url.
 */
const getProductsWithoutImageCount = async (supabase) => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id_producto,
      imagen_url,
      product_images (
        id_product_image
      )
    `)

  if (error) {
    throw new Error(
      `No se pudo calcular los productos sin imagen: ${error.message}`
    )
  }

  return (data || []).filter((product) => {
    const hasLegacyImage =
      typeof product.imagen_url === 'string' &&
      product.imagen_url.trim().length > 0

    const hasProductImages =
      Array.isArray(product.product_images) &&
      product.product_images.length > 0

    return !hasLegacyImage && !hasProductImages
  }).length
}

export const getAdminDashboardStats = async () => {
  const supabase = getSupabaseClient()

  const [
    productsTotal,
    productsVisible,
    productsWithoutImage,
    productsWithoutCategory,
    categoriesTotal,
    usersActive
  ] = await Promise.all([
    safeCount(
      supabase
        .from('productos')
        .select('id_producto', {
          count: 'exact',
          head: true
        })
    ),

    safeCount(
      supabase
        .from('productos')
        .select('id_producto', {
          count: 'exact',
          head: true
        })
        .eq('visible_web', true)
    ),

    getProductsWithoutImageCount(supabase),

    safeCount(
      supabase
        .from('productos')
        .select('id_producto', {
          count: 'exact',
          head: true
        })
        .is('id_categoria', null)
    ),

    safeCount(
      supabase
        .from('categorias')
        .select('id_categoria', {
          count: 'exact',
          head: true
        })
    ),

    safeCount(
      supabase
        .from('admin_profiles')
        .select('id', {
          count: 'exact',
          head: true
        })
        .eq('is_active', true)
    )
  ])

  const [
    recentProductsResult,
    recentAuditResult,
    recentSecurityResult
  ] = await Promise.all([
    supabase
      .from('productos')
      .select(`
        id_producto,
        nombre,
        estado_web,
        visible_web,
        actualizado
      `)
      .order('actualizado', {
        ascending: false
      })
      .limit(5),

    supabase
      .from('audit_logs')
      .select(`
        id_audit,
        tabla,
        accion,
        registro_id,
        creado
      `)
      .order('creado', {
        ascending: false
      })
      .limit(5),

    supabase
      .from('security_logs')
      .select(`
        id_security_log,
        event_type,
        actor_email,
        target_email,
        created_at
      `)
      .order('created_at', {
        ascending: false
      })
      .limit(5)
  ])

  if (recentProductsResult.error) {
    console.error(
      'No se pudieron obtener los productos recientes:',
      recentProductsResult.error
    )
  }

  if (recentAuditResult.error) {
    console.error(
      'No se pudo obtener la auditoría reciente:',
      recentAuditResult.error
    )
  }

  if (recentSecurityResult.error) {
    console.error(
      'No se pudo obtener la actividad de seguridad reciente:',
      recentSecurityResult.error
    )
  }

  return {
    productsTotal,
    productsVisible,
    productsWithoutImage,
    productsWithoutCategory,
    categoriesTotal,
    usersActive,
    recentProducts: recentProductsResult.data || [],
    recentAudit: recentAuditResult.data || [],
    recentSecurity: recentSecurityResult.data || []
  }
}