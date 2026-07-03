<script setup lang="ts">
import type { LibraryEntry } from '../../stores/gameLibrary'

defineProps<{ entry: LibraryEntry }>()
const emit = defineEmits<{ open: [id: string]; play: [id: string]; delete: [id: string]; export: [id: string] }>()
</script>

<template>
  <article class="card">
    <h2>{{ entry.meta.title }}</h2>
    <p class="meta">Обновлено: {{ new Date(entry.meta.updatedAt).toLocaleString() }}</p>
    <div class="actions">
      <button class="primary" @click="emit('play', entry.id)">▶ Играть</button>
      <button @click="emit('open', entry.id)">Редактировать</button>
      <button @click="emit('export', entry.id)">Экспорт .sog</button>
      <button class="danger" @click="emit('delete', entry.id)">Удалить</button>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  min-width: var(--size-card-min-width);
  text-align: left;
  transition: transform var(--duration-fast) var(--ease-bounce), box-shadow var(--duration-fast) var(--ease-standard);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent-border);
}
.meta {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: var(--space-2) 0 var(--space-4);
}
.actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
button {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  cursor: pointer;
}
.danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.primary {
  background: var(--color-accent-bg);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
  font-weight: 600;
}
</style>
