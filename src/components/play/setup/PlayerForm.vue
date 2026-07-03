<script setup lang="ts">
import { ref } from 'vue'
import UiButton from '../../common/UiButton.vue'

const emit = defineEmits<{ add: [name: string] }>()
const name = ref('')

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  name.value = ''
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <input v-model="name" class="input" placeholder="Имя нового игрока" />
    <UiButton type="submit" variant="primary">+ Добавить игрока</UiButton>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  gap: var(--space-2);
}
.input {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  min-width: 220px;
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.input:focus {
  outline: none;
  border-color: var(--color-accent-border);
}
</style>
