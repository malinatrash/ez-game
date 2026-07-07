<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Category, Question } from '../../../types/game'
import { useGameEditorStore } from '../../../stores/gameEditor'
import { confirmDialog } from '../../../composables/useConfirm'
import UiButton from '../../common/UiButton.vue'

const props = defineProps<{ category: Category; gameId: string }>()
const emit = defineEmits<{ moveUp: []; moveDown: []; remove: [] }>()

const store = useGameEditorStore()
const router = useRouter()

// Строгая сетка ставок 100..1000 — сразу видно, каких вопросов в категории ещё не хватает.
const GRID_COSTS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

type Slot = { cost: number; question: Question | undefined }

const slots = computed<Slot[]>(() =>
  GRID_COSTS.map((cost) => ({ cost, question: props.category.questions.find((q) => q.cost === cost) })),
)

// Вопросы с нестандартной ставкой (легаси-данные/ручной ввод вне сетки 100-1000) не должны молча
// теряться из вида — показываем их отдельным рядом под основной сеткой.
const extraQuestions = computed(() =>
  [...props.category.questions].filter((q) => !GRID_COSTS.includes(q.cost)).sort((a, b) => a.cost - b.cost),
)

function addQuestion(cost: number) {
  store.addQuestion(props.category.id, cost)
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
      <li v-for="slot in slots" :key="slot.cost" class="question-item">
        <button
          v-if="slot.question"
          type="button"
          class="question"
          @click="openQuestion(slot.question.id)"
        >
          {{ slot.question.cost }}
          <span v-if="slot.question.settings.catInTheBag" class="cat-badge" title="Кот в мешке">🐱</span>
        </button>
        <button
          v-else
          type="button"
          class="question hole"
          :title="`Добавить вопрос за ${slot.cost}`"
          @click="addQuestion(slot.cost)"
        >
          <span class="hole-cost">{{ slot.cost }}</span>
          <span class="hole-plus">+</span>
        </button>
        <button
          v-if="slot.question"
          type="button"
          class="remove"
          title="Удалить вопрос"
          @click.stop="removeQuestion(slot.question.id)"
        >
          ×
        </button>
      </li>
    </ul>

    <div v-if="extraQuestions.length" class="extra">
      <span class="extra-label">Вне сетки:</span>
      <ul class="extra-list">
        <li v-for="question in extraQuestions" :key="question.id" class="question-item">
          <button type="button" class="question extra-question" @click="openQuestion(question.id)">
            {{ question.cost }}
            <span v-if="question.settings.catInTheBag" class="cat-badge" title="Кот в мешке">🐱</span>
          </button>
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
    </div>
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

.questions,
.extra-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}
.question-item {
  position: relative;
}
.question {
  position: relative;
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

.hole {
  background: transparent;
  border: 1.5px dashed var(--color-border);
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  opacity: 0.55;
}
.hole-cost {
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.hole-plus {
  font-size: var(--font-size-lg);
  line-height: 1;
  font-weight: 700;
}
.hole:hover {
  opacity: 1;
  border-color: var(--color-accent-border);
  border-style: solid;
  color: var(--color-accent);
  background: var(--color-accent-bg);
  box-shadow: none;
}

.cat-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  font-size: var(--font-size-md);
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
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

.extra {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px dashed var(--color-border);
}
.extra-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 600;
}
.extra-question {
  border-color: var(--color-warning);
}
</style>
