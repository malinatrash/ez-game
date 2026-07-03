<script setup lang="ts">
import type { GameMeta } from '../../../types/game'
import ImageUploader from '../../common/ImageUploader.vue'
import AudioUploader from '../../common/AudioUploader.vue'

defineProps<{ meta: GameMeta }>()
</script>

<template>
  <div class="form">
    <label class="field">
      <span>Название игры</span>
      <input v-model="meta.title" type="text" />
    </label>
    <ImageUploader v-model="meta.wallpaperAssetId" label="Обои" />
    <AudioUploader v-model="meta.backgroundMusicAssetId" label="Фоновая музыка" />
    <AudioUploader v-model="meta.resultsMusicAssetId" label="Музыка на экране результатов" />
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  text-align: left;
  max-width: 360px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.field span {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
input[type='text'] {
  height: var(--size-button-height);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
