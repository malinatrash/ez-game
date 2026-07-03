<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameLibraryStore } from '../stores/gameLibrary'
import { confirmDialog } from '../composables/useConfirm'
import NewGameForm from '../components/library/NewGameForm.vue'
import ImportButton from '../components/library/ImportButton.vue'
import LibraryList from '../components/library/LibraryList.vue'

const library = useGameLibraryStore()
const router = useRouter()

onMounted(() => {
  if (!library.loaded) library.loadEntries()
})

async function handleCreate(title: string) {
  const id = await library.createGame(title)
  router.push(`/editor/${id}`)
}

function handleOpen(id: string) {
  router.push(`/editor/${id}`)
}

function handlePlay(id: string) {
  router.push(`/play/${id}/setup`)
}

async function handleDelete(id: string) {
  if (await confirmDialog('Удалить эту игру без возможности восстановления?')) {
    await library.deleteGame(id)
  }
}

async function handleExport(id: string) {
  await library.exportGame(id)
}

async function handleImport(file: File) {
  try {
    await library.importGame(file)
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Не удалось импортировать файл')
  }
}
</script>

<template>
  <main class="page">
    <h1>Библиотека игр</h1>
    <div class="toolbar">
      <NewGameForm @create="handleCreate" />
      <ImportButton @import="handleImport" />
    </div>
    <LibraryList
      :entries="library.entries"
      @open="handleOpen"
      @play="handlePlay"
      @delete="handleDelete"
      @export="handleExport"
    />
  </main>
</template>

<style scoped>
.page {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  align-items: flex-start;
}
.toolbar {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}
</style>
