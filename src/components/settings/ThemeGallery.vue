<script setup lang="ts">
import { useThemeStore } from '../../stores/theme'
import { BUILT_IN_THEME_PREVIEWS } from '../../types/theme'
import ThemeSwatch from './ThemeSwatch.vue'

const themeStore = useThemeStore()
</script>

<template>
  <div class="gallery">
    <ThemeSwatch
      v-for="theme in themeStore.builtInThemes"
      :key="theme.id"
      :name="theme.name"
      :active="themeStore.activeThemeId === theme.id"
      :colors="BUILT_IN_THEME_PREVIEWS[theme.id]"
      @select="themeStore.setActiveTheme(theme.id)"
    />
    <ThemeSwatch
      v-for="theme in themeStore.customThemes"
      :key="theme.id"
      :name="theme.name"
      :active="themeStore.activeThemeId === theme.id"
      :colors="{
        bg: theme.colors.colorBg,
        surface: theme.colors.colorSurface,
        accent: theme.colors.colorAccent,
        text: theme.colors.colorText,
      }"
      @select="themeStore.setActiveTheme(theme.id)"
    >
      <button type="button" class="remove" @click.stop="themeStore.deleteCustomTheme(theme.id)">✕</button>
    </ThemeSwatch>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.remove {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-sm);
}
.remove:hover {
  color: var(--color-danger);
}
</style>
