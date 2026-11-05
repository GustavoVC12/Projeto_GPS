<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import { computed } from 'vue'

const route = useRoute()
const showTopbar = computed(() => route.path !== '/')
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="main-area">
      <header v-if="showTopbar" class="topbar"><RouterLink to="/" class="brand">PokApp</RouterLink></header>
      <RouterView />
    </main>
  </div>
</template>

<style>
@import './styles/main.css';
</style>
