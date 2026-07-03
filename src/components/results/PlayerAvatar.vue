<script setup lang="ts">
import type { Player } from '../../types/player'
import { useAssetUrl } from '../../composables/useAssetUrl'

const props = defineProps<{ player: Player; size?: number }>()
const avatarUrl = useAssetUrl(() => props.player.avatarAssetId)
</script>

<template>
  <span class="avatar-wrap" :style="{ '--size': `${size ?? 40}px` }">
    <img v-if="avatarUrl" :src="avatarUrl" class="avatar" alt="" />
    <span v-else class="avatar avatar-fallback" :style="{ background: player.color }">
      {{ player.name.charAt(0).toUpperCase() }}
    </span>
  </span>
</template>

<style scoped>
.avatar-wrap {
  display: inline-flex;
  flex-shrink: 0;
}
.avatar {
  width: var(--size);
  height: var(--size);
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid v-bind('player.color');
  display: block;
}
.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-bg);
  font-weight: 700;
  font-size: calc(var(--size) * 0.42);
}
</style>
