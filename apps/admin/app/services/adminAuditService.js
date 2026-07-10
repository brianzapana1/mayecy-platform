import { getSupabaseClient } from '~/utils/supabaseClient'

const AUDIT_SELECT = `
  id_audit,
  tabla,
  accion,
  registro_id,
  usuario_id,
  datos_anteriores,
  datos_nuevos,
  creado
`

export const getAdminAuditLogs = async ({
  tableName = '',
  action = '',
  limit = 100
} = {}) => {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('audit_logs')
    .select(AUDIT_SELECT)
    .order('creado', { ascending: false })
    .limit(limit)

  if (tableName) {
    query = query.eq('tabla', tableName)
  }

  if (action) {
    query = query.eq('accion', action)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const undoProductAuditLog = async (auditId) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.rpc('undo_product_audit', {
    p_audit_id: auditId
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}