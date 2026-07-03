<script setup lang="ts">
import type { Category } from '../../../types/game'
import { useGameEditorStore } from '../../../stores/gameEditor'
import { confirmDialog } from '../../../composables/useConfirm'
import CategoryEditorRow from './CategoryEditorRow.vue'

defineProps<{ categories: Category[]; gameId: string }>()
const store = useGameEditorStore()

async function removeCategory(id: string) {
  if (await confirmDialog('Удалить категорию со всеми вопросами?')) store.removeCategory(id)
}
</script>

<template>
  <div class="list">
    <CategoryEditorRow
      v-for="category in categories"
      :key="category.id"
      :category="category"
      :game-id="gameId"
      @move-up="store.moveCategory(category.id, -1)"
      @move-down="store.moveCategory(category.id, 1)"
      @remove="removeCategory(category.id)"
    />
  </div>
</template>

<style scoped>
.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-5);
  align-items: start;
}
</style>
