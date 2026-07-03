import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useFitScale(target: Ref<HTMLElement | null>, contentWidth: number, contentHeight: number) {
  const scale = ref(1)
  let observer: ResizeObserver | undefined

  function update() {
    const el = target.value
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    if (width === 0 || height === 0) return
    scale.value = Math.min(width / contentWidth, height / contentHeight)
  }

  onMounted(() => {
    update()
    observer = new ResizeObserver(update)
    if (target.value) observer.observe(target.value)
  })

  onUnmounted(() => observer?.disconnect())

  return scale
}
