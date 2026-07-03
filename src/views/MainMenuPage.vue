<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameLibraryStore } from '../stores/gameLibrary'
import MenuCard from '../components/menu/MenuCard.vue'

const router = useRouter()
const library = useGameLibraryStore()
const fileInput = ref<HTMLInputElement | null>(null)

async function quickCreate() {
  const id = await library.createGame('Новая игра')
  router.push(`/editor/${id}`)
}

function triggerImport() {
  fileInput.value?.click()
}

async function onImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const id = await library.importGame(file)
    router.push(`/editor/${id}`)
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Не удалось импортировать файл')
  }
}
</script>

<template>
  <main class="page">
    <div v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }">
      <h1 class="title">Своя игра</h1>
      <p class="subtitle">Создавайте вопросы, приглашайте игроков, ведите счёт.</p>
    </div>

    <nav
      class="grid"
      v-motion
      :initial="{ opacity: 0, y: 24 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 120 } }"
    >
      <MenuCard icon="📚" title="Библиотека игр" description="Все игры: создание, редактирование, экспорт" to="/library" />
      <MenuCard icon="➕" title="Новая игра" description="Начать с чистого листа" @click="quickCreate" />
      <MenuCard icon="📥" title="Импорт .sog" description="Загрузить готовый файл игры" @click="triggerImport" />
      <MenuCard icon="🎨" title="Настройки и темы" description="Оформление, светлая/тёмная/неон и другие" to="/settings" />
      <MenuCard icon="ℹ️" title="О программе" description="Как пользоваться и что умеет приложение" to="/about" />
    </nav>

    <input ref="fileInput" type="file" accept=".sog" hidden @change="onImportFile" />
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  min-height: 100vh;
  padding: var(--space-8);
  text-align: center;
  background: radial-gradient(circle at 50% 0%, var(--color-accent-bg), transparent 60%);
}

.title {
  font-size: var(--font-size-xxl);
  background: linear-gradient(120deg, var(--color-accent), var(--color-warning));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: var(--color-text-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
  max-width: 900px;
}
</style>
