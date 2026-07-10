<script setup>
const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const whatsappUrl = computed(() => {
  if (!props.product) return '#'

  const message = encodeURIComponent(
    `Hola Mayecy, quiero consultar por el producto: ${props.product.nombre}.`
  )

  return `https://wa.me/59171930704?text=${message}`
})

const closeOnEscape = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.product,
  (product) => {
    if (!import.meta.client) return

    if (product) {
      window.addEventListener('keydown', closeOnEscape)
    } else {
      window.removeEventListener('keydown', closeOnEscape)
    }
  }
)

onBeforeUnmount(() => {
  if (!import.meta.client) return

  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div
    v-if="product"
    class="product-modal-backdrop"
    @click.self="emit('close')"
  >
    <article class="product-modal">
      <button
        type="button"
        class="product-modal-close"
        aria-label="Cerrar detalle"
        @click="emit('close')"
      >
        ×
      </button>

      <div class="product-modal-grid">
        <div class="product-modal-visual">
          <ProductGallery :product="product" />
        </div>

        <div class="product-modal-info">
          <div class="product-detail-top">
            <span class="product-category">
              {{ product.categorias?.nombre || 'Producto' }}
            </span>

            <ProductStatusBadge :status="product.estado_web" />
          </div>

          <h2>{{ product.nombre }}</h2>

          <div class="product-meta-grid product-modal-meta">
            <div v-if="product.marca" class="product-meta-item">
              <span>Marca</span>
              <strong>{{ product.marca }}</strong>
            </div>

            <div class="product-meta-item">
              <span>Disponibilidad</span>
              <strong>
                {{ product.estado_web === 'disponible' ? 'Disponible' : 'Consultar' }}
              </strong>
            </div>

            <div v-if="product.categorias?.nombre" class="product-meta-item">
              <span>Categoría</span>
              <strong>{{ product.categorias.nombre }}</strong>
            </div>
          </div>

          <div class="product-detail-description">
            <h3>Descripción</h3>

            <p>
              {{ product.descripcion || 'Producto disponible para consulta en Mayecy. Puede comunicarse por WhatsApp para confirmar disponibilidad, compatibilidad y detalles.' }}
            </p>
          </div>

          <div
            v-if="product.compatibilidad"
            class="product-detail-description"
          >
            <h3>Compatibilidad</h3>
            <p>{{ product.compatibilidad }}</p>
          </div>

          <a
            class="mayecy-button mayecy-button-primary product-whatsapp-button"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar este producto por WhatsApp
          </a>

          <NuxtLink
            class="mayecy-button product-page-link product-page-link-strong"
            :to="`/productos/${product.slug}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver página completa del producto
          </NuxtLink>
        </div>
      </div>
    </article>
  </div>
</template>