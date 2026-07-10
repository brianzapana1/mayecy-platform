<script setup>
import { homeContent } from '~/data/home'

const hero = homeContent.hero
</script>

<template>
  <section class="home-hero">
    <div class="container home-hero-grid">
      <div class="home-hero-copy">
        <span class="home-eyebrow">
          {{ hero.eyebrow }}
        </span>

        <h1 class="home-hero-title">
          {{ hero.title }}
        </h1>

        <p class="home-hero-description">
          {{ hero.description }}
        </p>

        <p class="home-hero-highlight">
          {{ hero.highlight }}
        </p>

        <p class="home-hero-secondary">
          {{ hero.secondaryText }}
        </p>

        <div class="home-hero-actions">
          <NuxtLink class="mayecy-button mayecy-button-primary" :to="hero.primaryAction.to">
            {{ hero.primaryAction.label }}
          </NuxtLink>

          <a
            class="mayecy-button mayecy-button-outline"
            :href="hero.secondaryAction.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ hero.secondaryAction.label }}
          </a>
        </div>
      </div>

      <div class="home-hero-visual">
        <div class="ink-card ink-card-main">
          <img
            class="hero-logo"
            src="/images/brand/logo-mayecy.png"
            alt="Mayecy Insumos"
          >

          <p>Originalidad, atención y variedad de insumos</p>
        </div>

        <div class="floating-drop drop-one" />
        <div class="floating-drop drop-two" />
        <div class="floating-drop drop-three" />
      </div>
    </div>
  </section>
</template>