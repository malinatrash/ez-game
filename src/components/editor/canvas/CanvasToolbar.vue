<script setup lang="ts">
import { useAssetUpload } from '../../../composables/useAssetUpload'
import { readImageDimensions, readVideoDimensions, type MediaDims } from '../../../services/mediaDimensions'
import type { ShapeType } from '../../../types/game'
import UiFileButton from '../../common/UiFileButton.vue'

const emit = defineEmits<{
  'add-text': []
  'add-shape': [shapeType: ShapeType]
  'add-image': [assetId: string, dims: MediaDims | null]
  'add-video': [assetId: string, label: string, dims: MediaDims | null]
  'add-audio': [assetId: string, label: string]
}>()

const { uploadAsset } = useAssetUpload()

async function onPick(file: File, kind: 'image' | 'video' | 'audio') {
  const id = await uploadAsset(file)
  if (kind === 'image') emit('add-image', id, await readImageDimensions(file))
  else if (kind === 'video') emit('add-video', id, file.name, await readVideoDimensions(file))
  else emit('add-audio', id, file.name)
}
</script>

<template>
  <div class="toolbar">
    <button type="button" class="tool" @click="emit('add-text')">
      <span class="icon">🔤</span>
      <span>Текст</span>
    </button>
    <div class="divider" />
    <button type="button" class="tool" @click="emit('add-shape', 'rectangle')">
      <span class="icon">▭</span>
      <span>Прямоугольник</span>
    </button>
    <button type="button" class="tool" @click="emit('add-shape', 'circle')">
      <span class="icon">⬤</span>
      <span>Круг</span>
    </button>
    <div class="divider" />
    <UiFileButton class="tool-file" accept="image/*" @pick="onPick($event, 'image')">
      <span class="icon">🖼️</span>
      <span>Картинка</span>
    </UiFileButton>
    <UiFileButton class="tool-file" accept="video/*" @pick="onPick($event, 'video')">
      <span class="icon">🎬</span>
      <span>Видео</span>
    </UiFileButton>
    <UiFileButton class="tool-file" accept="audio/*" @pick="onPick($event, 'audio')">
      <span class="icon">🎵</span>
      <span>Аудио</span>
    </UiFileButton>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.divider {
  width: 1px;
  align-self: stretch;
  margin: var(--space-1) 0;
  background: var(--color-border);
}
.tool {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 34px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
}
.tool:hover {
  background: var(--color-accent-bg);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}
.icon {
  font-size: var(--font-size-md);
  line-height: 1;
}

.toolbar :deep(.tool-file) {
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
}
.toolbar :deep(.tool-file:hover) {
  background: var(--color-accent-bg);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}
</style>
