<script setup lang="ts">
import type { Question } from '../../../types/game'

defineProps<{ question: Question; answered: boolean }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button class="cell" :class="{ answered, bonus: question.settings.isBonus }" :disabled="answered" @click="emit('select')">
    <span class="value">{{ answered ? '' : question.cost }}</span>
  </button>
</template>

<style scoped>
.cell {
  container-type: size;
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-border);
  background:
    radial-gradient(120% 140% at 50% -20%, var(--color-accent-bg) 0%, transparent 55%),
    var(--color-surface-raised);
  color: var(--color-text-heading);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 3px 10px -4px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -2px 6px rgba(0, 0, 0, 0.2);
  transition: transform var(--duration-fast) var(--ease-bounce),
    box-shadow var(--duration-medium) var(--ease-standard),
    border-color var(--duration-medium) var(--ease-standard),
    background var(--duration-medium) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard);
}
.cell .value {
  font-weight: 800;
  letter-spacing: 0.01em;
  font-size: clamp(16px, 30cqmin, 48px);
  line-height: 1;
  color: var(--color-accent);
  text-shadow: 0 0 22px var(--color-accent-bg), 0 2px 0 rgba(0, 0, 0, 0.35);
  transition: transform var(--duration-fast) var(--ease-bounce);
}
.cell:hover:not(:disabled) {
  border-color: var(--color-accent);
  background:
    radial-gradient(120% 140% at 50% -20%, var(--color-accent-bg) 0%, transparent 65%),
    var(--color-surface-raised);
  box-shadow:
    var(--shadow-glow),
    0 6px 16px -6px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  z-index: 2;
}
.cell:hover:not(:disabled) .value {
  transform: scale(1.08);
}
.cell:active:not(:disabled) {
  transform: scale(0.97);
}
.cell.bonus::after {
  content: '★';
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: clamp(9px, 8cqmin, 14px);
  color: var(--color-warning);
  opacity: 0.85;
}
.cell.answered {
  background: var(--color-surface);
  color: transparent;
  border-color: var(--color-border);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: default;
  opacity: 0.3;
}
.cell.answered .value {
  text-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .cell .value {
    transition: none;
  }
}
</style>
