import { ref, watchEffect, onUnmounted } from 'vue'
import { idb } from '../services/idb'

export function useAssetUrl(assetId: () => string | undefined) {
  const url = ref<string | null>(null)
  let currentUrl: string | null = null

  watchEffect(async () => {
    const id = assetId()
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl)
      currentUrl = null
    }
    url.value = null
    if (!id) return
    const blob = await idb.getAsset(id)
    if (!blob) return
    currentUrl = URL.createObjectURL(blob)
    url.value = currentUrl
  })

  onUnmounted(() => {
    if (currentUrl) URL.revokeObjectURL(currentUrl)
  })

  return url
}
