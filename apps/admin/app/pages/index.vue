<script setup>
import { getAdminDashboardStats } from '~/services/adminDashboardService'
import { getCurrentAdmin } from '~/services/authService'

definePageMeta({
  layout: 'dashboard'
})

const loading = ref(true)
const errorMessage = ref('')
const dashboard = ref(null)
const admin = ref(null)

const isGlobalAdmin = computed(() => {
  return admin.value?.profile?.role === 'global_admin'
})

const formatDate = (value) => {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const loadDashboard = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    admin.value = await getCurrentAdmin()
    dashboard.value = await getAdminDashboardStats()
  } catch (error) {
    errorMessage.value = error.message || 'No se pudo cargar el dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})

useSeoMeta({
  title: 'Dashboard | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading admin-products-heading">
      <div>
        <span class="admin-eyebrow">Resumen</span>
        <h1>Dashboard</h1>
        <p>
          Vista general del catálogo, tareas pendientes y actividad reciente del panel Mayecy.
        </p>
      </div>

      <button
        type="button"
        class="admin-button admin-button-primary"
        @click="loadDashboard"
      >
        Actualizar
      </button>
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
      Cargando dashboard...
    </div>

    <template v-else-if="dashboard">
      <div class="admin-dashboard-hero">
        <div>
          <span class="admin-eyebrow">Estado del sitio</span>
          <h2>Catálogo Mayecy</h2>
          <p>
            Hay {{ dashboard.productsVisible }} productos visibles de {{ dashboard.productsTotal }} registrados.
          </p>
        </div>

        <NuxtLink
          to="/productos"
          class="admin-button admin-button-primary"
        >
          Gestionar productos
        </NuxtLink>
      </div>

      <div class="admin-products-stats">
        <article class="admin-mini-card">
          <span>Productos</span>
          <strong>{{ dashboard.productsTotal }}</strong>
        </article>

        <article class="admin-mini-card">
          <span>Visibles</span>
          <strong>{{ dashboard.productsVisible }}</strong>
        </article>

        <article class="admin-mini-card">
          <span>Sin imagen</span>
          <strong>{{ dashboard.productsWithoutImage }}</strong>
        </article>

        <article class="admin-mini-card">
          <span>Sin categoría</span>
          <strong>{{ dashboard.productsWithoutCategory }}</strong>
        </article>
      </div>

      <div class="admin-dashboard-grid">
        <article class="admin-dashboard-panel">
          <div class="admin-dashboard-panel-header">
            <h2>Últimos productos</h2>
            <NuxtLink to="/productos">Ver todos</NuxtLink>
          </div>

          <div class="admin-dashboard-list">
            <div
              v-for="product in dashboard.recentProducts"
              :key="product.id_producto"
              class="admin-dashboard-list-item"
            >
              <strong>{{ product.nombre }}</strong>
              <span>{{ product.estado_web }} · {{ product.visible_web ? 'Visible' : 'Oculto' }}</span>
            </div>
          </div>
        </article>

        <article class="admin-dashboard-panel">
          <div class="admin-dashboard-panel-header">
            <h2>Tareas sugeridas</h2>
          </div>

          <div class="admin-dashboard-task-list">
            <div class="admin-dashboard-task">
              <strong>{{ dashboard.productsWithoutImage }}</strong>
              <span>productos sin imagen</span>
            </div>

            <div class="admin-dashboard-task">
              <strong>{{ dashboard.productsWithoutCategory }}</strong>
              <span>productos sin categoría</span>
            </div>

            <div class="admin-dashboard-task">
              <strong>{{ dashboard.categoriesTotal }}</strong>
              <span>categorías registradas</span>
            </div>

            <div
              v-if="isGlobalAdmin"
              class="admin-dashboard-task"
            >
              <strong>{{ dashboard.usersActive }}</strong>
              <span>usuarios activos</span>
            </div>
          </div>
        </article>

        <article
          v-if="isGlobalAdmin"
          class="admin-dashboard-panel"
        >
          <div class="admin-dashboard-panel-header">
            <h2>Auditoría reciente</h2>
            <NuxtLink to="/auditoria">Ver auditoría</NuxtLink>
          </div>

          <div class="admin-dashboard-list">
            <div
              v-for="log in dashboard.recentAudit"
              :key="log.id_audit"
              class="admin-dashboard-list-item"
            >
              <strong>{{ log.tabla }} · {{ log.accion }}</strong>
              <span>{{ formatDate(log.creado) }}</span>
            </div>
          </div>
        </article>

        <article
          v-if="isGlobalAdmin"
          class="admin-dashboard-panel"
        >
          <div class="admin-dashboard-panel-header">
            <h2>Seguridad reciente</h2>
            <NuxtLink to="/seguridad">Ver seguridad</NuxtLink>
          </div>

          <div class="admin-dashboard-list">
            <div
              v-for="log in dashboard.recentSecurity"
              :key="log.id_security_log"
              class="admin-dashboard-list-item"
            >
              <strong>{{ log.event_type }}</strong>
              <span>{{ log.actor_email || log.target_email || 'Sistema' }} · {{ formatDate(log.created_at) }}</span>
            </div>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>