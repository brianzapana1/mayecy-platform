import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

export const getSupabaseClient = () => {
  const config = useRuntimeConfig()

  if (!supabaseClient) {
    supabaseClient = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )
  }

  return supabaseClient
}