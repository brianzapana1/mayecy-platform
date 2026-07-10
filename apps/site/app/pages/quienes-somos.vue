<script setup>
useSeoMeta({
  title: 'Quienes somos | Mayecy',
  description:
    'Conoce Mayecy, empresa dedicada a la venta de insumos para impresoras, fotocopiadoras y productos para oficina en La Paz, Bolivia.'
})

const values = [
  {
    title: 'Transparencia',
    description:
      'Nos interesa ganarnos su confianza, así que ofrecemos una atención con transparencia al momento de informarle sobre nuestros productos y servicios.'
  },
  {
    title: 'Puntualidad',
    description:
      'Valoramos su tiempo, por ello no le mentimos con los tiempos de entrega de nuestros servicios.'
  },
  {
    title: 'Responsabilidad',
    description:
      'Tanto en la vertiente social como en la ecológica, demostramos ser responsables con la sociedad y el medio ambiente.'
  }
]

const people = [
  {
    name: 'Angélica R. Pariguana Copa',
    role: 'Gerente propietaria',
    image: '/images/owners/angelica.jpg'
  },
  {
    name: 'Cármen N. Pariguana Copa',
    role: 'Encargada de ventas',
    image: '/images/owners/carmen.jpg'
  }
]
</script>

<template>
  <section class="about-page">
    <div class="container">
      <div class="about-hero">
        <div class="about-copy">
          <span class="home-eyebrow">Quienes somos</span>

          <h1 class="about-title">
            Al servicio de oficinas, negocios y clientes
          </h1>

          <p class="about-text">
            Somos una empresa que está al servicio de la población oficinista.
            Ofrecemos al público la venta de insumos para impresoras y fotocopiadoras,
            también atendiendo todas las necesidades de las actividades realizadas en las oficinas.
          </p>

          <NuxtLink to="/contacto" class="mayecy-button mayecy-button-primary">
            Contáctenos
          </NuxtLink>
        </div>

        <div class="about-visual">
          <div class="about-image-card">
            <img
              src="/images/about/mayecy-banner.png"
              alt="Mayecy variedad de insumos para impresoras y fotocopiadoras"
              class="about-banner"
            >
          </div>
        </div>
      </div>

      <div class="about-values-section">
        <div class="section-heading">
          <span class="home-eyebrow">Nuestros valores</span>

          <h2 class="section-title">
            Transparencia, puntualidad y responsabilidad
          </h2>
        </div>

        <div class="about-values-grid">
          <article
            v-for="value in values"
            :key="value.title"
            class="about-value-card"
          >
            <div class="about-value-icon">
              {{ value.title.charAt(0) }}
            </div>

            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </article>
        </div>
      </div>

      <div class="about-people-section">
        <article
          v-for="person in people"
          :key="person.name"
          class="about-person-card"
        >
          <div class="person-photo-frame">
            <img
              class="person-photo"
              :src="person.image"
              :alt="person.name"
              loading="lazy"
            >
          </div>

          <div class="person-info">
            <span class="person-label">Mayecy</span>
            <h3>{{ person.name }}</h3>
            <p>{{ person.role }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>