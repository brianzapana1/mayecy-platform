<script setup>
const props = defineProps({
  status: {
    type: String,
    default: 'consultar'
  }
})

const statusMap = {
  disponible: {
    label: 'Disponible',
    className: 'status-available'
  },
  stock_bajo: {
    label: 'Stock bajo',
    className: 'status-low'
  },
  consultar: {
    label: 'Consultar',
    className: 'status-consult'
  },
  sin_stock: {
    label: 'Sin stock',
    className: 'status-empty'
  }
}

const statusInfo = computed(() => {
  return statusMap[props.status] || statusMap.consultar
})
</script>

<template>
  <span class="product-status" :class="statusInfo.className">
    {{ statusInfo.label }}
  </span>
</template>