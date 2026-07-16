<script setup>
import { getPublicProductsPage } from '~/services/productService'
import { getPublicCategories } from '~/services/categoryService'

const searchTerm = ref('')
const debouncedSearchTerm = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const productsPerPage = 9
const selectedProduct = ref(null)
const paginationAnchor = ref(null)

let searchTimer = null

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/*
 * Las categorías también se cargan sin bloquear
 * la entrada a la página.
 */
const {
  data: categories,
  status: categoriesStatus,
  error: categoriesError
} = await useLazyAsyncData(
  'public-categories',
  () => getPublicCategories(),
  {
    server: false,
    default: () => []
  }
)

/*
 * Convierte el slug seleccionado al id_categoria
 * que necesita la consulta de Supabase.
 */
const selectedCategoryId = computed(() => {
  if (!selectedCategory.value) {
    return null
  }

  const category = (categories.value || []).find((item) => {
    return item.slug === selectedCategory.value
  })

  return category?.id_categoria || null
})

/*
 * Permite que una búsqueda como "tóners"
 * también encuentre productos mediante la categoría.
 */
const matchingSearchCategoryIds = computed(() => {
  const term = normalizeText(
    debouncedSearchTerm.value
  )

  if (!term) {
    return []
  }

  return (categories.value || [])
    .filter((category) => {
      return normalizeText(category.nombre)
        .includes(term)
    })
    .map((category) => category.id_categoria)
})

/*
 * La cadena se utiliza como dependencia estable
 * de useLazyAsyncData.
 */
const matchingSearchCategoryIdsKey = computed(() => {
  return matchingSearchCategoryIds.value.join(',')
})

/*
 * La consulta se ejecuta nuevamente cuando cambia:
 * - la página;
 * - la búsqueda;
 * - la categoría.
 *
 * server:false garantiza que el catálogo consulte
 * datos actuales desde Supabase en el navegador.
 */
const {
  data: productsResult,
  status: productsStatus,
  error: productsError
} = await useLazyAsyncData(
  'public-products-page',
  () => getPublicProductsPage({
    page: currentPage.value,
    pageSize: productsPerPage,
    search: debouncedSearchTerm.value,
    categoryId: selectedCategoryId.value,
    categorySearchIds:
      matchingSearchCategoryIds.value
  }),
  {
    server: false,
    default: () => ({
      items: [],
      total: 0
    }),
    watch: [
      currentPage,
      debouncedSearchTerm,
      selectedCategoryId,
      matchingSearchCategoryIdsKey
    ]
  }
)

const products = computed(() => {
  return productsResult.value?.items || []
})

const totalProducts = computed(() => {
  return Number(productsResult.value?.total || 0)
})

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(
      totalProducts.value / productsPerPage
    )
  )
})

const productsLoading = computed(() => {
  return (
    productsStatus.value === 'idle' ||
    productsStatus.value === 'pending'
  )
})

const categoriesLoading = computed(() => {
  return (
    categoriesStatus.value === 'idle' ||
    categoriesStatus.value === 'pending'
  )
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
    return Array.from(
      { length: total },
      (_, index) => pageItem(index + 1)
    )
  }

  const groupIndex = Math.floor(
    (current - 1) / groupSize
  )

  let start = groupIndex * groupSize + 1
  let end = start + visibleCount - 1

  if (end > total) {
    end = total
    start = Math.max(
      1,
      total - visibleCount + 1
    )
  }

  const visiblePages = Array.from(
    {
      length: end - start + 1
    },
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
  if (
    !import.meta.client ||
    !paginationAnchor.value
  ) {
    return
  }

  paginationAnchor.value.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  })
}

const clearFilters = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }

  searchTerm.value = ''
  debouncedSearchTerm.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
}

const selectCategory = (slug) => {
  selectedCategory.value = slug
  currentPage.value = 1
}

const goToPage = (page) => {
  if (
    page < 1 ||
    page > totalPages.value ||
    page === currentPage.value
  ) {
    return
  }

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

/*
 * Espera 300 ms después de escribir.
 * Así no consulta Supabase por cada tecla.
 */
watch(searchTerm, (value) => {
  currentPage.value = 1

  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    debouncedSearchTerm.value =
      String(value || '').trim()

    searchTimer = null
  }, 300)
})

/*
 * Si un filtro reduce la cantidad de páginas,
 * evita quedar parado en una página inexistente.
 */
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal
  }
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
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
          :total-products="totalProducts"
          @select-category="selectCategory"
        />

        <div class="products-content">
          <div
            v-if="searchTerm || selectedCategory"
            class="active-filters"
          >
            <span>
              {{ totalProducts }} resultado(s)
            </span>

            <button type="button" @click="clearFilters">
              Limpiar filtros
            </button>
          </div>

          <p
              v-if="productsLoading || categoriesLoading"
              class="products-loading"
            >
            Cargando productos...
          </p>

          <p v-else-if="productsError" class="products-error">
            No se pudieron cargar los productos. Revisa la conexión con Supabase.
          </p>

          <template v-else>
            <ProductGrid
              :products="products"
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