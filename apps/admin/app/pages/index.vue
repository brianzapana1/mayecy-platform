<script setup>
definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Dashboard | Admin Mayecy',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div>
    <div class="admin-page-heading">
      <span class="admin-eyebrow">Resumen</span>
      <h1>Dashboard</h1>
      <p>
        Administra productos, categorías e imágenes de la página web de Mayecy.
      </p>
    </div>

    <div class="admin-grid">
      <article class="admin-card">
        <span>Productos</span>
        <h2>Catálogo web</h2>
        <p>
          Aquí construiremos el listado para crear, editar, ocultar productos y subir imágenes.
        </p>
      </article>

      <article class="admin-card">
        <span>Categorías</span>
        <h2>Organización</h2>
        <p>
          Las categorías ayudarán a ordenar el catálogo público y los filtros de búsqueda.
        </p>
      </article>

      <article class="admin-card">
        <span>Seguridad</span>
        <h2>Roles activos</h2>
        <p>
          Los permisos se controlan con Supabase Auth, roles y políticas RLS.
        </p>
      </article>
    </div>
  </div>
</template>