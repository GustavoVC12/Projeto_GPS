<script setup>
defineProps({ set: { type: Object, required: true }, cards: { type: Array, default: () => [] }, ownedCards: { type: Object, default: () => ({}) }, loading: Boolean })
defineEmits(['close', 'quantity'])
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <section class="collection-modal set-collection-modal" role="dialog" aria-modal="true" :aria-label="`Coleção ${set.name}`">
      <button class="modal-close" aria-label="Fechar" @click="$emit('close')">×</button>
      <div class="modal-heading"><div class="modal-logo"><img v-if="set.logo" :src="set.logo" alt="" /><span v-else>✦</span></div><div><span class="eyebrow">{{ set.serie || 'Pokémon TCG Pocket' }}</span><h2>{{ set.name }}</h2><p>{{ Object.values(ownedCards).filter(card => card.setId === set.id).length }} cartas registradas · {{ cards.length || set.cardCount }} no total</p></div></div>
      <div v-if="loading" class="empty-modal">Carregando cartas da expansão…</div>
      <div v-else class="owned-list set-owned-list"><article v-for="card in cards" :key="card.id" class="owned-card set-owned-card" :class="{ unowned: !ownedCards[card.id] }">
        <img v-if="card.image" :src="card.image" :alt="card.name" loading="lazy" @error="$event.target.hidden = true" />
        <div class="owned-card-copy"><strong>{{ card.name }}</strong><span>{{ card.rarity || 'Carta' }}<template v-if="card.localId"> · {{ card.localId }}</template></span></div>
        <div class="quantity-control"><button :aria-label="`Diminuir ${card.name}`" :disabled="!ownedCards[card.id]" @click="$emit('quantity', card.id, (ownedCards[card.id]?.quantity || 0) - 1)">−</button><span>{{ ownedCards[card.id]?.quantity || 0 }}</span><button :aria-label="`Adicionar ${card.name}`" :disabled="(ownedCards[card.id]?.quantity || 0) >= 2" @click="$emit('quantity', card.id, (ownedCards[card.id]?.quantity || 0) + 1)">+</button></div>
      </article></div>
      <footer class="modal-footer"><span>{{ cards.length }} cartas da expansão</span><span>Toque em + para registrar até 2 cópias</span></footer>
    </section>
  </div>
</template>
