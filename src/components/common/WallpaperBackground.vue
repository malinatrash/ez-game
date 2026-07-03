<script setup lang="ts">
import { computed } from 'vue'
import { useAssetUrl } from '../../composables/useAssetUrl'

const props = defineProps<{ assetId?: string }>()
const url = useAssetUrl(() => props.assetId)
const style = computed(() => (url.value ? { backgroundImage: `url(${url.value})` } : {}))
</script>

<template>
  <div v-if="url" class="wallpaper" :style="style" />
</template>

<style scoped>
.wallpaper {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
