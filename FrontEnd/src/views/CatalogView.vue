<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CatalogFilters from '../components/CatalogFilters.vue'
import CardGrid from '../components/CardGrid.vue'
import CollectionBuilder from '../components/CollectionBuilder.vue'
import { getCards, getFeaturedCards, getSets } from '../services/tcgdex'
import { useCollectionStore } from '../stores/collection'

const route = useRoute()
const router = useRouter()
const collection = useCollectionStore()
const editingCollectionId = computed(() => typeof route.query.editarColecao === 'string' ? route.query.editarColecao : '')
const editingCollection = computed(() => collection.savedCollections.find(item => item.id === editingCollectionId.value) || null)
const selectedIds = computed(() => editingCollection.value ? new Set(editingCollection.value.cards.map(card => card.id)) : collection.selectedIds)
const sets = ref([])
const cards = ref([])
const search = ref('')
const type = ref('')
const rarity = ref('')
const setId = ref(typeof route.query.expansao === 'string' ? route.query.expansao : '')
const loadingSets = ref(false)
const loadingCards = ref(false)
const error = ref('')
let requestNumber = 0

const filteredCards = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('pt-BR')
  return cards.value.filter(card => {
    const textMatches = !query || `${card.name} ${card.setName} ${card.id} ${card.rarity}`.toLocaleLowerCase('pt-BR').includes(query)
    return textMatches && (!type.value || card.types.includes(type.value)) && (!rarity.value || card.rarity.toLocaleLowerCase('pt-BR') === rarity.value.toLocaleLowerCase('pt-BR'))
  })
})

async function loadSets() {
  loadingSets.value = true
  try { sets.value = await getSets(); error.value = '' } catch (cause) { sets.value = []; error.value = `Falha ao carregar expansões. ${cause.message}` }
  finally { loadingSets.value = false }
}
async function loadCards() {
  const current = ++requestNumber
  loadingCards.value = true
  if (!sets.value.length && !setId.value) {
    loadingCards.value = false
    if (!error.value) error.value = 'Nenhuma expansão foi carregada. Verifique se o BackEnd está iniciado e se há conexão com a TCGdex.'
    return
  }
  try {
    const loadedCards = setId.value
      ? await getCards(setId.value)
      : await getFeaturedCards(sets.value)
    if (current !== requestNumber) return
    cards.value = loadedCards.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.setName.localeCompare(b.setName, 'pt-BR') || Number(a.localId) - Number(b.localId))
    if (!cards.value.length) error.value = 'A expansão retornou a lista vazia. Confira a conexão e tente novamente.'
  } catch (cause) {
    if (current === requestNumber) error.value = `Falha ao carregar cartas. ${cause.message}`
  } finally { if (current === requestNumber) loadingCards.value = false }
}
function selectSet(value) {
  setId.value = value
  const query = {}
  if (value) query.expansao = value
  if (editingCollectionId.value) query.editarColecao = editingCollectionId.value
  router.replace({ query })
  loadCards()
}
function toggleCard(card) {
  if (editingCollectionId.value && editingCollection.value) collection.toggleSavedCollectionCard(editingCollectionId.value, card)
  else collection.toggle(card)
}
onMounted(async () => {
  await loadSets()
  await loadCards()
})
</script>

<template>
  <div class="page-content catalog-view">
    <section class="page-heading"><div><span class="eyebrow">EXPLORE O UNIVERSO TCG POCKET</span><h1>Catálogo de cartas</h1><p>Encontre suas favoritas e adicione à coleção com um toque.</p></div><RouterLink to="/colecoes" class="collection-shortcut"><span class="shortcut-icon">▤</span><span><strong>Minha coleção</strong><small>{{ collection.count }} cartas salvas</small></span><span class="shortcut-arrow">↗</span></RouterLink></section>
    <div class="catalog-workspace">
      <section class="catalog-browser">
        <CatalogFilters v-model:search="search" v-model:type="type" :set-id="setId" :sets="sets" v-model:rarity="rarity" :loading="loadingSets || loadingCards" @update:set-id="selectSet" />
        <div class="results-heading"><span>{{ filteredCards.length }} <strong>{{ filteredCards.length === 1 ? 'carta' : 'cartas' }}</strong><template v-if="setId && sets.length"> em {{ sets.find(set => set.id === setId)?.name || setId }}</template></span><span class="click-help"><span class="click-dot">✓</span> Clique na carta para adicionar ou remover</span></div>
        <div v-if="error" class="error-banner">{{ error }} <button @click="setId ? loadCards() : loadSets().then(loadCards)">Tentar novamente</button></div>
        <CardGrid :cards="filteredCards" :selected-ids="selectedIds" :loading="loadingCards" @toggle="toggleCard" />
      </section>
      <CollectionBuilder :editing-collection="editingCollection" />
    </div>
  </div>
</template>
