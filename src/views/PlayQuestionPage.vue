<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameEditorStore } from '../stores/gameEditor'
import { usePlayersStore } from '../stores/players'
import { useSessionStore } from '../stores/session'
import { useBackgroundMusicStore } from '../stores/backgroundMusic'
import { restorePlaySessionIfNeeded } from '../services/sessionPersistence'
import { hasPlayableMedia } from '../services/canvasElements'
import PlayerSidebar from '../components/play/sidebar/PlayerSidebar.vue'
import QuestionView from '../components/play/question/QuestionView.vue'
import ScoreJudgeControls from '../components/play/question/ScoreJudgeControls.vue'
import EmptyState from '../components/common/EmptyState.vue'
import WallpaperBackground from '../components/common/WallpaperBackground.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameEditorStore()
const playersStore = usePlayersStore()
const sessionStore = useSessionStore()
const musicStore = useBackgroundMusicStore()

const gameId = route.params.gameId as string
const questionId = computed(() => route.params.questionId as string)
const revealed = ref(false)
const side = ref<'content' | 'answer'>('content')
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

const question = computed(() => gameStore.findQuestion(questionId.value))

// Видео/аудио в вопросе легко теряется под фоновой музыкой — приглушаем её на время вопроса
// и возвращаем при выходе на доску.
watch(
  question,
  (q) => {
    if (q && (hasPlayableMedia(q.content) || hasPlayableMedia(q.answer))) {
      musicStore.pauseForMedia()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  musicStore.resumeFromMedia()
})

function openAnswer() {
  revealed.value = true
  side.value = 'answer'
}

function handleJudged(winnerId: string | null) {
  const order = playersStore.players.map((p) => p.id)
  sessionStore.resolveQuestion(questionId.value, winnerId, order)
  router.push(`/play/${gameId}/board`)
}
</script>

<template>
  <div>
    <WallpaperBackground :asset-id="gameStore.game?.meta.wallpaperAssetId" />
    <div v-if="question" class="layout">
      <PlayerSidebar />
      <main class="question-area">
        <QuestionView :question="question" :side="side" />
        <div class="controls">
          <button v-if="side === 'content'" class="primary" @click="openAnswer">
            {{ revealed ? 'К ответу' : 'Открыть ответ' }}
          </button>
          <template v-else>
            <button class="back" @click="side = 'content'">← Вернуться к вопросу</button>
            <ScoreJudgeControls :players="playersStore.players" :question="question" @judged="handleJudged" />
          </template>
        </div>
      </main>
    </div>
    <EmptyState v-else-if="!loading" message="Вопрос не найден" />
    <EmptyState v-else message="Загрузка..." />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: calc(100vh - var(--size-breadcrumbs-height));
}
.question-area {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
  flex: 1;
  min-height: 0;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
}
.controls {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.primary {
  height: var(--size-button-height);
  padding: 0 var(--space-5);
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-accent);
  color: var(--color-bg);
  font-weight: 600;
  cursor: pointer;
}
.back {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  cursor: pointer;
}
</style>
