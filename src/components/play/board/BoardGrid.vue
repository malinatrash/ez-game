<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '../../../types/game'
import BoardCell from './BoardCell.vue'

const props = defineProps<{ categories: Category[]; answeredQuestionIds: string[] }>()
const emit = defineEmits<{ select: [questionId: string] }>()

const sortedCategories = computed(() =>
  props.categories.map((category) => ({
    ...category,
    questions: [...category.questions].sort((a, b) => a.cost - b.cost),
  })),
)

const maxQuestions = computed(() =>
  sortedCategories.value.reduce((max, c) => Math.max(max, c.questions.length), 0),
)

const cells = computed(() =>
  sortedCategories.value.flatMap((category, catIndex) =>
    category.questions.map((question, qIndex) => ({ question, catIndex, qIndex })),
  ),
)
</script>

<template>
  <div
    class="board"
    :style="{
      gridTemplateColumns: `repeat(${sortedCategories.length}, minmax(0, 1fr))`,
      gridTemplateRows: `minmax(56px, 0.8fr) repeat(${maxQuestions}, minmax(0, 1fr))`,
    }"
  >
    <h3
      v-for="(category, catIndex) in sortedCategories"
      :key="category.id"
      class="label"
      :style="{ gridColumn: catIndex + 1, gridRow: 1 }"
    >
      <span>{{ category.title }}</span>
    </h3>
    <BoardCell
      v-for="cell in cells"
      :key="cell.question.id"
      :style="{ gridColumn: cell.catIndex + 1, gridRow: cell.qIndex + 2, '--cell-index': cell.qIndex }"
      :question="cell.question"
      :answered="answeredQuestionIds.includes(cell.question.id)"
      @select="emit('select', cell.question.id)"
    />
  </div>
</template>

<style scoped>
.board {
  display: grid;
  gap: var(--space-3);
  width: 100%;
  height: 100%;
  min-height: 0;
}
.label {
  container-type: size;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: linear-gradient(165deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 78%, black) 100%);
  border: 1px solid color-mix(in srgb, var(--color-accent) 60%, black);
  box-shadow: 0 3px 10px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  color: var(--color-bg);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
.label span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 800;
  font-size: clamp(13px, 24cqh, 22px);
  line-height: 1.2;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);
}
</style>
