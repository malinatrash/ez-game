<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Question } from '../../../types/game'
import { orderedByZIndex } from '../../../services/canvasElements'
import { useFitScale } from '../../../composables/useFitScale'
import { useAssetUrl } from '../../../composables/useAssetUrl'
import CanvasElementView from './CanvasElementView.vue'

const CANVAS_W = 640
const CANVAS_H = 400

const props = defineProps<{ question: Question; side: 'content' | 'answer' }>()

const frameWrapRef = ref<HTMLElement | null>(null)
const scale = useFitScale(frameWrapRef, CANVAS_W, CANVAS_H)

const elements = computed(() => orderedByZIndex(props.question[props.side]))
const background = computed(() =>
  props.side === 'content' ? props.question.contentBackground : props.question.answerBackground,
)
const backgroundUrl = useAssetUrl(() => background.value?.assetId)
const backgroundStyle = computed(() => ({
  backgroundImage: backgroundUrl.value ? `url(${backgroundUrl.value})` : 'none',
  opacity: background.value?.opacity ?? 1,
}))
</script>

<template>
  <div class="stage">
    <p class="cost">{{ question.cost }}</p>
    <div ref="frameWrapRef" class="frame-wrap">
      <div
        class="canvas-frame"
        :style="{ width: CANVAS_W + 'px', height: CANVAS_H + 'px', transform: `scale(${scale})` }"
      >
        <div v-if="backgroundUrl" class="canvas-bg" :style="backgroundStyle" />
        <CanvasElementView v-for="el in elements" :key="el.id" :element="el" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  height: 100%;
  min-height: 0;
  text-align: center;
}
.cost {
  font-size: var(--font-size-xxl);
  color: var(--color-accent);
  font-weight: 700;
  margin: 0;
  flex-shrink: 0;
}
.frame-wrap {
  flex: 1;
  width: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-frame {
  position: relative;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  /* Fixed regardless of the active theme: canvas elements are authored in the
     editor against this same backdrop (see CanvasStage.vue), and text defaults
     to a light color — a theme-driven background would make it invisible
     under light themes. */
  background: #12141c;
}
.canvas-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
</style>
