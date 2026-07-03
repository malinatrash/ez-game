<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasElement } from '../../../types/game'
import { useAssetUrl } from '../../../composables/useAssetUrl'

const props = defineProps<{ element: CanvasElement }>()

const assetId = computed(() => ('assetId' in props.element ? props.element.assetId : undefined))
const url = useAssetUrl(() => assetId.value)

const style = computed(() => ({
  position: 'absolute' as const,
  left: 0,
  top: 0,
  width: `${props.element.w}px`,
  height: `${props.element.h}px`,
  transform: `translate(${props.element.x}px, ${props.element.y}px) rotate(${props.element.rotation}deg)`,
  transformOrigin: 'center',
}))

const textStyle = computed(() => {
  if (props.element.type !== 'text') return {}
  return {
    fontSize: `${props.element.style.fontSize}px`,
    color: props.element.style.color,
    textAlign: props.element.style.align,
    fontWeight: props.element.style.fontWeight === 'bold' ? 700 : 400,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      props.element.style.align === 'left' ? 'flex-start' : props.element.style.align === 'right' ? 'flex-end' : 'center',
  }
})
</script>

<template>
  <div class="canvas-el" :style="style">
    <span v-if="element.type === 'text'" :style="textStyle">{{ element.value }}</span>
    <img v-else-if="element.type === 'image' && url" :src="url" class="media" alt="" />
    <video
      v-else-if="element.type === 'video' && url"
      :src="url"
      class="media"
      :autoplay="element.playback.autoplay"
      :loop="element.playback.loop"
      :muted="element.playback.muted"
      controls
    />
    <audio
      v-else-if="element.type === 'audio' && url"
      :src="url"
      class="media audio"
      :autoplay="element.playback.autoplay"
      :loop="element.playback.loop"
      :muted="element.playback.muted"
      controls
    />
  </div>
</template>

<style scoped>
.canvas-el {
  display: flex;
}
.media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-sm);
}
.audio {
  height: auto;
  align-self: center;
}
</style>
