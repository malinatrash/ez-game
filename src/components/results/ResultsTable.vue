<script setup lang="ts">
import type { Player } from '../../types/player'
import PlayerAvatar from './PlayerAvatar.vue'

defineProps<{ players: Player[] }>()

function medal(rank: number) {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''
}
</script>

<template>
  <ol class="leaderboard">
    <li
      v-for="(player, index) in players"
      :key="player.id"
      class="row"
      :style="{ '--player-color': player.color }"
      v-motion
      :initial="{ opacity: 0, x: -20 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 380, delay: 120 + index * 90 } }"
    >
      <span class="rank" :class="{ medal: !!medal(index + 1) }">{{ medal(index + 1) || index + 1 }}</span>
      <PlayerAvatar :player="player" />
      <span class="name" :style="{ color: player.color }">{{ player.name }}</span>
      <span v-if="player.streak >= 2" class="streak">🔥{{ player.streak }}</span>
      <span class="score">{{ player.score }}</span>
    </li>
  </ol>
</template>

<style scoped>
.leaderboard {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: 520px;
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: transform var(--duration-fast) var(--ease-standard);
}
.row:hover {
  transform: translateX(4px);
  border-color: color-mix(in srgb, var(--player-color) 50%, var(--color-border));
}
.rank {
  width: 28px;
  flex-shrink: 0;
  text-align: center;
  font-weight: 700;
  color: var(--color-text-muted);
}
.rank.medal {
  font-size: var(--font-size-lg);
}
.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}
.streak {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.score {
  font-weight: 700;
  font-size: var(--font-size-lg);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
</style>
