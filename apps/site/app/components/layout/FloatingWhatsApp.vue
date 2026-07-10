<script setup>
const whatsappNumber = '59171930704'

const message = encodeURIComponent(
  'Hola Mayecy, quiero consultar información sobre sus productos.'
)

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
</script>

<template>
  <a
    class="floating-whatsapp"
    :href="whatsappUrl"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Consultar por WhatsApp"
  >
    <img
      src="/images/contact/whatsapp.png"
      alt="WhatsApp"
      class="floating-whatsapp-icon"
    >

    <span class="floating-whatsapp-text">Consulta</span>
  </a>
</template>