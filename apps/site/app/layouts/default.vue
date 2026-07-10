<script setup>
import SiteHeader from '~/components/layout/SiteHeader.vue'
import SiteFooter from '~/components/layout/SiteFooter.vue'
import FloatingWhatsApp from '~/components/layout/FloatingWhatsApp.vue'
</script>

<template>
  <div class="site-shell">
    <SiteHeader />

    <main class="site-main">
      <slot />
    </main>

    <SiteFooter />

    <FloatingWhatsApp />
  </div>
</template>