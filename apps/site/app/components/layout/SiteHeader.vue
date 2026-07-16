<script setup>


const isMenuOpen = ref(false)
const isScrolled = ref(false)
const navItems = [
  {
    label: 'Inicio',
    to: '/'
  },
  {
    label: 'Quiénes somos',
    to: '/quienes-somos'
  },
  {
    label: 'Servicios',
    to: '/servicios'
  },
  {
    label: 'Productos',
    to: '/productos'
  },
  {
    label: 'Contacto',
    to: '/contacto'
  }
]

const whatsappNumber = '59171930704'

const whatsappMessage = encodeURIComponent(
  'Hola Mayecy, quiero consultar información sobre sus productos.'
)

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

const closeMenu = () => {
  isMenuOpen.value = false
}


onMounted(() => {
  const desktopQuery = window.matchMedia('(min-width: 1024px)')

  const updateHeaderState = () => {
    isScrolled.value = desktopQuery.matches && window.scrollY > 24
  }

  updateHeaderState()

  window.addEventListener('scroll', updateHeaderState, { passive: true })
  desktopQuery.addEventListener('change', updateHeaderState)

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', updateHeaderState)
    desktopQuery.removeEventListener('change', updateHeaderState)
  })
})

</script>

<template>
<header class="site-header" :class="{ 'site-header-scrolled': isScrolled }">    
  <div class="header-accent" />
    <div class="container navbar">
      <NuxtLink
        to="/"
        class="brand"
        aria-label="Ir al inicio de Mayecy"
        @click="closeMenu"
      >
        <img
          class="brand-image"
          src="/images/brand/logo-mayecy.png"
          alt="Mayecy Insumos"
        >
      </NuxtLink>

      <nav class="nav-links" aria-label="Navegación principal">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          exact-active-class="nav-link-active"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="nav-actions">
        <a
          class="nav-contact"
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar
        </a>
      </div>

      <button
        class="mobile-menu-button"
        type="button"
        aria-label="Abrir menú"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <div class="mobile-panel" :hidden="!isMenuOpen">
      <div class="container">
        <div class="mobile-panel-inner">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="mobile-link"
            exact-active-class="mobile-link-active"
            @click="closeMenu"
          >
            {{ item.label }}
          </NuxtLink>

          <a
            class="mobile-whatsapp"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click="closeMenu"
          >
            Consultar
          </a>
        </div>
      </div>
    </div>
  </header>
</template>