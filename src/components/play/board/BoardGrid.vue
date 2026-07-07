<script setup lang="ts">
import type { Category } from '../../../types/game'
import BoardCell from './BoardCell.vue'

defineProps<{ categories: Category[]; answeredQuestionIds: string[] }>()
const emit = defineEmits<{ select: [questionId: string] }>()
</script>

<template>
  <div class="board">
    <div v-for="category in categories" :key="category.id" class="row">
      <h3 class="label">{{ category.title }}</h3>
      <div class="cells">
        <BoardCell
          v-for="(question, index) in [...category.questions].sort((a, b) => a.cost - b.cost)"
          :key="question.id"
          :style="{ '--cell-index': index }"
          :question="question"
          :answered="answeredQuestionIds.includes(question.id)"
          @select="emit('select', question.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}
.row {
  display: flex;
  align-items: stretch;
  gap: var(--space-3);
}
.label {
  flex-shrink: 0;
  width: var(--size-board-label-width);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(155deg, var(--color-accent-bg) 0%, transparent 65%),
    var(--color-surface-raised);
  border: 1px solid var(--color-accent-border);
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: var(--color-text-heading);
  text-transform: uppercase;
  font-size: var(--font-size-lg);
  font-weight: 800;
  letter-spacing: 0.03em;
}
.cells {
  display: flex;
  gap: var(--space-3);
  flex: 1;
}
</style>
