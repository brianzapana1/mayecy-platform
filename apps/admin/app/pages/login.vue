<script setup>
import { signInAdmin } from '~/services/authService'


definePageMeta({
  layout: false
})
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await signInAdmin({
      email: email.value,
      password: password.value
    })

    await navigateTo('/')
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo iniciar sesión.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Login | Admin Mayecy',
  description: 'Acceso privado al panel de administración de Mayecy.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <main class="admin-login-page">
    <section class="admin-login-card">
      <div class="admin-login-brand">
        <img
        src="/images/logo-mayecy.png"
        alt="Mayecy"
        class="admin-login-logo"
        />

        <span>Panel privado</span>
      </div>

      <h1>Admin Mayecy</h1>

      <p>
        Ingresa con tu cuenta autorizada para administrar productos, categorías e imágenes.
      </p>

      <form class="admin-login-form" @submit.prevent="handleLogin">
        <label>
          Correo electrónico
          <input
            v-model="email"
            type="email"
            placeholder="correo@ejemplo.com"
            autocomplete="email"
            required
          >
        </label>

        <label>
          Contraseña
          <input
            v-model="password"
            type="password"
            placeholder="Tu contraseña"
            autocomplete="current-password"
            required
          >
        </label>

        <p v-if="errorMessage" class="admin-error">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="admin-button admin-button-primary"
          :disabled="loading"
        >
          {{ loading ? 'Ingresando...' : 'Ingresar al panel' }}
        </button>
      </form>
    </section>
  </main>
</template>