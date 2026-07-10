import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  const { data, error } = await supabase
    .from('productos')
    .select('slug, actualizado')
    .eq('visible_web', true)
    .not('slug', 'is', null)

  if (error) {
    return []
  }

  return (data || []).map((product) => {
    return {
      loc: `/productos/${product.slug}`,
      lastmod: product.actualizado || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }
  })
})