<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasElement } from '../../../../types/game'

const props = defineProps<{ element: Extract<CanvasElement, { type: 'shape' }> }>()
const emit = defineEmits<{
  select: []
  dragmove: [node: any]
  dragend: [node: any]
  transformend: [node: any]
}>()

const groupRef = ref<any>(null)
defineExpose({ getNode: () => groupRef.value?.getNode() })

const groupConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.w,
  height: props.element.h,
  rotation: props.element.rotation,
  draggable: true,
}))

const rectConfig = computed(() => ({
  width: props.element.w,
  height: props.element.h,
  fill: props.element.fill,
}))

const ellipseConfig = computed(() => ({
  x: props.element.w / 2,
  y: props.element.h / 2,
  radiusX: props.element.w / 2,
  radiusY: props.element.h / 2,
  fill: props.element.fill,
}))
</script>

<template>
  <v-group
    ref="groupRef"
    :config="groupConfig"
    @click="emit('select')"
    @tap="emit('select')"
    @dragmove="emit('dragmove', $event.target)"
    @dragend="emit('dragend', $event.target)"
    @transformend="emit('transformend', $event.target)"
  >
    <v-rect v-if="element.shapeType === 'rectangle'" :config="rectConfig" />
    <v-ellipse v-else :config="ellipseConfig" />
  </v-group>
</template>
