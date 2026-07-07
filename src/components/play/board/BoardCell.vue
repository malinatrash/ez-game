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
  height: var(--size-board-cell-height);
  min-width: var(--size-board-cell-min-width);
  flex: 1;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  font-weight: 700;
  font-size: var(--font-size-xxl);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-bounce),
    box-shadow var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard);
}
.cell:hover:not(:disabled) {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px) scale(1.04);
}
.cell:active:not(:disabled) {
  transform: scale(0.96);
}
.cell.bonus {
  outline: 2px dashed var(--color-warning);
}
.cell.answered {
  background: transparent;
  color: transparent;
  border-color: var(--color-border);
  cursor: default;
  opacity: 0.35;
}
</style>
