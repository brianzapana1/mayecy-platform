import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2026-07-06',

  css: [
    '~/assets/css/admin.css'
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: ''
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'es-BO'
      },
      title: 'Admin Mayecy',
      meta: [
        {
          name: 'robots',
          content: 'noindex, nofollow'
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }
      ]
    }
  }
})