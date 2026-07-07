<script setup lang="ts">
import type { Question } from '../../../types/game'

defineProps<{ question: Question; answered: boolean }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button class="cell" :class="{ answered, bonus: question.settings.isBonus }" :disabled="answered" @click="emit('select')">
    {{ answered ? '' : question.cost }}
  </button>
</template>

<style scoped>
.cell {
  position: relative;
  height: var(--size-board-cell-height);
  min-width: var(--size-board-cell-min-width);
  flex: 1;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-accent-border);
  background:
    linear-gradient(155deg, var(--color-accent-bg) 0%, transparent 65%),
    var(--color-surface-raised);
  color: var(--color-text-heading);
  font-weight: 800;
  font-size: 44px;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  cursor: pointer;
  overflow: hidden;
  animation: idle-breathe 4.5s var(--ease-standard) infinite;
  animation-delay: calc(var(--cell-index, 0) * 0.15s);
  transition: transform var(--duration-fast) var(--ease-bounce),
    box-shadow var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard);
}
.cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.16) 45%, transparent 70%);
  transform: translateX(-120%);
  pointer-events: none;
}
.cell:hover:not(:disabled)::before {
  transform: translateX(120%);
  transition: transform var(--duration-xslow) var(--ease-standard);
}
.cell:hover:not(:disabled) {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-glow), 0 6px 18px -6px rgba(0, 0, 0, 0.45);
  transform: translateY(-2px) scale(1.04);
  animation-play-state: paused;
}
.cell:active:not(:disabled) {
  transform: scale(0.96);
}
.cell.bonus {
  outline: 2px dashed var(--color-warning);
  outline-offset: 2px;
}
.cell.answered {
  background: var(--color-surface);
  color: transparent;
  border-color: var(--color-border);
  box-shadow: none;
  cursor: default;
  opacity: 0.35;
  animation: none;
}
.cell.answered::before {
  content: none;
}

@keyframes idle-breathe {
  0%,
  100% {
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  50% {
    box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 0 0 3px var(--color-accent-bg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cell {
    animation: none;
  }
  .cell::before {
    display: none;
  }
}
</style>
