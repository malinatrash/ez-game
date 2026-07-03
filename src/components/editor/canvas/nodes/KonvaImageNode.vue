<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImage } from 'vue-konva'
import type { CanvasElement } from '../../../../types/game'
import { useAssetUrl } from '../../../../composables/useAssetUrl'

const props = defineProps<{ element: Extract<CanvasElement, { type: 'image' }> }>()
const emit = defineEmits<{
  select: []
  dragmove: [node: any]
  dragend: [node: any]
  transformend: [node: any]
}>()

const konvaRef = ref<any>(null)
defineExpose({ getNode: () => konvaRef.value?.getNode() })

const url = useAssetUrl(() => props.element.assetId)
const [image] = useImage(computed(() => url.value ?? ''))

const config = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.w,
  height: props.element.h,
  rotation: props.element.rotation,
  image: image.value,
  draggable: true,
}))
</script>

<template>
  <v-image
    ref="konvaRef"
    :config="config"
    @click="emit('select')"
    @tap="emit('select')"
    @dragmove="emit('dragmove', $event.target)"
    @dragend="emit('dragend', $event.target)"
    @transformend="emit('transformend', $event.target)"
  />
</template>
