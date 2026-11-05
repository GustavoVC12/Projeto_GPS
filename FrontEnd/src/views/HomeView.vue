<script setup>
import { useCollectionStore } from '../stores/collection'
import { getSets } from '../services/tcgdex'
import { onMounted, ref } from 'vue'

const collection = useCollectionStore()
const setCount = ref(0)

onMounted(async () => {
  try {
    setCount.value = (await getSets()).length
  } catch {
    setCount.value = 0
  }
})
</script>

<template>
  <div class="relative h-[calc(100dvh-73px)] w-full overflow-hidden bg-[#1c1c1c] text-white">
    <!-- Zapdos: topo esquerdo -->
    <img
      src="../assets/pok4Home.png"
      alt="Zapdos"
      class="pointer-events-none absolute left-[6%] top-[12%] z-0 h-[25vh] w-auto select-none object-contain"
    />

    <!-- Talonflame: topo direito -->
    <img
      src="../assets/pok6Home.webp"
      alt="Talonflame"
      class="pointer-events-none absolute right-[2%] top-[1%] z-0 h-[25vh] w-auto select-none object-contain"
    />

    <!-- Charizard: canto inferior esquerdo (inteiro na tela, ao lado do Bloco 3) -->
    <img
      src="../assets/pok2Home.png"
      alt="Charizard"
      class="pointer-events-none absolute bottom-[5%] left-[4%] z-0 h-[30vh] w-auto select-none object-contain"
    />

    <!-- Snorlax: canto inferior direito (apoiado na base da tela) -->
    <img
      src="../assets/pok3Home.png"
      alt="Snorlax"
      class="pointer-events-none absolute bottom-0 right-[5%] z-0 h-[17vh] w-auto select-none object-contain"
    />

    <!-- Conteúdo central: distribuído do topo até a base como no rascunho -->
    <main
      class="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-between px-[6vw] pb-[9vh] pt-[7vh] text-center"
    >
      <!-- Título no topo -->
      <h1 class="text-[clamp(2.2rem,6.5vh,3.75rem)] font-medium leading-none tracking-wide">
        PokApp
      </h1>

      <!-- Bloco 1 (mais estreito que o Bloco 2, deixando espaço para a Altaria na direita) -->
      <p class="max-w-2xl text-[clamp(0.85rem,2.1vh,1.15rem)] leading-relaxed text-white/90">
        Organize sua coleção de Pokémon TCG Pocket e acompanhe cada expansão da sua jornada.
        Cada carta conta uma história, e o PokApp ajuda você a não perder nenhuma delas.
      </p>

      <!-- Bloco 2 (mais largo) + Altaria ancorada no topo direito dele -->
      <div class="relative w-full max-w-4xl pt-[2vh]">
        <img
          src="../assets/pok5Home.webp"
          alt="Altaria"
          class="pointer-events-none absolute -top-[8.5vh] right-[10%] h-[9.5vh] w-auto select-none object-contain"
        />
        <p class="text-[clamp(0.85rem,2.1vh,1.15rem)] leading-relaxed text-white/90">
          Jogadores Free-to-Play têm recursos limitados, como o número de pacotes gratuitos por dia.
          Explore o catálogo conectado à TCGdex, descubra novas cartas e marque as que você já tem.
          Tudo fica salvo em suas coleções para você consultar quando quiser.
        </p>
      </div>

      <!-- Geodude centralizado entre o Bloco 2 e o Bloco 3 -->
      <div class="relative flex w-full items-center justify-center">
        <img
          src="../assets/pok1Home.png"
          alt="Geodude"
          class="pointer-events-none h-[11vh] w-auto select-none object-contain"
        />
      </div>

      <!-- Bloco 3 (mais estreito para ficar entre o Charizard e o Snorlax, com mais linhas) -->
      <p class="max-w-xl text-[clamp(0.85rem,2.1vh,1.15rem)] leading-relaxed text-white/90">
        Com a busca e a filtragem avançada você encontra qualquer carta rapidamente. Nosso motor de
        cálculo probabilístico, baseado nas taxas oficiais de drop, recomenda o melhor pacote para
        abrir e aumenta suas chances de conseguir cartas inéditas.
      </p>
    </main>
  </div>
</template>