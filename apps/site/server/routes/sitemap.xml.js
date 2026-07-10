import { createClient } from '@supabase/supabase-js'

const escapeXml = (value) => {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const formatLastmod = (value) => {
  if (!value) return new Date().toISOString()

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const siteUrl = String(
    config.public.siteUrl || 'https://www.mayecy.com'
  ).replace(/\/$/, '')

  const staticPages = [
    {
      loc: '/',
      lastmod: new Date().toISOString()
    },
    {
      loc: '/productos',
      lastmod: new Date().toISOString()
    },
    {
      loc: '/quienes-somos',
      lastmod: new Date().toISOString()
    },
    {
      loc: '/servicios',
      lastmod: new Date().toISOString()
    },
    {
      loc: '/contacto',
      lastmod: new Date().toISOString()
    }
  ]

  let productPages = []

  try {
    const supabaseUrl = config.public.supabaseUrl
    const supabaseAnonKey = config.public.supabaseAnonKey

    if (supabaseUrl && supabaseAnonKey) {
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

      if (!error) {
        productPages = (data || [])
          .filter((product) => product.slug)
          .map((product) => ({
            loc: `/productos/${product.slug}`,
            lastmod: product.actualizado || new Date().toISOString()
          }))
      } else {
        console.error('Sitemap Supabase error:', error.message)
      }
    }
  } catch (error) {
    console.error('Sitemap fatal error:', error)
  }

  const pages = [
    ...staticPages,
    ...productPages
  ]

  const urls = pages
    .map((page) => {
      return `
  <url>
    <loc>${escapeXml(`${siteUrl}${page.loc}`)}</loc>
    <lastmod>${escapeXml(formatLastmod(page.lastmod))}</lastmod>
  </url>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=UTF-8')

  return xml
})