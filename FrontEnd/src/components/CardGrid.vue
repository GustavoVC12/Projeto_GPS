<script setup>
import { ref } from 'vue'
const props = defineProps({ cards: { type: Array, default: () => [] }, selectedIds: { type: Object, default: () => new Set() }, wishlistIds: { type: Object, default: () => new Set() }, loading: Boolean })
const failedImages = ref(new Set())
function markImageFailed(id) { failedImages.value = new Set(failedImages.value).add(id) }
function recoverImage(event, card) {
  const image = event.target
  const candidates = [
    card.image?.replace(/\/high\.webp(?:\?.*)?$/, '/low.webp'),
    card.image?.replace(/\/high\.webp(?:\?.*)?$/, '/high.png'),
    card.setId && card.localId ? `https://assets.tcgdex.net/pt/tcgp/${card.setId}/${card.localId}/high.webp` : '',
    card.setId && card.localId ? `https://assets.tcgdex.net/en/tcgp/${card.setId}/${card.localId}/high.webp` : '',
  ].filter(Boolean)
  const available = candidates.filter(candidate => candidate !== image.src)
  const next = available[Number(image.dataset.fallbackAttempt || 0)]
  if (next) {
    image.dataset.fallbackAttempt = String(Number(image.dataset.fallbackAttempt || 0) + 1)
    image.src = next
  } else markImageFailed(card.id)
}
defineEmits(['toggle', 'toggle-wishlist'])
</script>

<template>
  <div v-if="loading && !cards.length" class="card-grid loading-grid"><div v-for="i in 12" :key="i" class="card-skeleton"></div></div>
  <div v-else-if="cards.length" class="card-grid">
    <article v-for="card in cards" :key="card.id" class="card-tile" :class="{ selected: selectedIds.has(card.id) }">
      <button type="button" class="card-image-action" :aria-pressed="selectedIds.has(card.id)" :aria-label="`${card.name}, ${selectedIds.has(card.id) ? 'remover da coleção' : 'adicionar à coleção'}`" @click="$emit('toggle', card)">
        <img v-if="card.image && !failedImages.has(card.id)" :src="card.image" :alt="`Carta ${card.name}`" loading="lazy" @error="recoverImage($event, card)" />
        <span v-else class="card-placeholder"><small>{{ card.setName }}</small><strong>{{ card.name }}</strong><small>{{ card.rarity || 'Carta Pokémon' }}</small></span>
        <span class="selected-badge"><span>✓</span> Na coleção</span>
      </button>
      <button type="button" class="wishlist-toggle" :class="{ active: wishlistIds.has(card.id) }" :aria-pressed="wishlistIds.has(card.id)" :aria-label="`${wishlistIds.has(card.id) ? 'Remover' : 'Destacar'} ${card.name} ${wishlistIds.has(card.id) ? 'da' : 'na'} lista de interesse`" :title="wishlistIds.has(card.id) ? 'Remover da lista de interesse' : 'Adicionar à lista de interesse'" @click="$emit('toggle-wishlist', card)">{{ wishlistIds.has(card.id) ? '★' : '☆' }}</button>
    </article>
  </div>
  <div v-else class="empty-state"><span class="empty-icon">⌕</span><h3>Nenhuma carta encontrada</h3><p>Experimente outro nome ou ajuste os filtros.</p></div>
</template>
