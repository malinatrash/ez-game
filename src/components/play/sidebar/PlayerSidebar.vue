<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayersStore } from '../../../stores/players'
import { useSessionStore } from '../../../stores/session'
import { useHistoryStore } from '../../../stores/history'
import { useBackgroundMusicStore } from '../../../stores/backgroundMusic'
import { confirmDialog } from '../../../composables/useConfirm'
import type { Player } from '../../../types/player'
import UiButton from '../../common/UiButton.vue'
import PlayerBadge from './PlayerBadge.vue'

const players = usePlayersStore()
const session = useSessionStore()
const history = useHistoryStore()
const music = useBackgroundMusicStore()
const showLog = ref(false)

const ranks = computed(() => {
  const map = new Map<string, number>()
  const sorted = [...players.players].sort((a, b) => b.score - a.score)
  sorted.forEach((p, i) => map.set(p.id, i + 1))
  return map
})

function playerName(id: string) {
  return players.players.find((p) => p.id === id)?.name ?? '?'
}

function playerColor(id: string) {
  return players.players.find((p) => p.id === id)?.color ?? 'var(--color-border)'
}

async function removePlayer(player: Player) {
  if (players.players.length <= 1) return
  const confirmed = await confirmDialog(
    `Удалить игрока «${player.name}» из текущей игры? Его очки и записи в журнале будут удалены.`,
  )
  if (!confirmed) return

  const playerOrder = players.players.map((item) => item.id)
  session.removePlayer(player.id, playerOrder)
  history.removePlayerEntries(player.id)
  players.removePlayer(player.id)
}

const reasonLabel: Record<string, string> = {
  correct: 'верно',
  incorrect: 'неверно',
  manual: 'вручную',
}
</script>

<template>
  <aside class="sidebar">
    <header class="header">
      <h2 class="title">Игроки</h2>
      <span class="count">{{ players.players.length }}</span>
    </header>

    <div class="players">
      <PlayerBadge
        v-for="player in players.players"
        :key="player.id"
        :player="player"
        :active="player.id === session.turn.activePlayerId"
        :rank="ranks.get(player.id) ?? 0"
        :removable="players.players.length > 1"
        @remove="removePlayer(player)"
      />
    </div>

    <div v-if="music.hasTrack" class="music">
      <UiButton class="music-toggle" variant="ghost" @click="music.toggle">
        {{ music.playing ? '🔊 Музыка играет' : '🔇 Музыка выключена' }}
      </UiButton>
      <input
        class="volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="music.volume"
        @input="music.setVolume(($event.target as HTMLInputElement).valueAsNumber)"
      />
    </div>

    <div class="history-controls">
      <UiButton size="sm" :disabled="history.entries.length === 0" @click="history.undo">↩ Отменить</UiButton>
      <UiButton size="sm" :disabled="history.redoStack.length === 0" @click="history.redo">↪ Повторить</UiButton>
      <UiButton size="sm" variant="ghost" @click="showLog = !showLog">
        📜 Журнал{{ history.entries.length ? ` (${history.entries.length})` : '' }}
      </UiButton>
    </div>

    <ul v-if="showLog" class="log">
      <li v-if="history.entries.length === 0" class="log-empty">Пока нет событий</li>
      <li v-for="entry in [...history.entries].reverse()" :key="entry.id" class="log-entry">
        <span class="log-dot" :style="{ background: playerColor(entry.playerId) }" />
        <span class="log-name">{{ playerName(entry.playerId) }}</span>
        <span class="log-delta" :class="entry.delta >= 0 ? 'pos' : 'neg'">
          {{ entry.delta > 0 ? '+' : '' }}{{ entry.delta }}
        </span>
        <span class="log-reason">{{ reasonLabel[entry.reason] ?? entry.reason }}</span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border-right: 1px solid var(--color-border);
  min-width: 260px;
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  z-index: 1;
  overflow-y: auto;
}
.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-1);
  border-bottom: 1px solid var(--color-border);
}
.title {
  font-size: var(--font-size-md);
  color: var(--color-text-heading);
  margin: 0;
}
.count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.players {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.music {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
}
.music-toggle {
  justify-content: flex-start;
  width: 100%;
}
.volume {
  width: 100%;
  accent-color: var(--color-accent);
}
.history-controls {
  display: flex;
  gap: var(--space-1);
  margin-top: var(--space-3);
  flex-wrap: wrap;
}
.log {
  list-style: none;
  padding: 0;
  margin: var(--space-2) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  max-height: 220px;
  overflow-y: auto;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-2);
}
.log-empty {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-2) 0;
}
.log-entry {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
}
.log-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}
.log-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}
.log-delta {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.log-delta.pos {
  color: var(--color-success);
}
.log-delta.neg {
  color: var(--color-danger);
}
.log-reason {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
