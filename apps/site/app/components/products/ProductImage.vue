<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const mainImage = computed(() => {
  const images = props.product.product_images || []
  const primary = images.find((image) => image.is_primary) || images[0]

  return primary?.image_url || props.product.imagen_url || ''
})
</script>

<template>
  <div class="product-image-box">
    <img
      v-if="mainImage"
      class="product-image"
      :src="mainImage"
      :alt="product.nombre"
      loading="lazy"
    >

    <div v-else class="product-image-placeholder">
      <span>{{ product.nombre?.slice(0, 2) || 'M' }}</span>
    </div>
  </div>
</template>