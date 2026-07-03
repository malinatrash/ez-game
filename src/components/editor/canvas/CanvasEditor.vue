<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasElement, SideBackground } from '../../../types/game'
import { useFitScale } from '../../../composables/useFitScale'
import {
  addElement,
  bringToFront,
  createAudioElement,
  createImageElement,
  createTextElement,
  createVideoElement,
  duplicateElement,
  removeElement,
  sendToBack,
  updateElement,
} from '../../../services/canvasElements'
import { useCanvasSelection } from '../../../composables/useCanvasSelection'
import CanvasToolbar from './CanvasToolbar.vue'
import CanvasBackgroundControl from './CanvasBackgroundControl.vue'
import CanvasStage from './CanvasStage.vue'
import ElementPropertiesPanel from './ElementPropertiesPanel.vue'

const props = withDefaults(
  defineProps<{
    elements: CanvasElement[]
    background?: SideBackground | null
    stageWidth?: number
    stageHeight?: number
  }>(),
  { stageWidth: 640, stageHeight: 400 },
)
const emit = defineEmits<{
  'update:elements': [elements: CanvasElement[]]
  'update:background': [background: SideBackground | null]
}>()

const { selectedId, select } = useCanvasSelection()

const stageWrapRef = ref<HTMLElement | null>(null)
const scale = useFitScale(stageWrapRef, props.stageWidth, props.stageHeight)

const selectedElement = computed(() => props.elements.find((el) => el.id === selectedId.value) ?? null)

function update(next: CanvasElement[]) {
  emit('update:elements', next)
}

function onAddText() {
  const el = createTextElement(props.elements, 'Новый текст')
  update(addElement(props.elements, el))
  select(el.id)
}
function onAddImage(assetId: string) {
  const el = createImageElement(props.elements, assetId)
  update(addElement(props.elements, el))
  select(el.id)
}
function onAddVideo(assetId: string, label: string) {
  const el = createVideoElement(props.elements, assetId, label)
  update(addElement(props.elements, el))
  select(el.id)
}
function onAddAudio(assetId: string, label: string) {
  const el = createAudioElement(props.elements, assetId, label)
  update(addElement(props.elements, el))
  select(el.id)
}
function onPatch(id: string, patch: Partial<CanvasElement>) {
  update(updateElement(props.elements, id, patch))
}
function onRemove(id: string) {
  update(removeElement(props.elements, id))
  if (selectedId.value === id) select(null)
}
function onDuplicate(id: string) {
  update(duplicateElement(props.elements, id))
}
function onBringToFront(id: string) {
  update(bringToFront(props.elements, id))
}
function onSendToBack(id: string) {
  update(sendToBack(props.elements, id))
}
</script>

<template>
  <div class="editor">
    <div class="toolbar-row">
      <CanvasToolbar @add-text="onAddText" @add-image="onAddImage" @add-video="onAddVideo" @add-audio="onAddAudio" />
      <CanvasBackgroundControl :background="background" @update:background="emit('update:background', $event)" />
    </div>
    <div class="workspace">
      <div ref="stageWrapRef" class="stage-wrap">
        <div class="stage-scaler" :style="{ width: stageWidth + 'px', height: stageHeight + 'px', transform: `scale(${scale})` }">
          <CanvasStage
            :elements="elements"
            :background="background"
            :selected-id="selectedId"
            :stage-width="stageWidth"
            :stage-height="stageHeight"
            @select="select"
            @patch="onPatch"
          />
        </div>
      </div>
      <ElementPropertiesPanel
        :element="selectedElement"
        @patch="onPatch"
        @remove="onRemove"
        @duplicate="onDuplicate"
        @bring-to-front="onBringToFront"
        @send-to-back="onSendToBack"
      />
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  padding-right: var(--space-4);
}
.toolbar-row :deep(.toolbar) {
  border-bottom: none;
  flex: 1;
}
.workspace {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 560px;
}
.stage-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg);
}
.stage-scaler {
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

@media (max-width: 900px) {
  .workspace {
    flex-direction: column;
    min-height: 0;
  }
  .stage-wrap {
    padding: var(--space-4);
  }
}
</style>
