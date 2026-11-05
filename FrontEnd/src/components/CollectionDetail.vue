<script setup>
defineProps({ set: Object })
defineEmits(['close', 'quantity', 'clear', 'edit'])
</script>
<template>
  <div class="modal-backdrop" @click.self="$emit('close')" @keydown.esc="$emit('close')">
    <section class="collection-modal" role="dialog" aria-modal="true" :aria-label="`Coleção ${set.name}`">
      <button class="modal-close" aria-label="Fechar" @click="$emit('close')">×</button>
      <div class="modal-heading"><div class="modal-logo"><img v-if="set.logo" :src="set.logo" alt="" /><span v-else>✦</span></div><div><span class="eyebrow">{{ set.serie }}</span><h2>{{ set.name }}</h2><p>{{ set.cards.length }} cartas na sua coleção</p></div></div>
      <div v-if="set.cards.length" class="owned-list"><article v-for="card in set.cards" :key="card.id" class="owned-card"><img :src="card.image" :alt="card.name" /><div class="owned-card-copy"><strong>{{ card.name }}</strong><span>{{ card.rarity || 'Carta' }}<template v-if="card.localId"> · {{ card.localId }}</template></span></div><div class="quantity-control"><button :aria-label="`Diminuir ${card.name}`" @click="$emit('quantity', card.id, card.quantity - 1)">−</button><span>{{ card.quantity }}</span><button :aria-label="`Aumentar ${card.name}`" :disabled="card.quantity >= 2" @click="$emit('quantity', card.id, card.quantity + 1)">+</button></div></article></div>
      <div v-else class="empty-modal">Ainda não adicionou cartas desta expansão.</div>
      <footer class="modal-footer"><span>{{ set.cards.reduce((sum, card) => sum + (card.quantity || 1), 0) }} cartas registradas</span><div class="modal-actions"><button class="text-edit" @click="$emit('edit', set.id)">Editar coleção</button><button class="text-danger" @click="$emit('clear', set.id)">Excluir coleção</button></div></footer>
    </section>
  </div>
</template>
