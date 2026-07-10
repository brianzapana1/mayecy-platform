<script setup>
import { getCurrentAdmin, signOutAdmin } from '~/services/authService'

const admin = ref(null)
const isSidebarCollapsed = ref(false)
const loading = ref(true)

const loadAdmin = async () => {
  loading.value = true
  admin.value = await getCurrentAdmin()
  loading.value = false
}

const isGlobalAdmin = computed(() => {
  return admin.value?.profile?.role === 'global_admin'
})

const displayName = computed(() => {
  return admin.value?.profile?.full_name || admin.value?.profile?.email || 'Administrador'
})

const roleLabel = computed(() => {
  if (admin.value?.profile?.role === 'global_admin') return 'Global admin'
  return 'Admin'
})

const menuItems = computed(() => {
  const items = [
    {
      label: 'Dashboard',
      to: '/',
      icon: '📊'
    },
    {
      label: 'Productos',
      to: '/productos',
      icon: '🖨️'
    },
    {
      label: 'Categorías',
      to: '/categorias',
      icon: '🏷️'
    }
  ]

  if (isGlobalAdmin.value) {
    items.push(
      {
        label: 'Usuarios',
        to: '/usuarios',
        icon: '👥'
      },
      {
        label: 'Auditoría',
        to: '/auditoria',
        icon: '🧾'
      },
      {
        label: 'Seguridad',
        to: '/seguridad',
        icon: '🛡️'
      }
    )
  }

  return items
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleLogout = async () => {
  await signOutAdmin()
  await navigateTo('/login')
}

onMounted(() => {
  loadAdmin()
})
</script>

<template>
  <div
    class="admin-shell"
    :class="{ 'admin-shell-collapsed': isSidebarCollapsed }"
  >
    <aside class="admin-sidebar">
      <div class="admin-sidebar-header">
        <NuxtLink to="/" class="admin-brand">
          <img
            src="/images/logo-mayecy.png"
            alt="Mayecy"
            class="admin-brand-logo"
          >

          <div class="admin-brand-text">
            <strong>Mayecy</strong>
            <span>Administración</span>
          </div>
        </NuxtLink>
      </div>

      <nav class="admin-nav">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="admin-nav-link"
          :title="item.label"
        >
          <span class="admin-nav-icon">
            {{ item.icon }}
          </span>

          <span class="admin-nav-label">
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <div class="admin-sidebar-footer">
        <span class="admin-user-role">{{ roleLabel }}</span>
        <strong class="admin-user-name">{{ displayName }}</strong>
      </div>
    </aside>

    <button
      type="button"
      class="admin-sidebar-tab"
      :aria-label="isSidebarCollapsed ? 'Mostrar menú' : 'Ocultar menú'"
      @click="toggleSidebar"
    >
      <span>{{ isSidebarCollapsed ? '›' : '‹' }}</span>
    </button>

    <section class="admin-main">
      <header class="admin-topbar">
        <button
          type="button"
          class="admin-mobile-menu-button"
          @click="toggleSidebar"
        >
          Menú
        </button>

        <div>
          <span class="admin-eyebrow">Panel privado</span>
          <p v-if="loading" class="admin-topbar-user">Cargando sesión...</p>
          <p v-else class="admin-topbar-user">
            {{ displayName }} · {{ roleLabel }}
          </p>
        </div>

        <button
          type="button"
          class="admin-button admin-button-secondary"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </header>

      <div class="admin-page-content">
        <slot />
      </div>
    </section>
  </div>
</template>