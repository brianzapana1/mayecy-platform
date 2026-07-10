<script setup>
defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-product'])
</script>

<template>
  <div v-if="products.length" class="product-grid">
    <ProductCard
      v-for="product in products"
      :key="product.id_producto"
      :product="product"
      @select-product="emit('select-product', $event)"
    />
  </div>

  <div v-else class="products-empty">
    <h3>No encontramos productos con esos filtros</h3>
    <p>Prueba con otra categoría, nombre o marca.</p>
  </div>
</template>