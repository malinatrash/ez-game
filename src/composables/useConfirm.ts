import { reactive } from 'vue'

const state = reactive<{ visible: boolean; message: string; resolve: ((value: boolean) => void) | null }>({
  visible: false,
  message: '',
  resolve: null,
})

export function useConfirmState() {
  return state
}

export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    state.message = message
    state.visible = true
    state.resolve = resolve
  })
}

export function settleConfirm(result: boolean) {
  state.visible = false
  state.resolve?.(result)
  state.resolve = null
}
