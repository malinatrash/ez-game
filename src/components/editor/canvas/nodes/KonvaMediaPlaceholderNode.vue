<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasElement } from '../../../../types/game'

const props = defineProps<{ element: Extract<CanvasElement, { type: 'video' | 'audio' }> }>()
const emit = defineEmits<{
  select: []
  dragmove: [node: any]
  dragend: [node: any]
  transformend: [node: any]
}>()

const groupRef = ref<any>(null)
defineExpose({ getNode: () => groupRef.value?.getNode() })

const icon = computed(() => (props.element.type === 'video' ? '🎬' : '🎵'))
const label = computed(() => props.element.label ?? (props.element.type === 'video' ? 'Видео' : 'Аудио'))

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
  fill: 'rgba(120, 120, 140, 0.25)',
  stroke: '#9aa0b5',
  dash: [6, 4],
  cornerRadius: 8,
}))

const textConfig = computed(() => ({
  width: props.element.w,
  height: props.element.h,
  text: `${icon.value}  ${label.value}`,
  fontSize: 18,
  fill: '#ffffff',
  align: 'center',
  verticalAlign: 'middle',
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
    <v-rect :config="rectConfig" />
    <v-text :config="textConfig" />
  </v-group>
</template>
