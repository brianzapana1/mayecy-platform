import { getCurrentAdmin } from '~/services/authService'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return

  const isLoginPage = to.path === '/login'
  const admin = await getCurrentAdmin()

  if (!admin && !isLoginPage) {
    return navigateTo('/login')
  }

  if (admin && isLoginPage) {
    return navigateTo('/')
  }
})