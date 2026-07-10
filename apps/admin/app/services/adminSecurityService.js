import { getSupabaseClient } from '~/utils/supabaseClient'

const SECURITY_SELECT = `
  id_security_log,
  event_type,
  actor_id,
  actor_email,
  actor_role,
  target_user_id,
  target_email,
  user_agent,
  details,
  created_at
`

export const logSecurityEvent = async ({
  eventType,
  actorEmail = null,
  actorRole = null,
  targetUserId = null,
  targetEmail = null,
  details = {}
}) => {
  const supabase = getSupabaseClient()

  const userAgent = import.meta.client
    ? window.navigator.userAgent
    : null

  const { error } = await supabase.rpc('log_security_event', {
    p_event_type: eventType,
    p_actor_email: actorEmail,
    p_actor_role: actorRole,
    p_target_user_id: targetUserId,
    p_target_email: targetEmail,
    p_user_agent: userAgent,
    p_details: details
  })

  if (error) {
    console.warn('No se pudo registrar evento de seguridad:', error.message)
  }

  return true
}

export const getAdminSecurityLogs = async ({
  eventType = '',
  limit = 100
} = {}) => {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('security_logs')
    .select(SECURITY_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (eventType) {
    query = query.eq('event_type', eventType)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}