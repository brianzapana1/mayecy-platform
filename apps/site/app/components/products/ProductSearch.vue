<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="product-search">
    <label for="product-search-input">Buscar producto</label>

    <div class="product-search-box">
      <input
        id="product-search-input"
        :value="modelValue"
        type="search"
        placeholder="Buscar por nombre, código o marca..."
        autocomplete="off"
        @input="emit('update:modelValue', $event.target.value)"
      >
    </div>
  </div>
</template>