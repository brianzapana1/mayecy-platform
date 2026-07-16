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
          <span class="footer-brand-title">
            Mayecy
          </span>

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

        <section class="footer-group footer-contact-group">
          <h3>Contacto</h3>

          <div class="footer-contact">
            <a
              class="footer-phone"
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Consultar a Mayecy por WhatsApp al 71930704"
            >
              <strong>
                +591 71930704
              </strong>
            </a>

            <address class="footer-address">
              <strong>
                Calle México No. 1483
              </strong>

              <span>
                Esquina Nicolás Acosta
              </span>

              <span>
                Zona San Pedro, La Paz, Bolivia
              </span>
            </address>
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