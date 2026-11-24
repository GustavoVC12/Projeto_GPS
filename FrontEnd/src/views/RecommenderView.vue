<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCollectionStore } from '../stores/collection'
import { getCards, getSetDetails, getSets } from '../services/tcgdex'

const collection = useCollectionStore()
const sets = ref([])
const results = ref([])
const selectedCollectionId = ref('')
const wishlistOnly = ref(false)
const loadingSets = ref(false)
const calculating = ref(false)
const progress = ref(0)
const error = ref('')
const calculated = ref(false)
const cardCache = new Map()
const knownPocketBoosters = {
  // A1a (Ilha Mítica) tem um único pacote, ilustrado pelo Mew.
  A1a: [{
    id: 'boo_A1a-mew',
    name: 'Mew',
    artwork_front: 'https://assets.tcgdex.net/en/tcgp/A1a/boosters/mew-front',
  }],
  // A2a (Luz Triunfante) tem um único pacote, ilustrado pelo Arceus.
  A2a: [{
    id: 'boo_A2a-arceus',
    name: 'Arceus',
    artwork_front: 'https://assets.tcgdex.net/en/tcgp/A2a/boosters/arceus-front',
  }],
  // B2a é um pacote temático único; a TCGdex o chama de "Paldea".
  B2a: [{
    id: 'boo_B2a-paldea',
    name: 'Paldean Wonders',
  }],
}

const selectedCollection = computed(() => selectedCollectionId.value === '__inventory__'
  ? null
  : selectedCollectionId.value.startsWith('predefined:')
    ? sets.value.find(item => item.id === selectedCollectionId.value.slice('predefined:'.length)) || null
    : collection.savedCollections.find(item => item.id === selectedCollectionId.value) || null)
const isPredefinedCollection = computed(() => selectedCollectionId.value.startsWith('predefined:'))
const ownedCards = computed(() => isPredefinedCollection.value
  ? Object.values(collection.cards).filter(card => card.setId === selectedCollection.value?.id)
  : selectedCollection.value?.cards || Object.values(collection.cards))
const ownedIds = computed(() => new Set(ownedCards.value.map(card => card.id)))
const wishedCards = computed(() => Object.values(collection.wishlist))

async function loadSets() {
  loadingSets.value = true
  try {
    sets.value = await getSets()
    error.value = ''
  } catch (cause) {
    error.value = `Não foi possível carregar as expansões. ${cause.message}`
  } finally {
    loadingSets.value = false
  }
}

async function cardsFor(set) {
  if (!cardCache.has(set.id)) cardCache.set(set.id, getCards(set.id, { includeBoosterDetails: true }))
  return cardCache.get(set.id)
}

function normalizeBooster(booster) {
  const artwork = booster.artwork_front || booster.artworkFront || booster.logo || ''
  const nameFromId = String(booster.id || '')
    .replace(/^boo_[A-Z0-9]+-?/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toLocaleUpperCase('pt-BR'))
  return {
    id: booster.id || booster.name,
    name: booster.name || nameFromId || 'Booster sem nome informado pela API',
    artwork: artwork && !/\.(png|jpe?g|webp)(\?.*)?$/i.test(artwork) ? `${artwork}.webp` : artwork,
  }
}

async function calculateRecommendations() {
  error.value = ''
  results.value = []
  calculated.value = false
  if (!isPredefinedCollection.value || !selectedCollection.value) {
    error.value = 'Escolha uma expansão oficial do Pocket para descobrir qual booster dela abrir.'
    return
  }
  if (wishlistOnly.value && !wishedCards.value.length) {
    error.value = 'Destaque cartas no catálogo usando a estrela para calcular recomendações pela sua lista de interesse.'
    return
  }
  calculating.value = true
  progress.value = 0
  try {
    const [cards, setDetails] = await Promise.all([
      cardsFor(selectedCollection.value),
      getSetDetails(selectedCollection.value.id),
    ])
    const targets = wishlistOnly.value
      ? wishedCards.value.filter(card => card.setId === selectedCollection.value.id)
      : cards
    const boosters = new Map()
    ;(setDetails?.boosters || []).forEach(rawBooster => {
      const booster = normalizeBooster(rawBooster)
      if (booster.id) boosters.set(booster.id, booster)
    })
    cards.forEach(card => (card.boosters || []).forEach(rawBooster => {
      const booster = normalizeBooster(rawBooster)
      if (booster.id) boosters.set(booster.id, booster)
    }))

    if (!boosters.size) {
      ;(knownPocketBoosters[selectedCollection.value.id] || []).forEach(rawBooster => {
        const booster = normalizeBooster(rawBooster)
        boosters.set(booster.id, booster)
      })
    } else {
      const known = knownPocketBoosters[selectedCollection.value.id] || []
      if (known.length === 1 && boosters.size === 1) {
        const [sourceBooster] = boosters.values()
        const [knownBooster] = known.map(normalizeBooster)
        boosters.clear()
        boosters.set(knownBooster.id, {
          ...sourceBooster,
          ...knownBooster,
          id: sourceBooster.id,
          artwork: sourceBooster.artwork || knownBooster.artwork,
        })
      }
    }

    if (!boosters.size) {
      error.value = 'A API não informou as artes de booster desta expansão, então não é possível identificar qual pacote abrir.'
      return
    }

    results.value = [...boosters.values()].map(booster => {
      const availableCards = cards.filter(card => !card.boosters?.length || card.boosters.some(item => (item.id || item.name) === booster.id))
      const boosterTargets = targets.filter(card => availableCards.some(available => available.id === card.id))
      const missing = boosterTargets.filter(card => !ownedIds.value.has(card.id))
      return {
        ...booster,
          availableCards,
        targetCount: boosterTargets.length,
        missing,
        owned: boosterTargets.length - missing.length,
        coverage: boosterTargets.length ? missing.length / boosterTargets.length : 0,
      }
    })
      .filter(item => item.targetCount && item.missing.length)
      .sort((a, b) => b.coverage - a.coverage || b.missing.length - a.missing.length)
    calculated.value = true
    if (!results.value.length) {
      error.value = wishlistOnly.value
        ? 'Nenhuma carta destacada e faltante está disponível nos boosters desta expansão.'
        : 'Todas as cartas desta expansão já estão registradas na coleção.'
    }
  } catch (cause) {
    error.value = `Não foi possível consultar os boosters desta expansão. ${cause.message}`
  } finally {
    progress.value = 1
    calculating.value = false
  }
}

onMounted(loadSets)
</script>

<template>
  <div class="page-content recommender-view">
    <section class="page-heading">
      <div>
        <span class="eyebrow">MOTOR DE RECOMENDAÇÃO</span>
        <h1>Qual booster abrir?</h1>
        <p>Escolha uma expansão e veja qual booster dela pode trazer mais cartas que faltam.</p>
      </div>
      <RouterLink to="/catalogo" class="secondary-button">Destacar cartas no catálogo <span>↗</span></RouterLink>
    </section>

    <section class="recommendation-controls" aria-label="Opções de recomendação">
      <div class="recommendation-control-copy">
        <span class="recommendation-step">01</span>
        <div><strong>Escolha uma expansão</strong><p>Comparamos os boosters que podem trazer as cartas que faltam.</p></div>
      </div>
      <label class="recommendation-select"><span>Coleção analisada</span>
        <select v-model="selectedCollectionId">
          <option disabled value="">Selecione uma expansão oficial</option>
          <optgroup label="Expansões oficiais do Pocket">
            <option v-for="set in sets" :key="`predefined:${set.id}`" :value="`predefined:${set.id}`">{{ set.name }} · {{ Object.values(collection.cards).filter(card => card.setId === set.id).length }} registradas</option>
          </optgroup>
        </select>
      </label>
      <label class="wishlist-option">
        <input v-model="wishlistOnly" type="checkbox" />
        <span class="wishlist-checkbox">★</span>
        <span><strong>Priorizar lista de interesse</strong><small>Considera somente cartas marcadas com estrela</small></span>
      </label>
      <button type="button" class="primary-button recommendation-submit" :disabled="calculating || loadingSets" @click="calculateRecommendations">
        <span v-if="calculating" class="spinner"></span>
        {{ calculating ? 'Analisando boosters...' : 'Encontrar booster recomendado' }}
      </button>
    </section>

    <div v-if="error" class="recommendation-message" role="status">{{ error }}</div>

    <section v-if="results.length" class="recommendation-results" aria-live="polite">
      <div class="recommendation-results-heading">
        <div><span class="eyebrow">RECOMENDAÇÃO PARA HOJE</span><h2>Boosters de {{ selectedCollection?.name }}</h2></div>
        <span>{{ results.length }} {{ results.length === 1 ? 'booster disponível' : 'boosters disponíveis' }}</span>
      </div>
      <article v-for="(result, index) in results" :key="result.id" class="recommendation-card" :class="{ 'recommendation-top': index === 0 }">
        <span class="recommendation-rank">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="recommendation-set-icon"><img v-if="result.artwork" :src="result.artwork" :alt="`Arte do booster ${result.name}`" /><span v-else>✦</span></div>
        <div class="recommendation-set-info">
          <span class="eyebrow">{{ results.length === 1 ? 'ÚNICO BOOSTER DA EXPANSÃO' : `BOOSTER ${index === 0 ? 'RECOMENDADO' : 'ALTERNATIVO'}` }}</span>
          <h3>{{ result.name }}</h3>
          <p>{{ result.missing.length }} {{ result.missing.length === 1 ? 'carta faltante disponível' : 'cartas faltantes disponíveis' }} · {{ result.owned }} de {{ result.targetCount }} já registradas</p>
          <div class="recommendation-progress"><span :style="{ width: `${Math.max(2, (result.owned / Math.max(1, result.targetCount)) * 100)}%` }"></span></div>
          <div class="recommendation-samples">
            <img v-for="card in result.missing.slice(0, 5)" :key="card.id" :src="card.image" :alt="card.name" :title="`${card.name} · ${card.rarity || 'Raridade não informada'}`" loading="lazy" />
            <span v-if="result.missing.length > 5">+{{ result.missing.length - 5 }}</span>
          </div>
        </div>
        <div class="recommendation-score"><strong v-if="results.length > 1">{{ (result.coverage * 100).toFixed(1) }}%</strong><strong v-else>Único</strong><small>{{ results.length > 1 ? 'cartas-alvo faltantes' : 'booster disponível' }}</small></div>
      </article>
    </section>

    <section v-else-if="!error && !calculating && calculated" class="recommendation-empty"><span>✓</span><h2>Você já tem todas as cartas alvo</h2><p>Troque a coleção analisada ou desative o filtro da lista de interesse para explorar outras cartas.</p></section>

    <aside class="recommendation-note">
      <span>i</span>
      <p><strong>Como escolher:</strong> a TCGdex informa quais cartas aparecem em cada booster e fornece a arte do pacote. O percentual compara a quantidade de cartas-alvo disponíveis que ainda falta; não é a chance matemática de uma carta individual. Para isso, é preciso consultar as taxas oficiais por carta e posição no Pokémon TCG Pocket.</p>
    </aside>
  </div>
</template>
