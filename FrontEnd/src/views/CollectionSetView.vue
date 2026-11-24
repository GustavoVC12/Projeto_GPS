<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCollectionStore } from '../stores/collection'
import { getCards, getSets } from '../services/tcgdex'

const props = defineProps({ setId: { type: String, required: true } })
const collection = useCollectionStore()
const set = ref(null)
const cards = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const failedImages = ref(new Set())
const visibleCards = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('pt-BR')
  return cards.value.filter(card => !query || `${card.name} ${card.rarity} ${card.localId}`.toLocaleLowerCase('pt-BR').includes(query))
})
const collectedCount = computed(() => cards.value.filter(card => collection.cards[card.id]).length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const sets = await getSets()
    set.value = sets.find(item => item.id === props.setId) || null
    if (!set.value) throw new Error('A expansão não foi encontrada.')
    cards.value = await getCards(props.setId)
  } catch (cause) {
    error.value = cause.message || 'Não foi possível carregar as cartas desta expansão.'
  } finally { loading.value = false }
}

function changeQuantity(card, delta) {
  const quantity = collection.cards[card.id]?.quantity || 0
  if (quantity === 0 && delta > 0) collection.toggle(card)
  else collection.setQuantity(card.id, quantity + delta)
}

function markImageFailed(cardId) { failedImages.value = new Set(failedImages.value).add(cardId) }

onMounted(load)
</script>

<template>
  <div class="page-content expansion-view">
    <RouterLink to="/colecoes" class="expansion-back">← Voltar para coleções</RouterLink>
    <section class="page-heading expansion-heading">
      <div><span class="eyebrow">{{ set?.serie || 'COLEÇÃO DO JOGO' }}</span><h1>{{ set?.name || 'Expansão' }}</h1><p>Registre as cartas que você já tem nesta expansão do Pokémon TCG Pocket.</p></div>
      <div class="collection-total"><span class="total-icon">✦</span><span><strong>{{ collectedCount }} / {{ cards.length || set?.cardCount || 0 }}</strong><small>cartas registradas</small></span></div>
    </section>

    <label class="collection-search expansion-search"><span>⌕</span><input v-model="search" placeholder="Buscar carta nesta expansão..." /></label>
    <div class="results-heading"><span v-if="loading">Carregando cartas…</span><span v-else>{{ visibleCards.length }} <strong>{{ visibleCards.length === 1 ? 'carta' : 'cartas' }}</strong></span><span class="click-help">Cartas cinzas ainda não registradas</span></div>
    <div v-if="error" class="error-banner">{{ error }} <button @click="load">Tentar novamente</button></div>
    <div v-if="loading" class="card-grid loading-grid"><div v-for="n in 12" :key="n" class="card-skeleton"></div></div>
    <div v-else-if="visibleCards.length" class="card-grid expansion-card-grid">
      <article v-for="card in visibleCards" :key="card.id" class="card-tile expansion-card" :class="{ 'expansion-card-owned': collection.cards[card.id], 'expansion-card-missing': !collection.cards[card.id] }">
        <div class="expansion-card-image"><img v-if="card.image && !failedImages.has(card.id)" :src="card.image" :alt="`Carta ${card.name}`" loading="lazy" @error="markImageFailed(card.id)" /><div v-else class="expansion-card-placeholder"><strong>{{ card.name }}</strong><small>{{ card.rarity || 'Carta Pokémon' }}</small></div></div>
        <div class="expansion-card-caption"><strong>{{ card.name }}</strong><span>{{ card.rarity || 'Carta' }}<template v-if="card.localId"> · {{ card.localId }}</template></span></div>
        <div class="expansion-quantity"><button type="button" :disabled="!collection.cards[card.id]" :aria-label="`Diminuir ${card.name}`" @click="changeQuantity(card, -1)">−</button><span>{{ collection.cards[card.id]?.quantity || 0 }}</span><button type="button" :disabled="(collection.cards[card.id]?.quantity || 0) >= 2" :aria-label="`Adicionar ${card.name}`" @click="changeQuantity(card, 1)">+</button></div>
      </article>
    </div>
    <div v-else-if="!loading" class="empty-state"><h3>Nenhuma carta encontrada</h3><p>Tente outro nome ou verifique a conexão com o catálogo.</p></div>
  </div>
</template>
