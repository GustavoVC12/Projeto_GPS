<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCollectionStore } from '../stores/collection'
import CollectionDetail from '../components/CollectionDetail.vue'
import SetCard from '../components/SetCard.vue'
import { getSets } from '../services/tcgdex'

const collection = useCollectionStore()
const router = useRouter()
const search = ref('')
const activeCollectionId = ref(null)
const sets = ref([])
const setSearch = ref('')
const activeCollection = computed(() => collection.savedCollections.find(item => item.id === activeCollectionId.value) || null)
const filteredCollections = computed(() => collection.savedCollections.filter(item => item.name.toLocaleLowerCase('pt-BR').includes(search.value.trim().toLocaleLowerCase('pt-BR'))))
const totalCards = computed(() => collection.savedCollections.reduce((sum, item) => sum + item.cards.reduce((total, card) => total + (card.quantity || 1), 0), 0))
const predefinedSets = computed(() => sets.value.filter(set => set.name.toLocaleLowerCase('pt-BR').includes(setSearch.value.trim().toLocaleLowerCase('pt-BR'))).map(set => {
  const owned = Object.values(collection.cards).filter(card => card.setId === set.id).reduce((sum, card) => sum + (card.quantity || 1), 0)
  const progress = set.cardCount ? Math.min(100, Math.round(owned / set.cardCount * 100)) : 0
  return { ...set, collected: owned, percent: progress }
}))

function openSet(set) { router.push({ name: 'collection-set', params: { setId: set.id } }) }

onMounted(async () => { try { sets.value = await getSets() } catch { sets.value = [] } })

function updateQuantity(cardId, quantity) {
  if (activeCollection.value) collection.updateSavedCollectionCard(activeCollection.value.id, cardId, quantity)
}
function clearActiveCollection() {
  if (!activeCollection.value) return
  collection.deleteCollection(activeCollection.value.id)
  activeCollectionId.value = null
}
function editCollection(id) {
  activeCollectionId.value = null
  router.push({ path: '/catalogo', query: { editarColecao: id } })
}
</script>

<template>
  <div class="page-content collections-view">
    <section class="page-heading"><div><span class="eyebrow">SUA JORNADA COMO COLECIONADOR</span><h1>Minhas coleções</h1><p>Suas coleções personalizadas e cartas favoritas.</p></div><div class="collection-total"><span class="total-icon">✦</span><span><strong>{{ totalCards }}</strong><small>{{ totalCards === 1 ? 'carta nas coleções' : 'cartas nas coleções' }}</small></span></div></section>
    <div class="collection-toolbar"><label class="collection-search"><span>⌕</span><input v-model="search" placeholder="Buscar coleção..." /></label><span class="set-count">{{ filteredCollections.length }} {{ filteredCollections.length === 1 ? 'coleção' : 'coleções' }}</span></div>

    <div v-if="filteredCollections.length" class="named-collections-grid">
      <article v-for="saved in filteredCollections" :key="saved.id" class="named-collection-card">
        <div class="named-card-top"><span class="named-card-icon">▤</span><button type="button" :aria-label="`Excluir coleção ${saved.name}`" @click="collection.deleteCollection(saved.id)">×</button></div>
        <button type="button" class="saved-collection-open" @click="activeCollectionId = saved.id"><strong>{{ saved.name }}</strong><span>{{ saved.cards.reduce((sum, card) => sum + (card.quantity || 1), 0) }} {{ saved.cards.length === 1 ? 'carta' : 'cartas' }}</span><span class="saved-open-label">Abrir coleção <b>↗</b></span></button>
        <div class="named-card-thumbnails"><img v-for="card in saved.cards.slice(0, 5)" :key="card.id" :src="card.image" :alt="card.name" loading="lazy" /></div>
      </article>
    </div>
    <section class="predefined-sets-section">
      <div class="named-section-heading"><div><span class="eyebrow">COLEÇÕES DO JOGO</span><h2>Expansões do TCG Pocket</h2></div><span class="set-count">{{ predefinedSets.length }} expansões</span></div>
      <div class="collection-toolbar"><label class="collection-search"><span>⌕</span><input v-model="setSearch" placeholder="Buscar expansão..." /></label></div>
      <div v-if="predefinedSets.length" class="sets-grid"><SetCard v-for="set in predefinedSets" :key="set.id" :set="set" @open="openSet" /></div>
      <p v-else class="set-count">Carregando expansões ou nenhuma expansão encontrada.</p>
    </section>
    <section v-if="!filteredCollections.length" class="collections-empty"><div class="empty-orbit"><span>✦</span><i></i><i></i><i></i></div><h2>{{ search ? 'Nenhuma coleção encontrada' : 'Suas coleções aparecerão aqui' }}</h2><p>{{ search ? 'Tente buscar por outro nome.' : 'No catálogo, selecione as cartas que deseja agrupar, dê um nome à coleção e salve.' }}</p><RouterLink to="/catalogo" class="primary-button"><span>＋</span> Criar uma coleção</RouterLink><div v-if="!search" class="empty-art"><img src="../assets/pokCatalogo.png" alt="Pokémon prontos para sua próxima aventura" /></div></section>

    <CollectionDetail v-if="activeCollection" :set="{ ...activeCollection, serie: 'Coleção personalizada' }" @close="activeCollectionId = null" @quantity="updateQuantity" @clear="clearActiveCollection" @edit="editCollection" />
  </div>
</template>
