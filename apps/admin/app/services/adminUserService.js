import { getSupabaseClient } from '~/utils/supabaseClient'
import { logSecurityEvent } from '~/services/adminSecurityService'

const ADMIN_USER_SELECT = `
  id,
  email,
  full_name,
  role,
  is_active,
  creado,
  updated_at
`

export const getAdminUsers = async () => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('admin_profiles')
    .select(ADMIN_USER_SELECT)
    .order('creado', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const createAdminProfile = async (payload) => {
  const supabase = getSupabaseClient()

  const cleanEmail = String(payload.email || '').trim().toLowerCase()
  const cleanId = String(payload.id || '').trim()

  if (!cleanId) {
    throw new Error('Debes colocar el UUID del usuario creado en Supabase Auth.')
  }

  if (!cleanEmail) {
    throw new Error('El correo es obligatorio.')
  }

  const userPayload = {
    id: cleanId,
    email: cleanEmail,
    full_name: payload.full_name?.trim() || null,
    role: payload.role || 'admin',
    is_active: Boolean(payload.is_active)
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .insert(userPayload)
    .select(ADMIN_USER_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await logSecurityEvent({
    eventType: 'user_profile_created',
    targetUserId: data.id,
    targetEmail: data.email,
    details: {
      role: data.role
    }
  })

  return data
}

export const updateAdminProfile = async (id, payload) => {
  const supabase = getSupabaseClient()

  const oldRole = payload.old_role || null

  const userPayload = {
    email: String(payload.email || '').trim().toLowerCase(),
    full_name: payload.full_name?.trim() || null,
    role: payload.role || 'admin',
    is_active: Boolean(payload.is_active),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .update(userPayload)
    .eq('id', id)
    .select(ADMIN_USER_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await logSecurityEvent({
    eventType: oldRole && oldRole !== data.role
      ? 'role_changed'
      : 'user_profile_updated',
    targetUserId: data.id,
    targetEmail: data.email,
    details: {
      role: data.role,
      oldRole
    }
  })

  return data
}

export const toggleAdminProfileStatus = async (user) => {
  const supabase = getSupabaseClient()

  const nextStatus = !user.is_active

  const { data, error } = await supabase
    .from('admin_profiles')
    .update({
      is_active: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select(ADMIN_USER_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await logSecurityEvent({
    eventType: nextStatus
      ? 'user_profile_enabled'
      : 'user_profile_disabled',
    targetUserId: data.id,
    targetEmail: data.email,
    details: {
      role: data.role
    }
  })

  return data
}