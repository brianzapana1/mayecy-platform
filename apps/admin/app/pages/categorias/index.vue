<script setup>
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '~/services/adminCategoryService'
import { slugify } from '~/utils/slugify'

definePageMeta({
  layout: 'dashboard'
})

const categories = ref([])
const loading = ref(true)
const saving = ref(false)
const deletingId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const searchTerm = ref('')
const selectedVisibility = ref('')
const isModalOpen = ref(false)
const editingCategory = ref(null)

let messageTimer = null

const emptyForm = () => ({
  nombre: '',
  descripcion: '',
  slug: '',
  visible_web: true
})

const form = ref(emptyForm())

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

const filteredCategories = computed(() => {
  const term = normalizeText(searchTerm.value)

  return categories.value.filter((category) => {
    const searchable = normalizeText([
      category.nombre,
      category.descripcion,
      category.slug
    ].join(' '))

    const matchesSearch = term ? searchable.includes(term) : true

    const matchesVisibility = selectedVisibility.value
      ? String(category.visible_web) === selectedVisibility.value
      : true

    return matchesSearch && matchesVisibility
  })
})

const stats = computed(() => {
  const total = categories.value.length
  const visible = categories.value.filter((category) => category.visible_web).length
  const hidden = total - visible
  const withProducts = categories.value.filter((category) => category.product_count > 0).length

  return {
    total,
    visible,
    hidden,
    withProducts
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

const loadCategories = async () => {
  loading.value = true

  try {
    categories.value = await getAdminCategories()
  } catch (error) {
    showError(error.message || 'No se pudieron cargar las categorías.')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingCategory.value = null
  form.value = emptyForm()
  isModalOpen.value = true
}

const openEditModal = (category) => {
  editingCategory.value = category

  form.value = {
    nombre: category.nombre || '',
    descripcion: category.descripcion || '',
    slug: category.slug || '',
    visible_web: Boolean(category.visible_web)
  }

  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingCategory.value = null
  form.value = emptyForm()
}

const autoGenerateSlug = () => {
  if (!form.value.nombre) return
  form.value.slug = slugify(form.value.nombre)
}

const saveCategory = async () => {
  saving.value = true

  try {
    const payload = { ...form.value }

    if (!payload.slug) {
      payload.slug = slugify(payload.nombre)
    }

    if (editingCategory.value) {
      await updateAdminCategory(editingCategory.value.id_categoria, payload)
      showSuccess('Categoría actualizada correctamente.')
    } else {
      await createAdminCategory(payload)
      showSuccess('Categoría creada correctamente.')
    }

    closeModal()
    await loadCategories()
  } catch (error) {
    showError(error.message || 'No se pudo guardar la categoría.')
  } finally {
    saving.value = false
  }
}

const removeCategory = async (category) => {

    if (category.product_count > 0) {
    showError(
        `No se puede eliminar "${category.nombre}" porque tiene ${category.product_count} producto(s). Primero mueve esos productos a otra categoría o marca la categoría como oculta.`
    )
    return
    }
  const message = category.product_count > 0
    ? `La categoría "${category.nombre}" tiene ${category.product_count} producto(s). Si la eliminas, esos productos quedarán sin categoría. ¿Deseas continuar?`
    : `¿Seguro que deseas eliminar "${category.nombre}"?`

  const confirmed = window.confirm(message)

  if (!confirmed) return

  deletingId.value = category.id_categoria

  try {
    await deleteAdminCategory(category.id_categoria)
    showSuccess('Categoría eliminada correctamente.')
    await loadCategories()
  } catch (error) {
    showError(error.message || 'No se pudo eliminar la categoría.')
  } finally {
    deletingId.value = null
  }
}

const toggleCategoryVisibility = async (category) => {
  try {
    await updateAdminCategory(category.id_categoria, {
      ...category,
      visible_web: !category.visible_web
    })

    showSuccess(
      category.visible_web
        ? 'Categoría ocultada correctamente.'
        : 'Categoría visible correctamente.'
    )

    await loadCategories()
  } catch (error) {
    showError(error.message || 'No se pudo cambiar la visibilidad.')
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedVisibility.value = ''
}

onMounted(() => {
  loadCategories()
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})

useSeoMeta({
  title: 'Categorías | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading admin-products-heading">
      <div>
        <span class="admin-eyebrow">Catálogo</span>
        <h1>Categorías</h1>
        <p>
          Ordena los productos del sitio público y controla qué categorías aparecen en la web.
        </p>
      </div>

      <button
        type="button"
        class="admin-button admin-button-primary"
        @click="openCreateModal"
      >
        Nueva categoría
      </button>
    </div>

    <div class="admin-products-stats">
      <article class="admin-mini-card">
        <span>Total</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Visibles</span>
        <strong>{{ stats.visible }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Ocultas</span>
        <strong>{{ stats.hidden }}</strong>
      </article>

      <article class="admin-mini-card">
        <span>Con productos</span>
        <strong>{{ stats.withProducts }}</strong>
      </article>
    </div>

    <div class="admin-category-toolbar">
      <input
        v-model="searchTerm"
        type="search"
        class="admin-search-input"
        placeholder="Buscar categoría por nombre, descripción o slug..."
      >

      <select
        v-model="selectedVisibility"
        class="admin-select"
      >
        <option value="">Toda visibilidad</option>
        <option value="true">Visible</option>
        <option value="false">Oculta</option>
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
      Cargando categorías...
    </div>

    <div
      v-else
      class="admin-category-grid"
    >
      <article
        v-for="category in filteredCategories"
        :key="category.id_categoria"
        class="admin-category-card"
      >
        <div class="admin-category-icon">
          🏷️
        </div>

        <div class="admin-category-content">
          <div class="admin-category-title-line">
            <h2>{{ category.nombre }}</h2>

            <span
              class="admin-category-pill"
              :class="{ 'admin-category-pill-active': category.visible_web }"
            >
              {{ category.visible_web ? 'Visible' : 'Oculta' }}
            </span>
          </div>

          <p>
            {{ category.descripcion || 'Sin descripción registrada.' }}
          </p>

          <div class="admin-category-meta">
            <span>Slug: {{ category.slug }}</span>
            <span>{{ category.product_count }} producto(s)</span>
          </div>
        </div>

        <div class="admin-category-actions">
          <button
            type="button"
            class="admin-action-button"
            @click="openEditModal(category)"
          >
            Editar
          </button>

          <button
            type="button"
            class="admin-action-button"
            @click="toggleCategoryVisibility(category)"
          >
            {{ category.visible_web ? 'Ocultar' : 'Mostrar' }}
          </button>

          <button
            type="button"
            class="admin-action-button admin-action-danger"
            :disabled="deletingId === category.id_categoria"
            @click="removeCategory(category)"
          >
            {{ deletingId === category.id_categoria ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="isModalOpen"
      class="admin-modal-backdrop"
      @click.self="closeModal"
    >
      <section class="admin-category-modal">
        <div class="admin-modal-header">
          <div>
            <span class="admin-eyebrow">
              {{ editingCategory ? 'Editar categoría' : 'Nueva categoría' }}
            </span>
            <h2>
              {{ editingCategory ? 'Actualizar categoría' : 'Crear categoría' }}
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

        <form
          class="admin-category-form"
          @submit.prevent="saveCategory"
        >
          <label class="admin-form-field">
            Nombre de la categoría
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej. Tóners"
            >
          </label>

          <label class="admin-form-field">
            Slug / URL
            <div class="admin-inline-field">
              <input
                v-model="form.slug"
                type="text"
                placeholder="toners"
              >

              <button
                type="button"
                class="admin-small-button"
                @click="autoGenerateSlug"
              >
                Generar
              </button>
            </div>
          </label>

          <label class="admin-form-field">
            Descripción
            <textarea
              v-model="form.descripcion"
              rows="4"
              placeholder="Descripción breve para identificar la categoría..."
            />
          </label>

          <div class="admin-form-toggles">
            <label>
              <input
                v-model="form.visible_web"
                type="checkbox"
              >
              Visible en la web pública
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
              {{ saving ? 'Guardando...' : 'Guardar categoría' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>