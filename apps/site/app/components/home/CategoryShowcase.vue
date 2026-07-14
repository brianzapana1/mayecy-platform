<script setup>
import { homeContent } from '~/data/home'

const categories = homeContent.categories
</script>

<template>
  <section class="category-section">
    <div class="container">
      <div class="section-heading">
        <span class="home-eyebrow">
          Categorías principales
        </span>

        <h2 class="section-title">
          Productos y materiales para su oficina
        </h2>

        <p class="section-description">
          Encuentra insumos para impresión, papel para plotter, rollos térmicos,
          papelería y productos para el trabajo diario de tu oficina.
        </p>
      </div>

      <div class="category-grid">
        <article
          v-for="category in categories"
          :key="category.name"
          class="category-card"
          :class="`category-card-${category.accent}`"
        >
          <div class="category-image-wrap">
            <img
              v-if="category.image"
              class="category-image"
              :src="category.image"
              :alt="category.name"
              loading="lazy"
            >
          </div>

          <h3>
            {{ category.name }}
          </h3>

          <p>
            {{ category.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>