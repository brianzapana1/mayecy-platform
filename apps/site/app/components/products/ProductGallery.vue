<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const activeIndex = ref(0)
const isZooming = ref(false)
const lensX = ref(0)
const lensY = ref(0)
const zoomX = ref(50)
const zoomY = ref(50)
const galleryMain = ref(null)

const images = computed(() => {
  const productImages = props.product.product_images || []

  if (productImages.length) {
    return productImages
  }

  if (props.product.imagen_url) {
    return [
      {
        id_product_image: 'fallback',
        image_url: props.product.imagen_url,
        alt_text: props.product.nombre,
        sort_order: 1,
        is_primary: true
      }
    ]
  }

  return []
})

const activeImage = computed(() => {
  return images.value[activeIndex.value] || null
})

const hasMultipleImages = computed(() => {
  return images.value.length > 1
})

const setActiveIndex = (index) => {
  if (index < 0 || index >= images.value.length) return
  activeIndex.value = index
  isZooming.value = false
}

const previousImage = () => {
  if (!images.value.length) return

  activeIndex.value =
    activeIndex.value === 0
      ? images.value.length - 1
      : activeIndex.value - 1

  isZooming.value = false
}

const nextImage = () => {
  if (!images.value.length) return

  activeIndex.value =
    activeIndex.value === images.value.length - 1
      ? 0
      : activeIndex.value + 1

  isZooming.value = false
}

const startZoom = (event) => {
  isZooming.value = true
  handleMouseMove(event)
}

const stopZoom = () => {
  isZooming.value = false
}

const handleMouseMove = (event) => {
  if (!activeImage.value || !galleryMain.value) return

  const imageRect = event.currentTarget.getBoundingClientRect()
  const mainRect = galleryMain.value.getBoundingClientRect()

  const imageX = event.clientX - imageRect.left
  const imageY = event.clientY - imageRect.top

  const mainX = event.clientX - mainRect.left
  const mainY = event.clientY - mainRect.top

  lensX.value = Math.max(76, Math.min(mainX, mainRect.width - 76))
  lensY.value = Math.max(76, Math.min(mainY, mainRect.height - 76))

  zoomX.value = Math.max(0, Math.min(100, (imageX / imageRect.width) * 100))
  zoomY.value = Math.max(0, Math.min(100, (imageY / imageRect.height) * 100))
}

const zoomLensStyle = computed(() => {
  if (!activeImage.value) return {}

  return {
    left: `${lensX.value}px`,
    top: `${lensY.value}px`,
    backgroundImage: `url(${activeImage.value.image_url})`,
    backgroundPosition: `${zoomX.value}% ${zoomY.value}%`
  }
})

watch(
  () => props.product?.id_producto,
  () => {
    activeIndex.value = 0
    isZooming.value = false
  }
)
</script>

<template>
  <div class="product-gallery">
    <div
      ref="galleryMain"
      class="product-gallery-main product-gallery-zoom-area"
    >
      <button
        v-if="hasMultipleImages"
        type="button"
        class="product-gallery-arrow product-gallery-arrow-left"
        aria-label="Imagen anterior"
        @mouseenter.stop="stopZoom"
        @mousemove.stop
        @click.stop="previousImage"
      >
        ‹
      </button>

      <img
        v-if="activeImage"
        class="product-gallery-active-image"
        :src="activeImage.image_url"
        :alt="activeImage.alt_text || product.nombre"
        @mouseenter="startZoom"
        @mousemove="handleMouseMove"
        @mouseleave="stopZoom"
      >

      <div
        v-else
        class="product-image-placeholder product-gallery-placeholder"
      >
        <span>{{ product.nombre?.slice(0, 2) || 'M' }}</span>
      </div>

      <div
        v-if="activeImage"
        class="product-zoom-lens"
        :class="{ 'product-zoom-lens-visible': isZooming }"
        :style="zoomLensStyle"
      />

      <button
        v-if="hasMultipleImages"
        type="button"
        class="product-gallery-arrow product-gallery-arrow-right"
        aria-label="Imagen siguiente"
        @mouseenter.stop="stopZoom"
        @mousemove.stop
        @click.stop="nextImage"
      >
        ›
      </button>
    </div>

    <div
      v-if="images.length > 1"
      class="product-gallery-thumbs"
    >
      <button
        v-for="(image, index) in images"
        :key="image.id_product_image || image.image_url"
        type="button"
        class="product-gallery-thumb"
        :class="{ 'product-gallery-thumb-active': activeIndex === index }"
        @focus="setActiveIndex(index)"
        @click="setActiveIndex(index)"
      >
        <img
          :src="image.image_url"
          :alt="image.alt_text || product.nombre"
        >
      </button>
    </div>
  </div>
</template>