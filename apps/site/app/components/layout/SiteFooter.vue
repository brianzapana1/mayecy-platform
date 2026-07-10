<script setup>
const currentYear = new Date().getFullYear()

const quickLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Quiénes somos', to: '/quienes-somos' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Productos', to: '/productos' },
  { label: 'Contacto', to: '/contacto' }
]

const whatsappNumber = '59171930704'

const whatsappMessage = encodeURIComponent(
  'Hola Mayecy, quiero consultar información sobre sus productos.'
)

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
</script>

<template>
  <footer class="site-footer">
    <div class="footer-orb footer-orb-magenta" />
    <div class="footer-orb footer-orb-cyan" />
    <div class="footer-orb footer-orb-yellow" />
    <div class="footer-orb footer-orb-soft" />

    <div class="container footer-inner">
      <div class="footer-main">
        <section class="footer-brand-area">
          <NuxtLink to="/" class="footer-logo-link">
            <img
              class="footer-logo"
              src="/images/brand/logo-mayecy.png"
              alt="Mayecy Insumos"
            >
          </NuxtLink>

          <p class="footer-lead">
            Variedad de insumos para impresoras y fotocopiadoras en La Paz.
          </p>

          <a
            class="footer-primary-action"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp
          </a>
        </section>

        <div class="footer-divider" />

        <section class="footer-group">
          <h3>Mapa del sitio</h3>

          <nav class="footer-nav" aria-label="Navegación del pie de página">
            <NuxtLink
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </section>

        <div class="footer-divider" />

        <section class="footer-group">
          <h3>Contacto</h3>

          <div class="footer-contact">
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              +591 71930704
            </a>

            <span>(2) 2313865</span>
            <span>Calle México No. 1483
            <br /> esq. Nicolás Acosta, Zona San Pedro <br />La Paz</span>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <p>
          Copyright © {{ currentYear }} Mayecy. Todos los derechos reservados. La Paz, Bolivia — Desarrollo web por Brian Zapana.
        </p>
      </div>
    </div>
  </footer>
</template>