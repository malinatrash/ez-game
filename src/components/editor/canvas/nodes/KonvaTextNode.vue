<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasElement } from '../../../../types/game'

const props = defineProps<{ element: Extract<CanvasElement, { type: 'text' }> }>()
const emit = defineEmits<{
  select: []
  dragmove: [node: any]
  dragend: [node: any]
  transformend: [node: any]
}>()

const konvaRef = ref<any>(null)
defineExpose({ getNode: () => konvaRef.value?.getNode() })

const config = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.w,
  height: props.element.h,
  rotation: props.element.rotation,
  text: props.element.value,
  fontSize: props.element.style.fontSize,
  fill: props.element.style.color,
  align: props.element.style.align,
  fontStyle: props.element.style.fontWeight === 'bold' ? 'bold' : 'normal',
  verticalAlign: 'middle',
  draggable: true,
}))
</script>

<template>
  <v-text
    ref="konvaRef"
    :config="config"
    @click="emit('select')"
    @tap="emit('select')"
    @dragmove="emit('dragmove', $event.target)"
    @dragend="emit('dragend', $event.target)"
    @transformend="emit('transformend', $event.target)"
  />
</template>
