<script setup lang="ts">
import type { LibraryEntry } from '../../stores/gameLibrary'
import GameCard from './GameCard.vue'

defineProps<{ entries: LibraryEntry[] }>()
const emit = defineEmits<{ open: [id: string]; play: [id: string]; delete: [id: string]; export: [id: string] }>()
</script>

<template>
  <p v-if="entries.length === 0" class="empty">Игр пока нет — создайте первую.</p>
  <div v-else class="grid">
    <GameCard
      v-for="entry in entries"
      :key="entry.id"
      :entry="entry"
      @open="emit('open', $event)"
      @play="emit('play', $event)"
      @delete="emit('delete', $event)"
      @export="emit('export', $event)"
    />
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.empty {
  color: var(--color-text-muted);
}
</style>
