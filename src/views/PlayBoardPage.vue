<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameEditorStore } from '../stores/gameEditor'
import { useSessionStore } from '../stores/session'
import { restorePlaySessionIfNeeded } from '../services/sessionPersistence'
import PlayerSidebar from '../components/play/sidebar/PlayerSidebar.vue'
import BoardGrid from '../components/play/board/BoardGrid.vue'
import EmptyState from '../components/common/EmptyState.vue'
import WallpaperBackground from '../components/common/WallpaperBackground.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameEditorStore()
const sessionStore = useSessionStore()

const gameId = route.params.gameId as string
const loading = ref(true)

onMounted(async () => {
  if (!gameStore.game || gameStore.game.id !== gameId) {
    await gameStore.loadGame(gameId)
  }
  const hasSession = await restorePlaySessionIfNeeded(gameId)
  if (!hasSession) {
    router.replace(`/play/${gameId}/setup`)
    return
  }
  loading.value = false
})

function selectQuestion(questionId: string) {
  sessionStore.openQuestion(questionId)
  router.push(`/play/${gameId}/question/${questionId}`)
}

function finishGame() {
  sessionStore.endGame()
  router.push(`/play/${gameId}/results`)
}

const allAnswered = computed(() => {
  const total = gameStore.game?.categories.reduce((sum, c) => sum + c.questions.length, 0) ?? 0
  return total > 0 && sessionStore.answeredQuestionIds.length >= total
})
</script>

<template>
  <div>
    <WallpaperBackground :asset-id="gameStore.game?.meta.wallpaperAssetId" />
    <div v-if="gameStore.game" class="layout">
      <PlayerSidebar />
      <main class="board-area">
        <div class="top">
          <h1>{{ gameStore.game.meta.title }}</h1>
          <button class="primary" @click="finishGame">Завершить игру</button>
        </div>
        <p v-if="allAnswered" class="hint">Все вопросы отвечены — можно завершить игру.</p>
        <BoardGrid
          :categories="gameStore.game.categories"
          :answered-question-ids="sessionStore.answeredQuestionIds"
          @select="selectQuestion"
        />
      </main>
    </div>
    <EmptyState v-else-if="!loading" message="Игра не найдена" />
    <EmptyState v-else message="Загрузка..." />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: calc(100vh - var(--size-breadcrumbs-height));
}
.board-area {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hint {
  color: var(--color-warning);
}
button {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  cursor: pointer;
}
.primary {
  background: var(--color-accent);
  color: var(--color-bg);
  border: none;
  font-weight: 600;
}
</style>
