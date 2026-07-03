<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGameEditorStore } from '../stores/gameEditor'
import { useAutosave } from '../composables/useAutosave'
import QuestionForm from '../components/editor/question/QuestionForm.vue'
import UiButton from '../components/common/UiButton.vue'

const route = useRoute()
const store = useGameEditorStore()
useAutosave()

const gameId = route.params.gameId as string
const questionId = computed(() => route.params.questionId as string)

onMounted(async () => {
  if (!store.game || store.game.id !== gameId) {
    await store.loadGame(gameId)
  }
})

const question = computed(() => store.findQuestion(questionId.value))

async function saveNow() {
  await store.persist()
}
</script>

<template>
  <main class="page">
    <div class="top">
      <h1>Редактор вопроса<span v-if="question" class="cost-badge">{{ question.cost }}</span></h1>
      <div class="save-area">
        <span class="status" :class="{ dirty: store.dirty }">
          <span class="dot" />
          {{ store.dirty ? 'Есть несохранённые изменения' : 'Сохранено' }}
        </span>
        <UiButton variant="primary" @click="saveNow">Сохранить</UiButton>
      </div>
    </div>
    <QuestionForm v-if="question" :question="question" />
    <p v-else>Вопрос не найден.</p>
  </main>
</template>

<style scoped>
.page {
  padding: var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  align-items: stretch;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: calc(100vh - var(--size-breadcrumbs-height));
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
}
.top h1 {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-lg);
}
.cost-badge {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-accent);
  background: var(--color-accent-bg);
  border: 1px solid var(--color-accent-border);
  border-radius: var(--radius-full);
  padding: 2px var(--space-3);
}
.save-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  transition: background var(--duration-fast) var(--ease-standard);
}
.status.dirty .dot {
  background: var(--color-warning);
}
</style>
