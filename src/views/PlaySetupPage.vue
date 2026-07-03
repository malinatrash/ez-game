<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameEditorStore } from '../stores/gameEditor'
import { usePlayersStore } from '../stores/players'
import { useSessionStore } from '../stores/session'
import { useHistoryStore } from '../stores/history'
import PlayerForm from '../components/play/setup/PlayerForm.vue'
import PlayerRow from '../components/play/setup/PlayerRow.vue'
import WallpaperBackground from '../components/common/WallpaperBackground.vue'
import UiButton from '../components/common/UiButton.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameEditorStore()
const playersStore = usePlayersStore()
const sessionStore = useSessionStore()
const historyStore = useHistoryStore()

const gameId = route.params.gameId as string

onMounted(async () => {
  if (!gameStore.game || gameStore.game.id !== gameId) {
    await gameStore.loadGame(gameId)
  }
  playersStore.ensureForGame(gameId)
})

function startGame() {
  if (playersStore.players.length === 0) return
  historyStore.reset()
  sessionStore.start(gameId, playersStore.players[0].id)
  router.push(`/play/${gameId}/board`)
}
</script>

<template>
  <div>
    <WallpaperBackground :asset-id="gameStore.game?.meta.wallpaperAssetId" />
    <main class="page">
      <h1 class="title">Игроки{{ gameStore.game ? `: ${gameStore.game.meta.title}` : '' }}</h1>
      <PlayerForm @add="playersStore.addPlayer" />

      <div v-if="playersStore.players.length" class="players">
        <PlayerRow
          v-for="player in playersStore.players"
          :key="player.id"
          :player="player"
          v-motion
          :initial="{ opacity: 0, y: 12, scale: 0.95 }"
          :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 280 } }"
          @remove="playersStore.removePlayer(player.id)"
          @move-up="playersStore.movePlayer(player.id, -1)"
          @move-down="playersStore.movePlayer(player.id, 1)"
        />
      </div>
      <p v-else class="hint">Добавьте хотя бы одного игрока, чтобы начать игру</p>

      <UiButton variant="primary" :disabled="playersStore.players.length === 0" @click="startGame">
        ▶ Начать игру
      </UiButton>
    </main>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  align-items: flex-start;
  text-align: left;
  min-height: calc(100vh - var(--size-breadcrumbs-height));
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
}
.title {
  color: var(--color-text-heading);
}
.players {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.hint {
  color: var(--color-text-muted);
}
</style>
