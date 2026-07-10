<script setup>
import { getCurrentAdmin } from '~/services/authService'
import {
  getAdminAuditLogs,
  undoProductAuditLog
} from '~/services/adminAuditService'

definePageMeta({
  layout: 'dashboard'
})

const logs = ref([])
const loading = ref(true)
const errorMessage = ref('')
const selectedTable = ref('')
const selectedAction = ref('')
const selectedLimit = ref(100)
const undoingId = ref(null)
const successMessage = ref('')
let messageTimer = null

const tableOptions = [
  { value: '', label: 'Todas las tablas' },
  { value: 'productos', label: 'Productos' },
  { value: 'categorias', label: 'Categorías' },
  { value: 'product_images', label: 'Imágenes' }
]

const actionOptions = [
  { value: '', label: 'Todas las acciones' },
  { value: 'INSERT', label: 'Creación' },
  { value: 'UPDATE', label: 'Actualización' },
  { value: 'DELETE', label: 'Eliminación' }
]

const actionLabel = {
  INSERT: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación'
}

const actionClass = {
  INSERT: 'audit-action-insert',
  UPDATE: 'audit-action-update',
  DELETE: 'audit-action-delete'
}

const stats = computed(() => {
  return {
    total: logs.value.length,
    inserts: logs.value.filter((log) => log.accion === 'INSERT').length,
    updates: logs.value.filter((log) => log.accion === 'UPDATE').length,
    deletes: logs.value.filter((log) => log.accion === 'DELETE').length
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

const canUndoLog = (log) => {
  return log.tabla === 'productos' &&
    ['INSERT', 'UPDATE', 'DELETE'].includes(log.accion)
}

const undoLog = async (log) => {
  const confirmed = window.confirm(
    `¿Deseas revertir este cambio de ${log.tabla}? Esta acción también quedará registrada en auditoría.`
  )

  if (!confirmed) return

  undoingId.value = log.id_audit

  try {
    const result = await undoProductAuditLog(log.id_audit)
    showSuccess(result || 'Cambio revertido correctamente.')
    await loadLogs()
  } catch (error) {
    showError(error.message || 'No se pudo revertir el cambio.')
  } finally {
    undoingId.value = null
  }
}

const formatDate = (value) => {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const shortUserId = (value) => {
  if (!value) return 'Sistema / no identificado'
  return `${String(value).slice(0, 8)}...`
}

const getMainName = (log) => {
  const source = log.datos_nuevos || log.datos_anteriores || {}

  return source.nombre ||
    source.image_url ||
    source.slug ||
    source.codigo ||
    `Registro ${log.registro_id}`
}

const getChangedFields = (log) => {
  if (log.accion !== 'UPDATE') return []

  const before = log.datos_anteriores || {}
  const after = log.datos_nuevos || {}

  return Object.keys(after).filter((key) => {
    return JSON.stringify(before[key]) !== JSON.stringify(after[key])
  })
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

    logs.value = await getAdminAuditLogs({
      tableName: selectedTable.value,
      action: selectedAction.value,
      limit: Number(selectedLimit.value)
    })
  } catch (error) {
    showError(error.message || 'No se pudo cargar la auditoría.')
    } finally {
    loading.value = false
  }
}

watch(
  [selectedTable, selectedAction, selectedLimit],
  () => {
    loadLogs()
  }
)

onMounted(() => {
  loadLogs()
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})

useSeoMeta({
  title: 'Auditoría | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading admin-products-heading">
      <div>
        <span class="admin-eyebrow">Trazabilidad</span>
        <h1>Auditoría</h1>
        <p>
          Revisa cambios realizados en productos, categorías e imágenes del catálogo.
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
        <span>Registros</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Creaciones</span>
        <strong>{{ stats.inserts }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Ediciones</span>
        <strong>{{ stats.updates }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Eliminaciones</span>
        <strong>{{ stats.deletes }}</strong>
      </article>
    </div>

    <div class="admin-audit-toolbar">
      <select
        v-model="selectedTable"
        class="admin-select"
      >
        <option
          v-for="option in tableOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <select
        v-model="selectedAction"
        class="admin-select"
      >
        <option
          v-for="option in actionOptions"
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
      Cargando auditoría...
    </div>

    <div
      v-else-if="!logs.length"
      class="admin-card"
    >
      No hay registros de auditoría con esos filtros.
    </div>

    <div
      v-else
      class="admin-audit-list"
    >
      <article
        v-for="log in logs"
        :key="log.id_audit"
        class="admin-audit-item"
      >
        <div class="admin-audit-icon">
          <span v-if="log.accion === 'INSERT'">＋</span>
          <span v-else-if="log.accion === 'UPDATE'">✎</span>
          <span v-else>×</span>
        </div>

        <div class="admin-audit-content">
          <div class="admin-audit-header">
            <div>
              <span
                class="admin-audit-action"
                :class="actionClass[log.accion]"
              >
                {{ actionLabel[log.accion] || log.accion }}
              </span>

              <h2>{{ getMainName(log) }}</h2>
            </div>

            <time>{{ formatDate(log.creado) }}</time>
          </div>

          <div class="admin-audit-meta">
            <span>Tabla: {{ log.tabla }}</span>
            <span>Registro: {{ log.registro_id }}</span>
            <span>Usuario: {{ shortUserId(log.usuario_id) }}</span>
          </div>

          <div
            v-if="canUndoLog(log)"
            class="admin-audit-undo"
            >
            <button
                type="button"
                class="admin-action-button admin-undo-button"
                :disabled="undoingId === log.id_audit"
                @click="undoLog(log)"
            >
                {{ undoingId === log.id_audit ? 'Revirtiendo...' : 'Deshacer cambio' }}
            </button>
            </div>

          <div
            v-if="log.accion === 'UPDATE'"
            class="admin-audit-changes"
          >
            <strong>Campos modificados:</strong>
            <span
              v-for="field in getChangedFields(log)"
              :key="field"
            >
              {{ field }}
            </span>
          </div>

          <details class="admin-audit-details">
            <summary>Ver datos técnicos</summary>

            <div class="admin-audit-json-grid">
              <div>
                <strong>Antes</strong>
                <pre>{{ JSON.stringify(log.datos_anteriores, null, 2) }}</pre>
              </div>

              <div>
                <strong>Después</strong>
                <pre>{{ JSON.stringify(log.datos_nuevos, null, 2) }}</pre>
              </div>
            </div>
          </details>
        </div>
      </article>
    </div>
  </div>
</template>