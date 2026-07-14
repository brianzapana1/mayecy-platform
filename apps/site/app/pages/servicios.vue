<script setup>
useSeoMeta({
  title: 'Servicios | Mayecy',
  description:
  'Servicios de Mayecy: recargas, asesoramiento, papel para plotter, rollos térmicos e insumos para impresoras, fotocopiadoras y equipos de oficina en La Paz.'
})

const brands = [
  {
    name: 'EPSON',
    image: '/images/brands/epson.png'
  },
  {
    name: 'CANON',
    image: '/images/brands/canon.png'
  },
  {
    name: 'HP',
    image: '/images/brands/hp.png'
  },
  {
    name: 'XEROX',
    image: '/images/brands/xerox.png'
  },
  {
    name: 'TOSHIBA',
    image: '/images/brands/toshiba.png'
  },
  {
    name: 'BROTHER',
    image: '/images/brands/brother.png'
  }
]

const services = [
  {
    title: 'Recargas',
    image: '/images/services/recargas.png',
    description:
      'Brindamos el servicio de recarga de cartuchos y tóners para impresoras y fotocopiadoras de diferentes marcas y modelos. También ofrecemos asesoramiento para identificar el suministro adecuado según las características de su equipo, buscando una alternativa conveniente para sus necesidades de impresión. Consulte con nosotros indicando la marca y el modelo de su impresora o fotocopiadora para recibir una atención más precisa.',
    action: 'Haga su consulta',
    href:
      'https://wa.me/59171930704?text=Hola%20Mayecy%2C%20quiero%20consultar%20sobre%20el%20servicio%20de%20recargas.'
  }
]
const extraServices = [
  {
    title: 'Asesoramiento',
    description:
      'Le ayudamos a identificar el insumo correcto según el modelo de su impresora o fotocopiadora.'
  },
  {
    title: 'Insumos para oficina',
    description:
      'También atendemos pedidos de papel para plotter, material de escritorio, limpieza y productos para actividades de oficina.'
  },
  {
    title: 'Atención a empresas',
    description:
      'Atendemos consultas de oficinas, negocios, instituciones y clientes particulares.'
  }
]
</script>

<template>
  <section class="services-page">
    <div class="container">
      <div class="services-hero">
        <div>
          <span class="home-eyebrow">Nuestros servicios</span>

          <h1 class="services-title">
            Soluciones para impresoras, fotocopiadoras y oficinas
          </h1>

          <p class="services-intro">
            Brindamos servicios de recargas y asesoramiento para que sus equipos de oficina funcionen correctamente.
          </p>
        </div>

        <div class="services-hero-card">
          <p>Impresoras</p>
          <p>Tintas</p>
          <p>Cintas</p>
          <p>Tóners</p>
          <p>Recargas</p>
          <p>Papel para plotter</p>
          <p>Rollos térmicos</p>
        </div>
      </div>

      <div class="services-main-grid">
        <article
          v-for="service in services"
          :key="service.title"
          class="service-feature-card"
        >
          <div class="service-feature-visual">
            <img
              v-if="service.image"
              :src="service.image"
              :alt="service.title"
              class="service-feature-image"
              loading="lazy"
            >

            <div v-else class="service-icon-scene">
              <span class="service-drop service-drop-pink" />
              <span class="service-drop service-drop-cyan" />
              <span class="service-drop service-drop-yellow" />
              <strong>{{ service.title.slice(0, 3).toUpperCase() }}</strong>
            </div>
          </div>

          <div class="service-feature-copy">
            <h2>{{ service.title }}</h2>

            <p>{{ service.description }}</p>

            <a
              class="mayecy-button mayecy-button-primary"
              :href="service.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ service.action }}
            </a>
          </div>
        </article>
      </div>

      <div class="brands-section">
        <div class="section-heading">
          <span class="home-eyebrow">Marcas</span>

          <h2 class="section-title">
            Las marcas que nos brindan su confianza
          </h2>
        </div>

        <div class="brand-grid">
          <article
            v-for="brand in brands"
            :key="brand.name"
            class="brand-chip"
            :aria-label="brand.name"
          >
            <img
              class="brand-logo"
              :src="brand.image"
              :alt="`Logo ${brand.name}`"
              loading="lazy"
            >
          </article>
        </div>
      </div>

      <div class="extra-services-section">
        <div class="section-heading">
          <span class="home-eyebrow">Atención Mayecy</span>

          <h2 class="section-title">
            Asesoramiento e insumos para cada necesidad
          </h2>
        </div>

        <div class="extra-services-grid">
          <article
            v-for="item in extraServices"
            :key="item.title"
            class="extra-service-card"
          >
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>