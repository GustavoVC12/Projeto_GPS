<script setup>
defineProps({ cards: { type: Array, default: () => [] }, selectedIds: { type: Object, default: () => new Set() }, loading: Boolean })
defineEmits(['toggle'])
</script>

<template>
  <div v-if="loading && !cards.length" class="card-grid loading-grid"><div v-for="i in 12" :key="i" class="card-skeleton"></div></div>
  <div v-else-if="cards.length" class="card-grid">
    <button v-for="card in cards" :key="card.id" class="card-tile" :class="{ selected: selectedIds.has(card.id) }" :aria-pressed="selectedIds.has(card.id)" :aria-label="`${card.name}, ${selectedIds.has(card.id) ? 'remover da coleção' : 'adicionar à coleção'}`" @click="$emit('toggle', card)">
      <img v-if="card.image" :src="card.image" :alt="`Carta ${card.name}`" loading="lazy" />
      <span v-else class="card-placeholder"><small>{{ card.setName }}</small><strong>{{ card.name }}</strong><small>{{ card.rarity || 'Carta Pokémon' }}</small></span>
      <span class="selected-badge"><span>✓</span> Na coleção</span>
    </button>
  </div>
  <div v-else class="empty-state"><span class="empty-icon">⌕</span><h3>Nenhuma carta encontrada</h3><p>Experimente outro nome ou ajuste os filtros.</p></div>
</template>
