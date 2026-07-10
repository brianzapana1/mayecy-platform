<script setup>
import { homeContent } from '~/data/home'

const services = homeContent.services
</script>

<template>
  <section class="services-section">
    <div class="container">
      <div class="section-heading">
        <span class="home-eyebrow">Servicios</span>

        <h2 class="section-title">
          Atención para oficinas, empresas y clientes particulares
        </h2>

        <p class="section-description">
          Atención directa, asesoramiento y productos para impresión.
        </p>
      </div>

      <div class="services-grid">
        <article
          v-for="service in services"
          :key="service.title"
          class="service-card"
        >
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>