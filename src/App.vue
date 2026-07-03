<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useBackgroundMusicStore } from './stores/backgroundMusic'
import { useSessionStore } from './stores/session'
import { usePlayersStore } from './stores/players'
import { useHistoryStore } from './stores/history'
import { savePlaySession } from './services/sessionPersistence'
import Breadcrumbs from './components/common/Breadcrumbs.vue'
import ConfirmDialog from './components/common/ConfirmDialog.vue'

const themeStore = useThemeStore()
const musicStore = useBackgroundMusicStore()
const sessionStore = useSessionStore()
const playersStore = usePlayersStore()
const historyStore = useHistoryStore()
const route = useRoute()

onMounted(() => {
  themeStore.load()
  musicStore.loadVolume()
})

// Persists players/score/answered-questions to IndexedDB on every change so a page
// reload during a match doesn't wipe the in-memory Pinia state (it used to).
function persistActiveSession() {
  if (sessionStore.gameId) savePlaySession(sessionStore.gameId)
}
sessionStore.$subscribe(persistActiveSession)
playersStore.$subscribe(persistActiveSession)
historyStore.$subscribe(persistActiveSession)

watch(
  () => route.path,
  (path) => {
    const match = path.match(/^\/play\/([^/]+)/)
    musicStore.syncForGame(match ? match[1] : null)
  },
  { immediate: true },
)
</script>

<template>
  <Breadcrumbs />
  <ConfirmDialog />
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity var(--duration-medium) var(--ease-standard),
    transform var(--duration-medium) var(--ease-standard);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.99);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}
</style>
