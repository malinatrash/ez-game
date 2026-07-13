<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Player } from '../../../types/player'
import { useAssetUrl } from '../../../composables/useAssetUrl'
import UiButton from '../../common/UiButton.vue'

const props = defineProps<{ player: Player; active: boolean; rank: number; removable: boolean }>()
const emit = defineEmits<{ remove: [] }>()

const avatarUrl = useAssetUrl(() => props.player.avatarAssetId)

const scoreChange = ref<'up' | 'down' | ''>('')
let clearTimer: number | undefined

watch(
  () => props.player.score,
  (next, prev) => {
    if (prev === undefined || next === prev) return
    scoreChange.value = next > prev ? 'up' : 'down'
    window.clearTimeout(clearTimer)
    clearTimer = window.setTimeout(() => {
      scoreChange.value = ''
    }, 900)
  },
)

const medal = (rank: number) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '')
</script>

<template>
  <div
    class="badge"
    :class="{ active, 'score-up': scoreChange === 'up', 'score-down': scoreChange === 'down' }"
    :style="{ '--player-color': player.color }"
    v-motion
    :initial="{ opacity: 0, x: -12 }"
    :enter="{ opacity: 1, x: 0, transition: { duration: 300 } }"
  >
    <div class="rank" :class="{ medal: !!medal(rank) }">{{ medal(rank) || rank }}</div>

    <div class="avatar-wrap">
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" alt="" />
      <div v-else class="avatar avatar-fallback">{{ player.name.charAt(0).toUpperCase() }}</div>
      <span v-if="active" class="active-dot" title="Выбирает вопрос" />
    </div>

    <div class="info">
      <span class="name">{{ player.name }}</span>
      <span v-if="active" class="turn-label">🎯 Выбирает вопрос</span>
      <span v-else-if="player.streak >= 2" class="streak">🔥 серия {{ player.streak }}</span>
    </div>

    <span class="score-wrap">
      <span class="score">{{ player.score }}</span>
      <span v-if="scoreChange === 'up'" class="flyup">+</span>
      <span v-if="scoreChange === 'down'" class="flydown">−</span>
    </span>

    <UiButton
      class="remove"
      size="sm"
      variant="danger"
      icon-only
      :disabled="!removable"
      :title="removable ? `Удалить игрока ${player.name}` : 'Нельзя удалить единственного игрока'"
      :aria-label="removable ? `Удалить игрока ${player.name}` : 'Нельзя удалить единственного игрока'"
      @click="emit('remove')"
    >
      ✕
    </UiButton>
  </div>
</template>

<style scoped>
.badge {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  transition: box-shadow var(--duration-medium) var(--ease-standard),
    border-color var(--duration-medium) var(--ease-standard), transform var(--duration-medium) var(--ease-standard);
  overflow: hidden;
}
.badge::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--player-color);
}
.badge.active {
  border-color: var(--player-color);
  box-shadow: var(--shadow-glow);
  transform: scale(1.02);
  background: color-mix(in srgb, var(--player-color) 8%, var(--color-surface));
}
.remove {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  opacity: 0.45;
  transform: scale(0.82);
  transform-origin: top right;
  transition: opacity var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);
}
.badge:hover .remove,
.remove:focus-visible {
  opacity: 1;
  transform: scale(0.92);
}
.remove:disabled {
  opacity: 0.2;
}

.rank {
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-muted);
}
.rank.medal {
  font-size: var(--font-size-md);
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--player-color);
  display: block;
}
.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--player-color);
  color: var(--color-bg);
  font-weight: 700;
  font-size: var(--font-size-md);
}
.active-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-success);
  border: 2px solid var(--color-surface);
  animation: pulse-dot 1.4s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-success) 60%, transparent); }
  50% { transform: scale(1.15); box-shadow: 0 0 0 4px transparent; }
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.turn-label {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: 600;
}
.streak {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  animation: flicker 1.2s ease-in-out infinite;
}
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.score-wrap {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}
.score {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: var(--font-size-lg);
}

/* --- очки выросли: яркая, "сочная" вспышка --- */
.badge.score-up {
  animation: badge-win 700ms var(--ease-bounce);
}
.badge.score-up {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 35%, transparent), 0 0 26px -4px var(--color-success);
}
.badge.score-up .score {
  color: var(--color-success);
  animation: score-pop 700ms var(--ease-bounce);
}
@keyframes badge-win {
  0% { transform: scale(1); }
  30% { transform: scale(1.08) rotate(-1deg); }
  55% { transform: scale(0.98) rotate(1deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes score-pop {
  0% { transform: scale(1); }
  35% { transform: scale(1.6); }
  100% { transform: scale(1); }
}
.flyup {
  position: absolute;
  left: 50%;
  top: -2px;
  color: var(--color-success);
  font-weight: 800;
  font-size: var(--font-size-lg);
  transform: translateX(-50%);
  animation: fly-up 900ms var(--ease-standard) forwards;
  pointer-events: none;
}
@keyframes fly-up {
  0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -22px) scale(1.4); }
}

/* --- очки упали: жалкая, стыдная тряска --- */
.badge.score-down {
  animation: badge-lose 600ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
  filter: grayscale(0.35);
}
.badge.score-down .score {
  color: var(--color-danger);
}
@keyframes badge-lose {
  0%, 100% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-5px) rotate(-2deg); }
  30% { transform: translateX(4px) rotate(2deg); }
  45% { transform: translateX(-4px) rotate(-1.5deg); }
  60% { transform: translateX(3px) rotate(1deg); }
  75% { transform: translateX(-2px) rotate(-0.5deg); }
}
.flydown {
  position: absolute;
  left: 50%;
  bottom: -2px;
  color: var(--color-danger);
  font-weight: 800;
  font-size: var(--font-size-lg);
  transform: translateX(-50%);
  animation: fly-down 700ms ease-in forwards;
  pointer-events: none;
}
@keyframes fly-down {
  0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, 10px) scale(0.7); }
}
</style>
