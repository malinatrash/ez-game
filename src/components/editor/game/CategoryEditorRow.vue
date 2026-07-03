<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Category } from '../../../types/game'
import { useGameEditorStore } from '../../../stores/gameEditor'
import { confirmDialog } from '../../../composables/useConfirm'
import UiButton from '../../common/UiButton.vue'

const props = defineProps<{ category: Category; gameId: string }>()
const emit = defineEmits<{ moveUp: []; moveDown: []; remove: [] }>()

const store = useGameEditorStore()
const router = useRouter()

function addQuestion() {
  store.addQuestion(props.category.id, 100)
}

async function removeQuestion(questionId: string) {
  if (await confirmDialog('Удалить вопрос?')) store.removeQuestion(questionId)
}

function openQuestion(questionId: string) {
  router.push(`/editor/${props.gameId}/question/${questionId}`)
}
</script>

<template>
  <section class="category">
    <div class="header">
      <input v-model="category.title" class="title" placeholder="Название категории" />
      <div class="controls">
        <UiButton size="sm" variant="ghost" icon-only title="Вверх" @click="emit('moveUp')">↑</UiButton>
        <UiButton size="sm" variant="ghost" icon-only title="Вниз" @click="emit('moveDown')">↓</UiButton>
        <UiButton size="sm" variant="danger" icon-only title="Удалить категорию" @click="emit('remove')">🗑</UiButton>
      </div>
    </div>

    <ul class="questions">
      <li v-for="question in category.questions" :key="question.id" class="question-item">
        <button type="button" class="question" @click="openQuestion(question.id)">{{ question.cost }}</button>
        <button
          type="button"
          class="remove"
          title="Удалить вопрос"
          @click.stop="removeQuestion(question.id)"
        >
          ×
        </button>
      </li>
    </ul>

    <UiButton variant="ghost" class="add-question" @click="addQuestion">+ Вопрос</UiButton>
  </section>
</template>

<style scoped>
.category {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: box-shadow var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}
.category:hover {
  border-color: var(--color-accent-border);
}

.header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.title {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-heading);
  font-size: var(--font-size-md);
  font-weight: 600;
  padding: var(--space-1) 0;
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.title:hover,
.title:focus {
  border-bottom-color: var(--color-accent-border);
  outline: none;
}
.controls {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.questions {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: var(--space-2);
}
.question-item {
  position: relative;
}
.question {
  width: 100%;
  height: 56px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-border);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-standard),
    background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.question:hover {
  background: var(--color-accent);
  color: var(--color-bg);
  box-shadow: var(--shadow-glow);
}
.question:active {
  transform: scale(0.96);
}
.remove {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  pointer-events: auto;
  transition: color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}
.remove:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
  transform: scale(1.1);
}

.add-question {
  align-self: flex-start;
}
</style>
