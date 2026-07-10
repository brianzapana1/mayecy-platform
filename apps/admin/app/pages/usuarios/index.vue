<script setup>
import { getCurrentAdmin } from '~/services/authService'
import {
  getAdminUsers,
  createAdminProfile,
  updateAdminProfile,
  toggleAdminProfileStatus
} from '~/services/adminUserService'

definePageMeta({
  layout: 'dashboard'
})

const users = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const searchTerm = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const isModalOpen = ref(false)
const editingUser = ref(null)

let messageTimer = null

const roleOptions = [
  { value: 'global_admin', label: 'Global admin' },
  { value: 'admin', label: 'Admin' }
]

const emptyForm = () => ({
  id: '',
  email: '',
  full_name: '',
  role: 'admin',
  is_active: true
})

const form = ref(emptyForm())

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

const filteredUsers = computed(() => {
  const term = normalizeText(searchTerm.value)

  return users.value.filter((user) => {
    const searchable = normalizeText([
      user.email,
      user.full_name,
      user.role
    ].join(' '))

    const matchesSearch = term ? searchable.includes(term) : true
    const matchesRole = selectedRole.value ? user.role === selectedRole.value : true
    const matchesStatus = selectedStatus.value
      ? String(user.is_active) === selectedStatus.value
      : true

    return matchesSearch && matchesRole && matchesStatus
  })
})

const stats = computed(() => {
  const total = users.value.length
  const active = users.value.filter((user) => user.is_active).length
  const inactive = total - active
  const globalAdmins = users.value.filter((user) => user.role === 'global_admin').length

  return {
    total,
    active,
    inactive,
    globalAdmins
  }
})

const showSuccess = (message) => {
  successMessage.value = message
  errorMessage.value = ''

  if (messageTimer) clearTimeout(messageTimer)

  messageTimer = setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

const showError = (message) => {
  errorMessage.value = message
  successMessage.value = ''

  if (messageTimer) clearTimeout(messageTimer)

  messageTimer = setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

const loadUsers = async () => {
  loading.value = true

  try {
    const admin = await getCurrentAdmin()

    if (!admin || admin.profile.role !== 'global_admin') {
      await navigateTo('/')
      return
    }

    users.value = await getAdminUsers()
  } catch (error) {
    showError(error.message || 'No se pudieron cargar los usuarios.')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingUser.value = null
  form.value = emptyForm()
  isModalOpen.value = true
}

const openEditModal = (user) => {
  editingUser.value = user

  form.value = {
    id: user.id,
    email: user.email || '',
    full_name: user.full_name || '',
    role: user.role || 'admin',
    is_active: Boolean(user.is_active)
  }

  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return

  isModalOpen.value = false
  editingUser.value = null
  form.value = emptyForm()
}

const saveUser = async () => {
  saving.value = true

  try {
    if (editingUser.value) {
      await updateAdminProfile(editingUser.value.id, {
        ...form.value,
        old_role: editingUser.value.role
      })

      showSuccess('Usuario actualizado correctamente.')
    } else {
      await createAdminProfile(form.value)
      showSuccess('Perfil de usuario creado correctamente.')
    }

    closeModal()
    await loadUsers()
  } catch (error) {
    showError(error.message || 'No se pudo guardar el usuario.')
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    await toggleAdminProfileStatus(user)

    showSuccess(
      user.is_active
        ? 'Usuario desactivado correctamente.'
        : 'Usuario activado correctamente.'
    )

    await loadUsers()
  } catch (error) {
    showError(error.message || 'No se pudo cambiar el estado del usuario.')
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedRole.value = ''
  selectedStatus.value = ''
}

onMounted(() => {
  loadUsers()
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})

useSeoMeta({
  title: 'Usuarios | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading admin-products-heading">
      <div>
        <span class="admin-eyebrow">Accesos</span>
        <h1>Usuarios</h1>
        <p>
          Administra quién puede entrar al panel. Por ahora, primero crea el usuario en Supabase Auth y luego registra aquí su UUID.
        </p>
      </div>

      <button
        type="button"
        class="admin-button admin-button-primary"
        @click="openCreateModal"
      >
        Nuevo perfil
      </button>
    </div>

    <div class="admin-products-stats">
      <article class="admin-mini-card">
        <span>Total</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Activos</span>
        <strong>{{ stats.active }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Inactivos</span>
        <strong>{{ stats.inactive }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Global admin</span>
        <strong>{{ stats.globalAdmins }}</strong>
      </article>
    </div>

    <div class="admin-user-toolbar">
      <input
        v-model="searchTerm"
        type="search"
        class="admin-search-input"
        placeholder="Buscar por nombre, correo o rol..."
      >

      <select
        v-model="selectedRole"
        class="admin-select"
      >
        <option value="">Todos los roles</option>
        <option
          v-for="role in roleOptions"
          :key="role.value"
          :value="role.value"
        >
          {{ role.label }}
        </option>
      </select>

      <select
        v-model="selectedStatus"
        class="admin-select"
      >
        <option value="">Todos los estados</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>

      <button
        type="button"
        class="admin-button admin-button-secondary"
        @click="clearFilters"
      >
        Limpiar
      </button>
    </div>

    <p
      v-if="errorMessage"
      class="admin-alert admin-alert-error"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="successMessage"
      class="admin-alert admin-alert-success"
    >
      {{ successMessage }}
    </p>

    <div
      v-if="loading"
      class="admin-card"
    >
      Cargando usuarios...
    </div>

    <div
      v-else
      class="admin-user-grid"
    >
      <article
        v-for="user in filteredUsers"
        :key="user.id"
        class="admin-user-card"
      >
        <div class="admin-user-avatar">
          {{ user.full_name?.slice(0, 1) || user.email?.slice(0, 1) || 'U' }}
        </div>

        <div class="admin-user-content">
          <div class="admin-user-title-line">
            <div>
              <h2>{{ user.full_name || 'Sin nombre' }}</h2>
              <p>{{ user.email }}</p>
            </div>

            <span
              class="admin-user-status"
              :class="{ 'admin-user-status-active': user.is_active }"
            >
              {{ user.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="admin-user-meta">
            <span>{{ user.role === 'global_admin' ? 'Global admin' : 'Admin' }}</span>
            <span>{{ user.id }}</span>
          </div>
        </div>

        <div class="admin-user-actions">
          <button
            type="button"
            class="admin-action-button"
            @click="openEditModal(user)"
          >
            Editar
          </button>

          <button
            type="button"
            class="admin-action-button"
            :class="{ 'admin-action-danger': user.is_active }"
            @click="toggleUserStatus(user)"
          >
            {{ user.is_active ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="isModalOpen"
      class="admin-modal-backdrop"
      @click.self="closeModal"
    >
      <section class="admin-user-modal">
        <div class="admin-modal-header">
          <div>
            <span class="admin-eyebrow">
              {{ editingUser ? 'Editar usuario' : 'Nuevo perfil admin' }}
            </span>
            <h2>
              {{ editingUser ? 'Actualizar acceso' : 'Registrar perfil' }}
            </h2>
          </div>

          <button
            type="button"
            class="admin-modal-close"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <div
          v-if="!editingUser"
          class="admin-help-box"
        >
          Primero crea el usuario en Supabase Auth. Luego copia su UUID y regístralo aquí.
          Más adelante automatizaremos esto con una Edge Function.
        </div>

        <form
          class="admin-user-form"
          @submit.prevent="saveUser"
        >
          <label class="admin-form-field">
            UUID del usuario
            <input
              v-model="form.id"
              type="text"
              required
              :disabled="Boolean(editingUser)"
              placeholder="UUID de Supabase Auth"
            >
          </label>

          <label class="admin-form-field">
            Correo
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="correo@ejemplo.com"
            >
          </label>

          <label class="admin-form-field">
            Nombre
            <input
              v-model="form.full_name"
              type="text"
              placeholder="Nombre visible"
            >
          </label>

          <label class="admin-form-field">
            Rol
            <select v-model="form.role">
              <option value="admin">Admin</option>
              <option value="global_admin">Global admin</option>
            </select>
          </label>

          <div class="admin-form-toggles">
            <label>
              <input
                v-model="form.is_active"
                type="checkbox"
              >
              Usuario activo
            </label>
          </div>

          <div class="admin-modal-actions">
            <button
              type="button"
              class="admin-button admin-button-secondary"
              @click="closeModal"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="admin-button admin-button-primary"
              :disabled="saving"
            >
              {{ saving ? 'Guardando...' : 'Guardar usuario' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>