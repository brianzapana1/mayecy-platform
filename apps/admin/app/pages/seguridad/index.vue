<script setup>
import { getCurrentAdmin } from '~/services/authService'
import { getAdminSecurityLogs } from '~/services/adminSecurityService'

definePageMeta({
  layout: 'dashboard'
})

const logs = ref([])
const loading = ref(true)
const errorMessage = ref('')
const selectedEvent = ref('')
const selectedLimit = ref(100)

const eventOptions = [
  { value: '', label: 'Todos los eventos' },
  { value: 'login_success', label: 'Login correcto' },
  { value: 'login_failed', label: 'Login fallido' },
  { value: 'access_denied', label: 'Acceso denegado' },
  { value: 'logout', label: 'Logout' },
  { value: 'session_expired', label: 'Sesión expirada' },
  { value: 'user_profile_created', label: 'Usuario creado' },
  { value: 'user_profile_updated', label: 'Usuario actualizado' },
  { value: 'user_profile_disabled', label: 'Usuario desactivado' },
  { value: 'user_profile_enabled', label: 'Usuario activado' },
  { value: 'role_changed', label: 'Rol cambiado' }
]

const eventLabel = {
  login_success: 'Login correcto',
  login_failed: 'Login fallido',
  access_denied: 'Acceso denegado',
  logout: 'Logout',
  session_expired: 'Sesión expirada',
  user_profile_created: 'Usuario creado',
  user_profile_updated: 'Usuario actualizado',
  user_profile_disabled: 'Usuario desactivado',
  user_profile_enabled: 'Usuario activado',
  role_changed: 'Rol cambiado'
}

const stats = computed(() => {
  return {
    total: logs.value.length,
    success: logs.value.filter((log) => log.event_type === 'login_success').length,
    failed: logs.value.filter((log) => log.event_type === 'login_failed').length,
    userChanges: logs.value.filter((log) => log.event_type.includes('user_profile') || log.event_type === 'role_changed').length
  }
})

const formatDate = (value) => {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const loadLogs = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const admin = await getCurrentAdmin()

    if (!admin || admin.profile.role !== 'global_admin') {
      await navigateTo('/')
      return
    }

    logs.value = await getAdminSecurityLogs({
      eventType: selectedEvent.value,
      limit: Number(selectedLimit.value)
    })
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo cargar seguridad.'
  } finally {
    loading.value = false
  }
}

watch(
  [selectedEvent, selectedLimit],
  () => {
    loadLogs()
  }
)

onMounted(() => {
  loadLogs()
})

useSeoMeta({
  title: 'Seguridad | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading admin-products-heading">
      <div>
        <span class="admin-eyebrow">Seguridad</span>
        <h1>Seguridad</h1>
        <p>
          Revisa accesos, intentos fallidos, cierres de sesión y cambios sensibles del panel.
        </p>
      </div>

      <button
        type="button"
        class="admin-button admin-button-primary"
        @click="loadLogs"
      >
        Actualizar
      </button>
    </div>

    <div class="admin-products-stats">
      <article class="admin-mini-card">
        <span>Eventos</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Login OK</span>
        <strong>{{ stats.success }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Fallidos</span>
        <strong>{{ stats.failed }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Usuarios</span>
        <strong>{{ stats.userChanges }}</strong>
      </article>
    </div>

    <div class="admin-security-toolbar">
      <select
        v-model="selectedEvent"
        class="admin-select"
      >
        <option
          v-for="option in eventOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <select
        v-model="selectedLimit"
        class="admin-select"
      >
        <option :value="50">Últimos 50</option>
        <option :value="100">Últimos 100</option>
        <option :value="200">Últimos 200</option>
      </select>
    </div>

    <p
      v-if="errorMessage"
      class="admin-alert admin-alert-error"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="loading"
      class="admin-card"
    >
      Cargando eventos de seguridad...
    </div>

    <div
      v-else-if="!logs.length"
      class="admin-card"
    >
      No hay eventos de seguridad con esos filtros.
    </div>

    <div
      v-else
      class="admin-security-list"
    >
      <article
        v-for="log in logs"
        :key="log.id_security_log"
        class="admin-security-item"
      >
        <div class="admin-security-icon">
          <span v-if="log.event_type === 'login_success'">✓</span>
          <span v-else-if="log.event_type === 'login_failed'">!</span>
          <span v-else-if="log.event_type === 'logout'">↪</span>
          <span v-else>★</span>
        </div>

        <div class="admin-security-content">
          <div class="admin-security-header">
            <div>
              <span
                class="admin-security-pill"
                :class="`security-event-${log.event_type}`"
              >
                {{ eventLabel[log.event_type] || log.event_type }}
              </span>

              <h2>{{ log.actor_email || log.target_email || 'Evento del sistema' }}</h2>
            </div>

            <time>{{ formatDate(log.created_at) }}</time>
          </div>

          <div class="admin-security-meta">
            <span v-if="log.actor_role">Rol: {{ log.actor_role }}</span>
            <span v-if="log.target_email">Objetivo: {{ log.target_email }}</span>
            <span v-if="log.user_agent">Navegador registrado</span>
          </div>

          <details class="admin-audit-details">
            <summary>Ver detalles técnicos</summary>
            <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
          </details>
        </div>
      </article>
    </div>
  </div>
</template>