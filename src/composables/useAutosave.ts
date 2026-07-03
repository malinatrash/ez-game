import { watch } from 'vue'
import { useGameEditorStore } from '../stores/gameEditor'

export function useAutosave() {
  const store = useGameEditorStore()
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    () => store.game,
    () => {
      if (!store.game) return
      store.dirty = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => store.persist(), 800)
    },
    { deep: true },
  )
}
