<script setup>
defineProps({ set: { type: Object, required: true } })
defineEmits(['open'])
</script>
<template>
  <button class="set-card" @click="$emit('open', set)">
    <div class="set-art"><img v-if="set.logo" :src="set.logo" :alt="''" /><img v-else-if="set.symbol" :src="set.symbol" :alt="''" /><div v-else class="set-placeholder">✦</div></div>
    <div class="set-info"><div class="set-label"><span>{{ set.serie }}</span><span v-if="set.releaseDate">{{ set.releaseDate.slice(0, 4) }}</span></div><h3>{{ set.name }}</h3><div class="set-progress"><span></span></div><p>{{ set.collected }} de {{ set.cardCount || '—' }} cartas <strong>{{ set.percent }}%</strong></p></div>
    <span class="set-arrow">↗</span>
  </button>
</template>
