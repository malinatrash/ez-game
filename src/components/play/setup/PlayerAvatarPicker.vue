<script setup lang="ts">
import { useAssetUpload } from '../../../composables/useAssetUpload'
import { useAssetUrl } from '../../../composables/useAssetUrl'

const props = defineProps<{ modelValue?: string; color: string; fallback: string }>()
const emit = defineEmits<{ 'update:modelValue': [id: string | undefined] }>()

const { uploadAsset } = useAssetUpload()
const url = useAssetUrl(() => props.modelValue)

async function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const id = await uploadAsset(file)
  emit('update:modelValue', id)
}

function clear(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  emit('update:modelValue', undefined)
}
</script>

<template>
  <label class="picker" :style="{ '--player-color': color }" title="Загрузить аватар">
    <img v-if="url" :src="url" class="avatar" alt="" />
    <span v-else class="avatar fallback">{{ fallback }}</span>
    <span class="edit-badge">✎</span>
    <button v-if="url" type="button" class="clear-badge" title="Убрать аватар" @click="clear">✕</button>
    <input type="file" accept="image/*" class="hidden-input" @change="onChange" />
  </label>
</template>

<style scoped>
.picker {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
}
.hidden-input {
  display: none;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  object-fit: cover;
  display: block;
  border: 3px solid var(--player-color);
  background: var(--color-surface-raised);
}
.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--player-color);
  color: var(--color-bg);
  font-weight: 700;
  font-size: var(--font-size-lg);
}
.edit-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-standard);
  font-size: var(--font-size-md);
}
.picker:hover .edit-badge {
  opacity: 1;
}
.clear-badge {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-surface);
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
</style>
