<script setup lang="ts">
const emit = defineEmits<{ import: [file: File] }>()

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('import', file)
  input.value = ''
}
</script>

<template>
  <label class="import-button">
    Импортировать .sog
    <input type="file" accept=".sog" hidden @change="onChange" />
  </label>
</template>

<style scoped>
.import-button {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
</style>
