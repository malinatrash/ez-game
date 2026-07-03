<script setup lang="ts">
import { useAssetUpload } from '../../composables/useAssetUpload'
import { useAssetUrl } from '../../composables/useAssetUrl'
import UiFileButton from './UiFileButton.vue'
import UiButton from './UiButton.vue'

const props = defineProps<{ modelValue?: string; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [id: string | undefined] }>()

const { uploadAsset } = useAssetUpload()
const url = useAssetUrl(() => props.modelValue)

async function onPick(file: File) {
  const id = await uploadAsset(file)
  emit('update:modelValue', id)
}

function clear() {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div class="uploader">
    <span v-if="label" class="label">{{ label }}</span>
    <div v-if="url" class="preview-wrap">
      <audio :src="url" controls class="preview" />
      <UiButton variant="danger" size="sm" icon-only title="Убрать" @click="clear">✕</UiButton>
    </div>
    <UiFileButton v-else accept="audio/*" @pick="onPick">🎵 Загрузить аудио</UiFileButton>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
}
.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.preview-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.preview {
  max-width: 260px;
}
</style>
