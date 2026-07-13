<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameEditorStore } from '../stores/gameEditor'
import { usePlayersStore } from '../stores/players'
import { useSessionStore } from '../stores/session'
import { restorePlaySessionIfNeeded } from '../services/sessionPersistence'
import PlayerSidebar from '../components/play/sidebar/PlayerSidebar.vue'
import BoardGrid from '../components/play/board/BoardGrid.vue'
import CatInBagSpinner from '../components/play/board/CatInBagSpinner.vue'
import EmptyState from '../components/common/EmptyState.vue'
import WallpaperBackground from '../components/common/WallpaperBackground.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameEditorStore()
const playersStore = usePlayersStore()
const sessionStore = useSessionStore()

const gameId = route.params.gameId as string
const loading = ref(true)
const pendingQuestionId = ref<string | null>(null)

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

function openQuestion(questionId: string) {
  sessionStore.openQuestion(questionId)
  router.push(`/play/${gameId}/question/${questionId}`)
}

function selectQuestion(questionId: string) {
  const question = gameStore.findQuestion(questionId)
  if (question?.settings.catInTheBag && playersStore.players.length > 0) {
    pendingQuestionId.value = questionId
    return
  }
  openQuestion(questionId)
}

function onPlayerPicked(playerId: string) {
  const questionId = pendingQuestionId.value
  pendingQuestionId.value = null
  if (!questionId) return
  sessionStore.setActivePlayer(playerId)
  openQuestion(questionId)
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
        <div class="board-wrap">
          <BoardGrid
            :categories="gameStore.game.categories"
            :answered-question-ids="sessionStore.answeredQuestionIds"
            @select="selectQuestion"
          />
        </div>
      </main>
    </div>
    <EmptyState v-else-if="!loading" message="Игра не найдена" />
    <EmptyState v-else message="Загрузка..." />
    <CatInBagSpinner v-if="pendingQuestionId" :players="playersStore.players" @picked="onPlayerPicked" />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: calc(100vh - var(--size-breadcrumbs-height));
  overflow: hidden;
}
.board-area {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
  min-height: 0;
  min-width: 0;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.hint {
  color: var(--color-warning);
  flex-shrink: 0;
}
.board-wrap {
  flex: 1;
  min-height: 0;
  min-width: 0;
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
