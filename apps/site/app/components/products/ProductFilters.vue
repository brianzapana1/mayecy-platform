<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  totalProducts: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select-category'])

const categorySearch = ref('')

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

const filteredCategories = computed(() => {
  const term = normalizeText(categorySearch.value)

  if (!term) return props.categories

  return props.categories.filter((category) => {
    return normalizeText(category.nombre).includes(term)
  })
})

const selectCategory = (slug) => {
  emit('select-category', slug)
}
</script>

<template>
  <aside class="product-sidebar">
    <div class="filter-card">
      <span class="filter-eyebrow">Catálogo</span>

      <h2>Categorías</h2>

      <p>
        Filtra el catálogo por tipo de producto.
      </p>

      <div class="category-search-box">
        <input
          v-model="categorySearch"
          type="search"
          placeholder="Buscar categoría..."
          autocomplete="off"
        >
      </div>

      <div class="category-filter-list">
        <button
          type="button"
          class="category-filter-button"
          :class="{ 'category-filter-active': selectedCategory === '' }"
          @click="selectCategory('')"
        >
          Todos los productos
        </button>

        <button
          v-for="category in filteredCategories"
          :key="category.slug"
          type="button"
          class="category-filter-button"
          :class="{ 'category-filter-active': selectedCategory === category.slug }"
          @click="selectCategory(category.slug)"
        >
          {{ category.nombre }}
        </button>
      </div>
    </div>
  </aside>
</template>