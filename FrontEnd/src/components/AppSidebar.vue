<script setup>
import { RouterLink } from 'vue-router'
import ball from '../assets/bolaPokemon.png'
</script>

<template>
  <aside class="sidebar">
    <RouterLink class="ball-mark" to="/" aria-label="PokApp"><img :src="ball" alt="Pokébola" /></RouterLink>
    <nav aria-label="Navegação principal">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/catalogo">Catalogo</RouterLink>
      <RouterLink to="/colecoes">Coleções</RouterLink>
      <RouterLink to="/recomendacoes">Recomendações</RouterLink>
    </nav>
    <img class="trainer-art" src="../assets/Ash Ketchum.png" alt="Treinador Pokémon" />
  </aside>
</template>
