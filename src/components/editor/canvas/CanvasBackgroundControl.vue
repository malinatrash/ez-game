<script setup lang="ts">
import type { SideBackground } from '../../../types/game'
import { useAssetUpload } from '../../../composables/useAssetUpload'
import UiFileButton from '../../common/UiFileButton.vue'
import UiButton from '../../common/UiButton.vue'

const props = defineProps<{ background?: SideBackground | null }>()
const emit = defineEmits<{ 'update:background': [background: SideBackground | null] }>()

const { uploadAsset } = useAssetUpload()

async function onPick(file: File) {
  const assetId = await uploadAsset(file)
  emit('update:background', { assetId, opacity: props.background?.opacity ?? 0.5 })
}

function onOpacityInput(event: Event) {
  if (!props.background) return
  const opacity = (event.target as HTMLInputElement).valueAsNumber
  emit('update:background', { ...props.background, opacity })
}

function clear() {
  emit('update:background', null)
}
</script>

<template>
  <div class="bg-control">
    <span class="label">Фон</span>
    <UiFileButton class="tool-file" accept="image/*" @pick="onPick">
      <span class="icon">🌆</span>
      <span>{{ background ? 'Заменить' : 'Добавить' }}</span>
    </UiFileButton>
    <template v-if="background">
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="background.opacity"
        title="Прозрачность фона"
        @input="onOpacityInput"
      />
      <UiButton variant="danger" size="sm" icon-only title="Убрать фон" @click="clear">✕</UiButton>
    </template>
  </div>
</template>

<style scoped>
.bg-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
input[type='range'] {
  width: 90px;
}
.icon {
  font-size: var(--font-size-md);
  line-height: 1;
}
.bg-control :deep(.tool-file) {
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
}
.bg-control :deep(.tool-file:hover) {
  background: var(--color-accent-bg);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}
</style>
