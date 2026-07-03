<script setup lang="ts">
import type { Player } from '../../types/player'
import PlayerAvatar from './PlayerAvatar.vue'

defineProps<{ player: Player }>()

const confettiColors = ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#fb923c', '#22d3ee']
const confetti = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53.7) % 100}%`,
  delay: `${(i % 6) * 0.35}s`,
  duration: `${2.6 + (i % 5) * 0.4}s`,
  color: confettiColors[i % confettiColors.length],
  rotate: `${(i * 47) % 360}deg`,
}))
</script>

<template>
  <div
    class="spotlight"
    :style="{ '--player-color': player.color }"
    v-motion
    :initial="{ opacity: 0, y: -24, scale: 0.9 }"
    :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 500, type: 'spring', stiffness: 120 } }"
  >
    <div class="confetti-layer" aria-hidden="true">
      <span
        v-for="(c, i) in confetti"
        :key="i"
        class="confetti-piece"
        :style="{ left: c.left, background: c.color, animationDelay: c.delay, animationDuration: c.duration, '--rot': c.rotate }"
      />
    </div>

    <div class="crown">👑</div>
    <div class="avatar-ring">
      <PlayerAvatar :player="player" :size="108" />
    </div>
    <h1 class="name">{{ player.name }}</h1>
    <p class="subtitle">Победитель игры</p>
    <div class="score">{{ player.score }} <span class="score-label">очков</span></div>
  </div>
</template>

<style scoped>
.spotlight {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-6) var(--space-6) var(--space-5);
  border-radius: var(--radius-lg);
  background: radial-gradient(
    circle at 50% 0%,
    color-mix(in srgb, var(--player-color) 22%, var(--color-surface)) 0%,
    var(--color-surface) 70%
  );
  border: 1px solid color-mix(in srgb, var(--player-color) 45%, var(--color-border));
  box-shadow: var(--shadow-md);
  overflow: hidden;
  min-width: 320px;
}

.confetti-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.confetti-piece {
  position: absolute;
  top: -10%;
  width: 8px;
  height: 14px;
  opacity: 0.9;
  border-radius: 2px;
  animation-name: confetti-fall;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}
@keyframes confetti-fall {
  0% {
    transform: translateY(-10%) rotate(0deg);
    opacity: 0.95;
  }
  100% {
    transform: translateY(340%) rotate(var(--rot));
    opacity: 0;
  }
}

.crown {
  font-size: var(--font-size-xxl);
  animation: crown-bob 2.2s ease-in-out infinite;
}
@keyframes crown-bob {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-6px) rotate(4deg); }
}

.avatar-ring {
  position: relative;
  z-index: 1;
  border-radius: var(--radius-full);
  padding: 4px;
  background: conic-gradient(var(--player-color), color-mix(in srgb, var(--player-color) 30%, transparent), var(--player-color));
  animation: ring-spin 4s linear infinite;
  box-shadow: var(--shadow-glow);
}
@keyframes ring-spin {
  to { transform: rotate(360deg); }
}
.name {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-heading);
  z-index: 1;
}
.subtitle {
  margin: 0;
  color: var(--color-text-muted);
  z-index: 1;
}
.score {
  margin-top: var(--space-2);
  font-size: var(--font-size-xxl);
  font-weight: 800;
  color: var(--player-color);
  z-index: 1;
  font-variant-numeric: tabular-nums;
}
.score-label {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text-muted);
}
</style>
