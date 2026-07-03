<script setup lang="ts">
import { useAssetUpload } from '../../composables/useAssetUpload'
import { useAssetUrl } from '../../composables/useAssetUrl'
import UiFileButton from './UiFileButton.vue'
import UiButton from './UiButton.vue'

const props = defineProps<{ modelValue?: string; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [id: string | undefined] }>()

const { uploadAsset } = useAssetUpload()
const previewUrl = useAssetUrl(() => props.modelValue)

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
    <div v-if="previewUrl" class="preview-wrap">
      <img :src="previewUrl" class="preview" alt="" />
      <UiButton class="remove" variant="danger" size="sm" icon-only title="Убрать" @click="clear">✕</UiButton>
    </div>
    <UiFileButton v-else accept="image/*" @pick="onPick">🖼️ Загрузить изображение</UiFileButton>
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
  position: relative;
  display: inline-flex;
}
.preview {
  max-width: 220px;
  max-height: 140px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  display: block;
}
.remove {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
</style>
