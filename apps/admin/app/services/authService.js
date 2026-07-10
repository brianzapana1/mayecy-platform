import { getSupabaseClient } from '~/utils/supabaseClient'

const ADMIN_SESSION_KEY = 'mayecy_admin_session_started_at'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 1000 // 1 hora

const saveAdminSessionStart = () => {
  if (!import.meta.client) return
  localStorage.setItem(ADMIN_SESSION_KEY, String(Date.now()))
}

const clearAdminSessionStart = () => {
  if (!import.meta.client) return
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

const isAdminSessionExpired = () => {
  if (!import.meta.client) return false

  const startedAt = Number(localStorage.getItem(ADMIN_SESSION_KEY))

  if (!startedAt) return false

  return Date.now() - startedAt > ADMIN_SESSION_MAX_AGE
}

const ADMIN_PROFILE_SELECT = `
  id,
  email,
  full_name,
  role,
  is_active
`

export const signInAdmin = async ({ email, password }) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error('Correo o contraseña incorrectos.')
  }

  const user = data.user

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select(ADMIN_PROFILE_SELECT)
    .eq('id', user.id)
    .maybeSingle()

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !['global_admin', 'admin'].includes(profile.role)
  ) {
    await supabase.auth.signOut()
    throw new Error('Este usuario no tiene permisos de administrador.')
  }

  saveAdminSessionStart()

  return {
    user,
    profile
  }
}

export const getCurrentAdmin = async () => {
  const supabase = getSupabaseClient()

    if (isAdminSessionExpired()) {
      await supabase.auth.signOut()
      clearAdminSessionStart()
      return null
    }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select(ADMIN_PROFILE_SELECT)
    .eq('id', userData.user.id)
    .maybeSingle()

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !['global_admin', 'admin'].includes(profile.role)
  ) {
    return null
  }

  return {
    user: userData.user,
    profile
  }
}

export const signOutAdmin = async () => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.auth.signOut()
  clearAdminSessionStart()

  if (error) {
    throw new Error('No se pudo cerrar sesión.')
  }
}