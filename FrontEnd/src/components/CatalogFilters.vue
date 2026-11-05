<script setup>
import { cardTypes } from '../data/types'
const props = defineProps({ search: String, type: String, setId: String, sets: Array, rarity: String, loading: Boolean })
const emit = defineEmits(['update:search', 'update:type', 'update:setId', 'update:rarity'])
</script>

<template>
  <section class="filter-panel" aria-label="Filtros do catálogo">
    <label class="search-field"><span>⌕</span><input :value="search" placeholder="Buscar carta ou expansão..." @input="emit('update:search', $event.target.value)" /></label>
    <div class="type-filter">
      <button class="type-pill all-pill" :class="{ active: !type }" @click="emit('update:type', '')">Todos os tipos</button>
      <button v-for="item in cardTypes" :key="item.id" class="type-pill" :class="{ active: type === item.id }" :title="item.label" :aria-label="item.label" :style="{ '--type-color': item.color }" @click="emit('update:type', type === item.id ? '' : item.id)">{{ item.icon }}</button>
    </div>
    <div class="select-row">
      <label class="select-wrap"><span>Expansão</span><select :value="setId" @change="emit('update:setId', $event.target.value)"><option value="">Todas as expansões</option><option v-for="set in sets" :key="set.id" :value="set.id">{{ set.name }}</option></select></label>
      <label class="select-wrap"><span>Raridade</span><select :value="rarity" @change="emit('update:rarity', $event.target.value)"><option value="">Todas as raridades</option><option v-for="item in ['Comum', 'Incomum', 'Rara', 'Dupla Rara', 'Ilustração rara', 'Ilustração especial rara', 'Imersiva rara', 'Coroa rara']" :key="item">{{ item }}</option></select></label>
      <div v-if="loading" class="loading-hint"><span class="spinner"></span> Carregando dados</div>
    </div>
  </section>
</template>
