<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select-product'])
</script>

<template>
  <article class="product-card">
    <button
      type="button"
      class="product-card-link"
      @click="emit('select-product', product)"
    >
      <ProductImage :product="product" />

      <div class="product-card-content">
        <div class="product-card-top">
          <span class="product-category">
            {{ product.categorias?.nombre || 'Producto' }}
          </span>

          <ProductStatusBadge :status="product.estado_web" />
        </div>

        <h3>{{ product.nombre }}</h3>

        <p v-if="product.marca" class="product-brand">
          Marca: {{ product.marca }}
        </p>

        <span class="product-see-more">
          Ver detalle
        </span>
      </div>
    </button>
  </article>
</template>