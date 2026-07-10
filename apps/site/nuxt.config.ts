export default defineNuxtConfig({
  compatibilityDate: '2026-07-06',
  nitro: {
    preset: 'cloudflare_pages'
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],
  modules: [
    'nuxt-site-config',
    '@nuxtjs/sitemap'
  ],
  css: [
    '~/assets/css/variables.css',
    '~/assets/css/utilities.css',
    '~/assets/css/main.css'
  ],

  site: {
    url: 'https://www.mayecy.com',
    name: 'Mayecy'
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/products'
    ]
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      siteUrl: 'https://www.mayecy.com'
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'es-BO'
      },
      title: 'Mayecy | Insumos para impresoras en La Paz',
      meta: [
        {
          name: 'description',
          content:
            'Mayecy ofrece tóner, tintas, papel para plotter, repuestos y accesorios para impresoras y fotocopiadoras en La Paz, Bolivia.'
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }
      ]
    }
  }

  
})