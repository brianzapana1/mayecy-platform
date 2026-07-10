<script setup>
import { homeContent } from '~/data/home'

const offer = homeContent.offer
</script>

<template>
  <section class="offer-section">
    <div class="container offer-card">
      <div>
        <span class="home-eyebrow">
          {{ offer.badge }}
        </span>

        <h2 class="offer-title">
          {{ offer.title }}
        </h2>

        <p class="offer-description">
          {{ offer.description }}
        </p>
      </div>

      <a
        class="mayecy-button mayecy-button-primary"
        :href="offer.actionHref"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ offer.actionLabel }}
      </a>
    </div>
  </section>
</template>