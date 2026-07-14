<script setup>
import { homeContent } from '~/data/home'

const hero = homeContent.hero
</script>

<template>
  <section class="home-hero">
    <div class="container home-hero-single">
      <div class="home-hero-logo-stage">
        <div class="home-hero-logo-oval">
          <img
            class="hero-logo"
            src="/images/brand/logo-mayecy.png"
            alt="Mayecy Insumos"
          >
        </div>

        <span
          class="home-hero-decoration home-hero-decoration-pink"
          aria-hidden="true"
        />

        <span
          class="home-hero-decoration home-hero-decoration-cyan"
          aria-hidden="true"
        />

        <span
          class="home-hero-decoration home-hero-decoration-yellow"
          aria-hidden="true"
        />
      </div>

      <div class="home-hero-content">
        <h1 class="home-hero-title">
          {{ hero.title }}
        </h1>

        <p class="home-hero-subtitle">
          {{ hero.subtitle }}
        </p>

        <div class="home-hero-offers">
          <h2 class="home-hero-offers-title">
            {{ hero.offerTitle }}
          </h2>

          <ul class="home-hero-offers-list">
            <li
              v-for="item in hero.offerItems"
              :key="item"
            >
              <span aria-hidden="true">★</span>
              <strong>{{ item }}</strong>
            </li>
          </ul>
        </div>

        <p class="home-hero-description">
          {{ hero.description }}
        </p>

        <div class="home-hero-actions">
          <NuxtLink
            class="mayecy-button mayecy-button-primary"
            :to="hero.primaryAction.to"
          >
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
    </div>
  </section>
</template>