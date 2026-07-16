import { createClient } from '@supabase/supabase-js'

let supabaseClient = null

export const getSupabaseClient = () => {
  /*
   * Si el cliente ya fue creado, se reutiliza.
   * Esto evita tener varias instancias de GoTrueClient.
   */
  if (supabaseClient) {
    return supabaseClient
  }

  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan las variables públicas de Supabase para el sitio.'
    )
  }

  supabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        /*
         * El sitio público solamente consulta información.
         * No necesita guardar ni actualizar una sesión.
         */
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )

  return supabaseClient
}