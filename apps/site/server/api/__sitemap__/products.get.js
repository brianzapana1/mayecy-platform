import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)

    const supabaseUrl = config.public.supabaseUrl
    const supabaseAnonKey = config.public.supabaseAnonKey

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Sitemap products: faltan variables de Supabase.')
      return []
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const { data, error } = await supabase
      .from('productos')
      .select('slug, actualizado')
      .eq('visible_web', true)

    if (error) {
      console.error('Sitemap products error:', error.message)
      return []
    }

    return (data || [])
      .filter((product) => product.slug)
      .map((product) => {
        return {
          loc: `/productos/${product.slug}`,
          lastmod: product.actualizado || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        }
      })
  } catch (error) {
    console.error('Sitemap products fatal error:', error)
    return []
  }
})