<script setup>
import { getPublicProductBySlug } from '~/services/productService'

const route = useRoute()
const config = useRuntimeConfig()

const siteUrl = computed(() => {
  return String(config.public.siteUrl || 'https://www.mayecy.com').replace(/\/$/, '')
})

const { data: product, pending, error } = await useAsyncData(
  `product-${route.params.slug}`,
  () => getPublicProductBySlug(route.params.slug)
)

if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Producto no encontrado'
  })
}

const productImages = computed(() => {
  return product.value?.product_images || []
})

const mainImage = computed(() => {
  return productImages.value[0]?.image_url || product.value?.imagen_url || ''
})

const productUrl = computed(() => {
  if (!product.value?.slug) return `${siteUrl.value}/productos`
  return `${siteUrl.value}/productos/${product.value.slug}`
})

const seoTitle = computed(() => {
  return product.value?.seo_titulo || `${product.value?.nombre || 'Producto'} en La Paz Bolivia | Mayecy`
})

const seoDescription = computed(() => {
  return product.value?.seo_descripcion ||
    product.value?.descripcion ||
    `Consulta disponibilidad de ${product.value?.nombre || 'este producto'} en Mayecy, La Paz Bolivia.`
})

const availabilityUrl = computed(() => {
  if (product.value?.estado_web === 'sin_stock') {
    return 'https://schema.org/OutOfStock'
  }

  return 'https://schema.org/InStock'
})

const statusLabels = {
  disponible: 'Disponible',
  stock_bajo: 'Stock bajo',
  consultar: 'Consultar',
  sin_stock: 'Sin stock'
}

const productStatusLabel = computed(() => {
  return statusLabels[product.value?.estado_web] || 'Consultar'
})

const productStatusClass = computed(() => {
  return `product-status-${product.value?.estado_web || 'consultar'}`
})

const productSchema = computed(() => {
  if (!product.value) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.value.nombre,
    description: seoDescription.value,
    image: productImages.value.length
      ? productImages.value.map((image) => image.image_url)
      : mainImage.value
        ? [mainImage.value]
        : [],
    url: productUrl.value,
    category: product.value.categorias?.nombre || undefined,
    sku: product.value.codigo || undefined,
    brand: product.value.marca
      ? {
          '@type': 'Brand',
          name: product.value.marca
        }
      : {
          '@type': 'Brand',
          name: 'Mayecy'
        },
    offers: {
      '@type': 'Offer',
      url: productUrl.value,
      priceCurrency: 'BOB',
      availability: availabilityUrl.value,
      seller: {
        '@type': 'Organization',
        name: 'Mayecy'
      }
    }
  }

  return Object.fromEntries(
    Object.entries(schema).filter(([, value]) => value !== undefined)
  )
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'product',
  ogUrl: () => productUrl.value,
  ogImage: () => mainImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => mainImage.value,
  robots: 'index, follow'
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: productUrl.value
    }
  ],
  script: productSchema.value
    ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify(productSchema.value)
        }
      ]
    : []
}))

const whatsappMessage = computed(() => {
  return encodeURIComponent(
    `Hola Mayecy, quiero consultar por el producto: ${product.value?.nombre || ''}.`
  )
})
</script>

<template>
  <main class="product-detail-page">
    <section class="container">
      <NuxtLink
        to="/productos"
        class="product-back-link"
      >
        ← Volver a productos
      </NuxtLink>

      <div
        v-if="pending"
        class="product-detail-card"
      >
        Cargando producto...
      </div>

      <article
        v-else-if="product"
        class="product-detail-card product-detail-layout"
      >
        <div class="product-detail-visual">
          <ProductGallery :product="product" />
        </div>

        <div class="product-detail-info">
          <span class="section-kicker">
            {{ product.categorias?.nombre || 'Producto Mayecy' }}
          </span>

          <h1>{{ product.nombre }}</h1>

          <div class="product-detail-badges">
            <span
              class="product-status-pill product-detail-status-pill"
              :class="productStatusClass"
            >
              {{ productStatusLabel }}
            </span>

            <span v-if="product.marca">
              Marca: {{ product.marca }}
            </span>

            <span v-if="product.codigo">
              Código: {{ product.codigo }}
            </span>
          </div>

          <p
            v-if="product.descripcion"
            class="product-detail-description"
          >
            {{ product.descripcion }}
          </p>

          <p
            v-else
            class="product-detail-description"
          >
            Consulta disponibilidad, compatibilidad y detalles de este producto directamente con Mayecy.
          </p>

          <div
            v-if="product.compatibilidad"
            class="product-detail-box"
          >
            <h2>Compatibilidad</h2>
            <p>{{ product.compatibilidad }}</p>
          </div>

          <div class="product-detail-actions">
            <a
              class="mayecy-button product-whatsapp-button"
              :href="`https://wa.me/59171930704?text=${whatsappMessage}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar por WhatsApp
            </a>

            <NuxtLink
              to="/contacto"
              class="mayecy-button product-secondary-button"
            >
              Ver contacto
            </NuxtLink>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>