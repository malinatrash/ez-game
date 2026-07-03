<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useImage } from 'vue-konva'
import type { CanvasElement, SideBackground } from '../../../types/game'
import { orderedByZIndex } from '../../../services/canvasElements'
import { readDragEnd, readTransformEnd } from '../../../services/konvaTransform'
import { useSnapGuides } from '../../../composables/useSnapGuides'
import { useAssetUrl } from '../../../composables/useAssetUrl'
import KonvaTextNode from './nodes/KonvaTextNode.vue'
import KonvaImageNode from './nodes/KonvaImageNode.vue'
import KonvaMediaPlaceholderNode from './nodes/KonvaMediaPlaceholderNode.vue'

const props = defineProps<{
  elements: CanvasElement[]
  background?: SideBackground | null
  selectedId: string | null
  stageWidth: number
  stageHeight: number
}>()

const backgroundUrl = useAssetUrl(() => props.background?.assetId)
const [backgroundImage] = useImage(computed(() => backgroundUrl.value ?? ''))
const backgroundConfig = computed(() => ({
  width: props.stageWidth,
  height: props.stageHeight,
  image: backgroundImage.value,
  opacity: props.background?.opacity ?? 1,
  listening: false,
}))
const emit = defineEmits<{
  select: [id: string | null]
  patch: [id: string, patch: Partial<CanvasElement>]
}>()

const stageConfig = { width: props.stageWidth, height: props.stageHeight }
const transformerRef = ref<any>(null)
const nodeRefs = new Map<string, any>()
const { guides, onDragMove, onDragEnd } = useSnapGuides(props.stageWidth, props.stageHeight)

function setNodeRef(el: any, id: string) {
  if (el) nodeRefs.set(id, el)
  else nodeRefs.delete(id)
}

watch(
  () => props.selectedId,
  async (id) => {
    await nextTick()
    const transformer = transformerRef.value?.getNode()
    if (!transformer) return
    const node = id ? nodeRefs.get(id)?.getNode() : null
    transformer.nodes(node ? [node] : [])
    transformer.getLayer()?.batchDraw()
  },
)

function onStageMouseDown(event: any) {
  if (event.target === event.target.getStage()) emit('select', null)
}

function handleDragMove(id: string, node: any) {
  onDragMove(node, props.elements, id)
}

function handleDragEnd(id: string, node: any) {
  emit('patch', id, readDragEnd(node))
  onDragEnd()
}

function handleTransformEnd(id: string, node: any) {
  emit('patch', id, readTransformEnd(node))
}

const guideLineConfig = (points: number[]) => ({
  points,
  stroke: '#ff2fd0',
  strokeWidth: 1,
  dash: [4, 4],
})
</script>

<template>
  <v-stage :config="stageConfig" @mousedown="onStageMouseDown" @touchstart="onStageMouseDown">
    <v-layer>
      <v-rect :config="{ width: stageWidth, height: stageHeight, fill: '#12141c' }" />
      <v-image v-if="backgroundImage" :config="backgroundConfig" />
      <template v-for="el in orderedByZIndex(elements)" :key="el.id">
        <KonvaTextNode
          v-if="el.type === 'text'"
          :ref="(c: any) => setNodeRef(c, el.id)"
          :element="el"
          @select="emit('select', el.id)"
          @dragmove="handleDragMove(el.id, $event)"
          @dragend="handleDragEnd(el.id, $event)"
          @transformend="handleTransformEnd(el.id, $event)"
        />
        <KonvaImageNode
          v-else-if="el.type === 'image'"
          :ref="(c: any) => setNodeRef(c, el.id)"
          :element="el"
          @select="emit('select', el.id)"
          @dragmove="handleDragMove(el.id, $event)"
          @dragend="handleDragEnd(el.id, $event)"
          @transformend="handleTransformEnd(el.id, $event)"
        />
        <KonvaMediaPlaceholderNode
          v-else
          :ref="(c: any) => setNodeRef(c, el.id)"
          :element="el"
          @select="emit('select', el.id)"
          @dragmove="handleDragMove(el.id, $event)"
          @dragend="handleDragEnd(el.id, $event)"
          @transformend="handleTransformEnd(el.id, $event)"
        />
      </template>
      <v-transformer ref="transformerRef" :config="{ rotateEnabled: true }" />
    </v-layer>
    <v-layer>
      <v-line v-for="(guide, i) in guides" :key="i" :config="guideLineConfig(guide.points)" />
    </v-layer>
  </v-stage>
</template>

<style scoped>
:deep(canvas) {
  display: block;
}
</style>
