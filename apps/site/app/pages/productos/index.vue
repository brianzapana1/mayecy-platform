<script setup>
import { getPublicProducts } from '~/services/productService'
import { getPublicCategories } from '~/services/categoryService'

const searchTerm = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const productsPerPage = 9
const selectedProduct = ref(null)
const paginationAnchor = ref(null)
const { data: products, pending: productsPending, error: productsError } = await useAsyncData(
  'public-products',
  () => getPublicProducts()
)

const { data: categories, pending: categoriesPending } = await useAsyncData(
  'public-categories',
  () => getPublicCategories()
)

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

const filteredProducts = computed(() => {
  const items = products.value || []
  const term = normalizeText(searchTerm.value)

  return items.filter((product) => {
    const categorySlug = product.categorias?.slug || ''

    const matchesCategory = selectedCategory.value
      ? categorySlug === selectedCategory.value
      : true

    const searchableText = normalizeText([
      product.nombre,
      product.marca,
      product.categorias?.nombre
    ].join(' '))

    const matchesSearch = term
      ? searchableText.includes(term)
      : true

    return matchesCategory && matchesSearch
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredProducts.value.length / productsPerPage))
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * productsPerPage
  const end = start + productsPerPage

  return filteredProducts.value.slice(start, end)
})

const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const groupSize = 4
  const visibleCount = 5

  const pageItem = (value) => ({
    type: 'page',
    value,
    key: `page-${value}`
  })

  const dotsItem = (position) => ({
    type: 'dots',
    value: '...',
    key: `dots-${position}`
  })

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => pageItem(index + 1))
  }

  const groupIndex = Math.floor((current - 1) / groupSize)

  let start = groupIndex * groupSize + 1
  let end = start + visibleCount - 1

  if (end > total) {
    end = total
    start = Math.max(1, total - visibleCount + 1)
  }

  const visiblePages = Array.from(
    { length: end - start + 1 },
    (_, index) => pageItem(start + index)
  )

  const pages = []

  if (start >= 9) {
    pages.push(pageItem(1))
    pages.push(dotsItem('start'))
  }

  pages.push(...visiblePages)

  if (end < total) {
    pages.push(dotsItem('end'))
    pages.push(pageItem(total))
  }

  return pages
})

const scrollToPaginationAnchor = () => {
  if (!import.meta.client || !paginationAnchor.value) return

  paginationAnchor.value.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  })
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
}

const selectCategory = (slug) => {
  selectedCategory.value = slug
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page

  nextTick(() => {
    scrollToPaginationAnchor()
  })
}

const openProductModal = (product) => {
  selectedProduct.value = product
}

const closeProductModal = () => {
  selectedProduct.value = null
}

watch(searchTerm, () => {
  currentPage.value = 1
})

useSeoMeta({
  title: 'Productos | Mayecy',
  description:
    'Catálogo de productos Mayecy: tóners, tintas, cartuchos, papel para plotter, recargas e insumos para impresoras y fotocopiadoras en La Paz, Bolivia.'
})
</script>

<template>
  <section class="products-page">
    <div class="container">
      <div class="products-header products-header-clean">
        <div>
          <span class="home-eyebrow">Productos</span>

          <h1 class="products-title">
            Catálogo Mayecy
          </h1>

          <p class="products-intro">
            Encuentra nuestros productos:
          </p>
        </div>
      </div>

      <div class="products-start-anchor">
  <ProductSearch v-model="searchTerm" />
</div>

<div ref="paginationAnchor" class="products-top-pagination-anchor">
      <nav
        v-if="totalPages > 1"
        class="products-pagination products-pagination-top"
        aria-label="Paginación superior de productos"
      >
        <button
          type="button"
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <span class="pagination-label-full">Anterior</span>
          <span class="pagination-label-short">Ant.</span>
        </button>

        <template
            v-for="page in paginationPages"
            :key="page.key"
          >
            <button
              v-if="page.type === 'page'"
              type="button"
              class="pagination-number"
              :class="{ 'pagination-active': currentPage === page.value }"
              @click="goToPage(page.value)"
            >
              {{ page.value }}
            </button>

            <span
              v-else
              class="pagination-dots"
              aria-hidden="true"
            >
              ...
            </span>
          </template>

        <button
          type="button"
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <span class="pagination-label-full">Siguiente</span>
          <span class="pagination-label-short">Sig.</span>
        </button>
      </nav>
    </div>

      <div class="products-layout">
        <ProductFilters
          :categories="categories || []"
          :selected-category="selectedCategory"
          :total-products="filteredProducts.length"
          @select-category="selectCategory"
        />

        <div class="products-content">
          <div
            v-if="searchTerm || selectedCategory"
            class="active-filters"
          >
            <span>
              {{ filteredProducts.length }} resultado(s)
            </span>

            <button type="button" @click="clearFilters">
              Limpiar filtros
            </button>
          </div>

          <p v-if="productsPending || categoriesPending" class="products-loading">
            Cargando productos...
          </p>

          <p v-else-if="productsError" class="products-error">
            No se pudieron cargar los productos. Revisa la conexión con Supabase.
          </p>

          <template v-else>
            <ProductGrid
              :products="paginatedProducts"
              @select-product="openProductModal"
            />

            <nav
              v-if="totalPages > 1"
              class="products-pagination"
              aria-label="Paginación de productos"
            >
              <button
                type="button"
                class="pagination-button"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                <span class="pagination-label-full">Anterior</span>
                <span class="pagination-label-short">Ant.</span>
              </button>

              <template
                v-for="page in paginationPages"
                :key="page.key"
              >
                <button
                  v-if="page.type === 'page'"
                  type="button"
                  class="pagination-number"
                  :class="{ 'pagination-active': currentPage === page.value }"
                  @click="goToPage(page.value)"
                >
                  {{ page.value }}
                </button>

                <span
                  v-else
                  class="pagination-dots"
                  aria-hidden="true"
                >
                  ...
                </span>
              </template>

              <button
                type="button"
                class="pagination-button"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                <span class="pagination-label-full">Siguiente</span>
                <span class="pagination-label-short">Sig.</span>
              </button>
            </nav>
          </template>
        </div>
      </div>
    </div>

    <ProductDetailModal
      :product="selectedProduct"
      @close="closeProductModal"
    />
  </section>
</template>