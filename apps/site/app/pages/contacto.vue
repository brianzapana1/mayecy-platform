<script setup>
useSeoMeta({
  title: 'Contacto | Mayecy',
  description:
  'Contacta a Mayecy para consultar insumos, tóners, tintas, recargas, papel para plotter y productos para impresoras y fotocopiadoras en La Paz, Bolivia.'
})

const whatsappNumber = '59171930704'

const whatsappMessage = encodeURIComponent(
  'Hola Mayecy, quiero consultar información sobre sus productos.'
)

const contactCards = [
  {
    title: 'WhatsApp',
    value: '+591 71930704',
    description: 'Escríbanos para consultar productos, disponibilidad y ofertas.',
    image: '/images/contact/whatsapp.png',
    href: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
    action: 'Escríbanos'
  },
  {
    title: 'Correo',
    value: 'angelicapariguana@hotmail.com',
    description: 'También puede enviarnos sus consultas por correo electrónico.',
    image: '/images/contact/email.png',
    href: 'mailto:angelicapariguana@hotmail.com',
    action: 'Enviar correo'
  },
  {
    title: 'Teléfono',
    value: '(2) 2313865',
    description: 'Comuníquese con nosotros para atención directa.',
    image: '/images/contact/phone.png',
    href: 'tel:+59122313865',
    action: 'Llamar'
  },
  {
    title: 'Mayecy Insumos',
    value: 'Atención en La Paz',
    description: 'Venta de insumos para impresoras, fotocopiadoras, papel para plotter y material de oficina.',
    image: '/images/contact/store.png',
    href: 'https://wa.me/59171930704?text=Hola%20Mayecy%2C%20quiero%20informaci%C3%B3n%20sobre%20su%20tienda.',
    action: 'Consultar'
  }
]

const address = {
  title: 'Ubicación',
  value: 'Calle México No. 1483, esq. Nicolás Acosta, Zona San Pedro, La Paz – Bolivia',
  image: '/images/contact/location.png'
}

const mapsQuery = encodeURIComponent(
  'Mayecy Insumos, Calle México No. 1483, esquina Nicolás Acosta, Zona San Pedro, La Paz, Bolivia'
)

const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&z=18&output=embed`
const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
</script>

<template>
  <section class="contact-page">
    <div class="container">
      <div class="contact-hero">
        <div>
          <span class="home-eyebrow">Contáctenos</span>

          <h1 class="contact-title">
            Estamos para ayudarlo y nos complace su consulta
          </h1>

          <p class="contact-intro">
            Consulte sin compromiso sobre tóners, tintas, cintas, recargas, papel para plotter, repuestos e insumos para impresoras y fotocopiadoras.
          </p>
        </div>

        <div class="contact-hero-card">
          <img
            src="/images/brand/logo-mayecy.png"
            alt="Mayecy Insumos"
            class="contact-logo"
          >

          <p>Atención directa por WhatsApp, teléfono y correo.</p>
        </div>
      </div>

      <div class="contact-grid">
        <article
          v-for="card in contactCards"
          :key="card.title"
          class="contact-card"
        >
          <div class="contact-icon-frame">
            <img
              :src="card.image"
              :alt="card.title"
              class="contact-icon"
              loading="lazy"
            >
          </div>

          <div class="contact-card-content">
            <span>{{ card.title }}</span>
            <h2>{{ card.value }}</h2>
            <p>{{ card.description }}</p>

            <a
              class="mayecy-button mayecy-button-primary"
              :href="card.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ card.action }}
            </a>
          </div>
        </article>
      </div>

      <div class="contact-location">
        <div class="location-copy">
          <div class="contact-icon-frame location-icon-frame">
            <img
              :src="address.image"
              :alt="address.title"
              class="contact-icon"
              loading="lazy"
            >
          </div>

          <span class="home-eyebrow">Dónde estamos</span>

          <h2 class="section-title">
            Nuestra ubicación
          </h2>

          <p class="location-address">
            {{ address.value }}
          </p>

          <a
            class="mayecy-button mayecy-button-outline"
            :href="mapsExternalUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir en Google Maps
          </a>
        </div>

        <div class="map-card">
          <iframe
            class="google-map"
            :src="mapsEmbedUrl"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="Ubicación de Mayecy en Google Maps"
          />
        </div>
      </div>
    </div>
  </section>
</template>