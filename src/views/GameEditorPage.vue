<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameEditorStore } from '../stores/gameEditor'
import { useGameLibraryStore } from '../stores/gameLibrary'
import { useAutosave } from '../composables/useAutosave'
import GameMetaForm from '../components/editor/game/GameMetaForm.vue'
import CategoryList from '../components/editor/game/CategoryList.vue'
import EmptyState from '../components/common/EmptyState.vue'
import UiButton from '../components/common/UiButton.vue'

const route = useRoute()
const router = useRouter()
const store = useGameEditorStore()
const library = useGameLibraryStore()
useAutosave()

const gameId = route.params.gameId as string
const loading = ref(true)
const exporting = ref(false)

onMounted(async () => {
  if (!store.game || store.game.id !== gameId) {
    await store.loadGame(gameId)
  }
  loading.value = false
})

function addCategory() {
  store.addCategory('Новая категория')
}

async function startPlaying() {
  await store.persist()
  router.push(`/play/${gameId}/setup`)
}

async function saveNow() {
  await store.persist()
}

async function exportSog() {
  exporting.value = true
  try {
    await store.persist()
    await library.exportGame(gameId)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="store.game" class="page">
      <aside class="sidebar">
        <div class="sidebar-card">
          <h1 class="title">{{ store.game.meta.title || 'Без названия' }}</h1>
          <span class="status" :class="{ dirty: store.dirty }">
            {{ store.dirty ? '● Есть несохранённые изменения' : '✓ Сохранено' }}
          </span>
          <div class="sidebar-actions">
            <UiButton variant="primary" @click="saveNow">Сохранить</UiButton>
            <UiButton :disabled="exporting" @click="exportSog">{{ exporting ? 'Экспорт…' : '⭳ Экспорт .sog' }}</UiButton>
            <UiButton variant="ghost" @click="startPlaying">▶ Начать игру</UiButton>
          </div>
        </div>
        <div class="sidebar-card">
          <h2 class="section-title">Настройки игры</h2>
          <GameMetaForm :meta="store.game.meta" />
        </div>
      </aside>

      <main class="content">
        <div class="content-header">
          <h2 class="section-title">Категории</h2>
          <UiButton variant="primary" @click="addCategory">+ Категория</UiButton>
        </div>
        <CategoryList v-if="store.game.categories.length" :categories="store.game.categories" :game-id="gameId" />
        <EmptyState v-else message="Пока нет ни одной категории — добавьте первую" />
      </main>
    </div>
    <EmptyState v-else-if="!loading" message="Игра не найдена" />
    <EmptyState v-else message="Загрузка..." />
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 320px 1fr;
  align-items: start;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-8);
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.sidebar {
  position: sticky;
  top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sidebar-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  text-align: left;
}

.title {
  font-size: var(--font-size-lg);
  color: var(--color-text-heading);
  margin: 0;
  word-break: break-word;
}

.status {
  font-size: var(--font-size-sm);
  color: var(--color-success);
}
.status.dirty {
  color: var(--color-warning);
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.sidebar-actions .ui-btn {
  width: 100%;
}

.section-title {
  font-size: var(--font-size-md);
  color: var(--color-text-heading);
  margin: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 900px) {
  .page {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: static;
  }
}
</style>
