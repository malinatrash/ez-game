<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { THEME_COLOR_VARS, readCurrentThemeColors } from '../../services/themeColors'
import type { ThemeColors } from '../../types/theme'

const themeStore = useThemeStore()
const name = ref('Моя тема')
const colors = ref<ThemeColors>(readCurrentThemeColors())

const colorFields = Object.keys(THEME_COLOR_VARS).filter((k) => k !== 'colorScheme') as (keyof ThemeColors)[]

function resetFromCurrent() {
  colors.value = readCurrentThemeColors()
}

function save() {
  themeStore.createCustomTheme(name.value || 'Моя тема', { ...colors.value })
}
</script>

<template>
  <form class="editor" @submit.prevent="save">
    <div class="row">
      <input v-model="name" type="text" placeholder="Название темы" />
      <button type="button" @click="resetFromCurrent">На основе текущей</button>
    </div>
    <div class="fields">
      <label v-for="field in colorFields" :key="field" class="field">
        <span>{{ field }}</span>
        <input v-model="colors[field]" type="color" />
      </label>
      <label class="field">
        <span>colorScheme</span>
        <select v-model="colors.colorScheme">
          <option value="dark">dark</option>
          <option value="light">light</option>
        </select>
      </label>
    </div>
    <button type="submit" class="save">Сохранить как новую тему</button>
  </form>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.row {
  display: flex;
  gap: var(--space-2);
}
input[type='text'] {
  flex: 1;
  height: var(--size-button-height);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-3);
}
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
input[type='color'] {
  width: 40px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: none;
  padding: 0;
}
button {
  height: var(--size-button-height);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  cursor: pointer;
}
.save {
  align-self: flex-start;
  border-color: var(--color-accent-border);
  background: var(--color-accent-bg);
  color: var(--color-accent);
  font-weight: 600;
}
</style>
