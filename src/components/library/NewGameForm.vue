<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ create: [title: string] }>()
const title = ref('')

function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('create', trimmed)
  title.value = ''
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <input v-model="title" placeholder="Название игры" />
    <button type="submit">Создать игру</button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  gap: var(--space-2);
}
input {
  height: var(--size-button-height);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
button {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-accent);
  color: var(--color-bg);
  cursor: pointer;
  font-weight: 600;
}
</style>
