import { ref } from 'vue'

export function useCanvasSelection() {
  const selectedId = ref<string | null>(null)

  function select(id: string | null) {
    selectedId.value = id
  }

  function clear() {
    selectedId.value = null
  }

  return { selectedId, select, clear }
}
