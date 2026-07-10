import { getSupabaseClient } from '~/utils/supabaseClient'

export const getPublicCategories = async () => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('categorias')
    .select(`
      id_categoria,
      nombre,
      slug
    `)
    .eq('visible_web', true)
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}