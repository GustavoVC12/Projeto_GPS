<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCollectionStore } from '../stores/collection'

const props = defineProps({ editingCollection: { type: Object, default: null } })
const collection = useCollectionStore()
const router = useRouter()
const name = ref('')
const message = ref('')
const editingId = computed(() => props.editingCollection?.id || '')
const isEditing = computed(() => Boolean(props.editingCollection))
const cards = computed(() => (isEditing.value ? props.editingCollection.cards : Object.values(collection.cards)).slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
const cardCount = computed(() => cards.value.reduce((sum, card) => sum + (card.quantity || 1), 0))

watch(() => props.editingCollection?.name, value => { name.value = value || ''; message.value = '' }, { immediate: true })

function updateName(event) {
  name.value = event.target.value
  message.value = ''
  if (isEditing.value) collection.renameSavedCollection(editingId.value, name.value)
}

function save() {
  if (isEditing.value) {
    if (!name.value.trim()) {
      message.value = 'O nome da coleção não pode ficar vazio.'
      return
    }
    router.push('/colecoes')
    return
  }
  if (!name.value.trim()) {
    message.value = 'Dê um nome para sua coleção.'
    return
  }
  if (!cardCount.value) {
    message.value = 'Adicione cartas ao catálogo antes de salvar.'
    return
  }
  collection.saveCollection(name.value)
  message.value = `“${name.value.trim()}” foi salva.`
  name.value = ''
}

function removeCard(card) {
  if (isEditing.value) collection.toggleSavedCollectionCard(editingId.value, card)
  else collection.toggle(card)
}
function clearCards() {
  cards.value.slice().forEach(removeCard)
}
</script>

<template>
  <aside class="collection-builder" :aria-label="isEditing ? `Editar coleção ${props.editingCollection.name}` : 'Criar coleção'">
    <div class="builder-heading">
      <span class="builder-icon">▤</span>
      <div><span class="eyebrow">{{ isEditing ? 'ALTERE NOME E CARTAS' : 'ORGANIZE SUAS CARTAS' }}</span><h2>{{ isEditing ? 'Editar coleção' : 'Criar coleção' }}</h2></div>
    </div>
    <form class="builder-form" @submit.prevent="save">
      <label for="collection-name">{{ isEditing ? 'Nome desta coleção' : 'Nome da coleção' }}</label>
      <div class="builder-name-row"><input id="collection-name" :value="name" maxlength="40" :placeholder="isEditing ? 'Nome da coleção' : 'Ex.: Cartas favoritas'" @input="updateName" /><button type="submit">{{ isEditing ? 'Concluir' : 'Salvar' }}</button></div>
    </form>
    <div class="builder-summary"><div><strong>{{ cardCount }}</strong><span>{{ isEditing ? 'cartas nesta coleção' : 'cartas selecionadas' }}</span></div><RouterLink to="/colecoes">Minhas coleções <span>↗</span></RouterLink></div>
    <p v-if="message" class="builder-message" role="status">{{ message }}</p>
    <div class="builder-list-heading"><strong>{{ isEditing ? 'Cartas nesta coleção' : 'Cartas selecionadas' }}</strong><button v-if="cards.length" type="button" @click="clearCards">Limpar seleção</button></div>
    <div v-if="cards.length" class="builder-card-list">
      <article v-for="card in cards" :key="card.id" class="builder-card">
        <img v-if="card.image" :src="card.image" :alt="card.name" loading="lazy" />
        <div v-else class="builder-card-placeholder">✦</div>
        <div class="builder-card-copy"><strong>{{ card.name }}</strong><span>{{ card.setName }}</span></div>
        <button type="button" class="builder-remove" :aria-label="`Remover ${card.name} da coleção`" @click="removeCard(card)">×</button>
      </article>
    </div>
    <div v-else class="builder-empty"><span>＋</span><strong>Sua coleção está vazia</strong><p>Clique nas cartas do catálogo para adicioná-las aqui.</p></div>
    <div class="builder-footer"><span>{{ isEditing ? 'As alterações são salvas automaticamente.' : 'As coleções ficam salvas neste dispositivo.' }}</span></div>
  </aside>
</template>
