import { getSupabaseClient } from '~/utils/supabaseClient'

const safeCount = async (queryBuilder) => {
  const { count, error } = await queryBuilder

  if (error) {
    return 0
  }

  return count || 0
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
        .select('id_producto', { count: 'exact', head: true })
    ),
    safeCount(
      supabase
        .from('productos')
        .select('id_producto', { count: 'exact', head: true })
        .eq('visible_web', true)
    ),
    safeCount(
      supabase
        .from('productos')
        .select('id_producto', { count: 'exact', head: true })
        .is('imagen_url', null)
    ),
    safeCount(
      supabase
        .from('productos')
        .select('id_producto', { count: 'exact', head: true })
        .is('id_categoria', null)
    ),
    safeCount(
      supabase
        .from('categorias')
        .select('id_categoria', { count: 'exact', head: true })
    ),
    safeCount(
      supabase
        .from('admin_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
    )
  ])

  const { data: recentProducts } = await supabase
    .from('productos')
    .select('id_producto, nombre, estado_web, visible_web, actualizado')
    .order('actualizado', { ascending: false })
    .limit(5)

  const { data: recentAudit } = await supabase
    .from('audit_logs')
    .select('id_audit, tabla, accion, registro_id, creado')
    .order('creado', { ascending: false })
    .limit(5)

  const { data: recentSecurity } = await supabase
    .from('security_logs')
    .select('id_security_log, event_type, actor_email, target_email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    productsTotal,
    productsVisible,
    productsWithoutImage,
    productsWithoutCategory,
    categoriesTotal,
    usersActive,
    recentProducts: recentProducts || [],
    recentAudit: recentAudit || [],
    recentSecurity: recentSecurity || []
  }
}