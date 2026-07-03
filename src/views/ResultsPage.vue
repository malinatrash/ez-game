<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayersStore } from '../stores/players'
import { useGameEditorStore } from '../stores/gameEditor'
import { useHistoryStore } from '../stores/history'
import { useBackgroundMusicStore } from '../stores/backgroundMusic'
import { useResultsMusicStore } from '../stores/resultsMusic'
import { restorePlaySessionIfNeeded } from '../services/sessionPersistence'
import { analyzeSession } from '../services/resultsAnalytics'
import WinnerSpotlight from '../components/results/WinnerSpotlight.vue'
import ResultsTable from '../components/results/ResultsTable.vue'
import StatsGrid from '../components/results/StatsGrid.vue'
import FunFactsList from '../components/results/FunFactsList.vue'
import UiButton from '../components/common/UiButton.vue'
import WallpaperBackground from '../components/common/WallpaperBackground.vue'

const playersStore = usePlayersStore()
const gameStore = useGameEditorStore()
const historyStore = useHistoryStore()
const backgroundMusic = useBackgroundMusicStore()
const resultsMusic = useResultsMusicStore()
const route = useRoute()
const router = useRouter()

const gameId = route.params.gameId as string

onMounted(async () => {
  if (!gameStore.game || gameStore.game.id !== gameId) {
    await gameStore.loadGame(gameId)
  }
  await restorePlaySessionIfNeeded(gameId)

  backgroundMusic.stop()
  await resultsMusic.play(gameStore.game?.meta.resultsMusicAssetId)
})

onUnmounted(() => {
  resultsMusic.stop()
})

const analysis = computed(() =>
  analyzeSession(playersStore.players, historyStore.entries, gameStore.game ?? null),
)
const winner = computed(() => analysis.value.ranked[0])
const rest = computed(() => analysis.value.ranked.slice(1))

function backToMenu() {
  router.push('/')
}
</script>

<template>
  <div>
    <WallpaperBackground :asset-id="gameStore.game?.meta.wallpaperAssetId" />
    <main class="page">
      <h1 class="title">Игра завершена!</h1>

      <WinnerSpotlight v-if="winner" :player="winner" />

      <section v-if="rest.length" class="section">
        <h2 class="section-title">Остальные участники</h2>
        <ResultsTable :players="rest" />
      </section>

      <section v-if="analysis.stats.length" class="section">
        <h2 class="section-title">Статистика игры</h2>
        <StatsGrid :stats="analysis.stats" />
      </section>

      <section v-if="analysis.funFacts.length" class="section">
        <h2 class="section-title">🎉 Интересные факты</h2>
        <FunFactsList :facts="analysis.funFacts" />
      </section>

      <UiButton variant="primary" @click="backToMenu">В главное меню</UiButton>
    </main>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
  min-height: calc(100vh - var(--size-breadcrumbs-height));
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
}
.title {
  margin: 0;
  font-size: var(--font-size-xxl);
  color: var(--color-text-heading);
  text-align: center;
}
.section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 640px;
}
.section-title {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
  align-self: flex-start;
}
</style>
