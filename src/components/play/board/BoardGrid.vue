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
          v-for="question in [...category.questions].sort((a, b) => a.cost - b.cost)"
          :key="question.id"
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
  border-radius: var(--radius-md);
  background: var(--color-accent-bg);
  border: 1px solid var(--color-accent-border);
  color: var(--color-text-heading);
  text-transform: uppercase;
  font-size: var(--font-size-md);
  font-weight: 700;
  letter-spacing: 0.02em;
}
.cells {
  display: flex;
  gap: var(--space-3);
  flex: 1;
}
</style>
