import { ref } from 'vue'
import type Konva from 'konva'
import type { CanvasElement } from '../types/game'

const SNAP_THRESHOLD = 6

interface GuideLine {
  points: number[]
}

export function useSnapGuides(stageWidth: number, stageHeight: number) {
  const guides = ref<GuideLine[]>([])

  function collectTargets(elements: CanvasElement[], selfId: string) {
    const vertical = [0, stageWidth / 2, stageWidth]
    const horizontal = [0, stageHeight / 2, stageHeight]
    for (const el of elements) {
      if (el.id === selfId) continue
      vertical.push(el.x, el.x + el.w / 2, el.x + el.w)
      horizontal.push(el.y, el.y + el.h / 2, el.y + el.h)
    }
    return { vertical, horizontal }
  }

  function onDragMove(node: Konva.Node, elements: CanvasElement[], selfId: string) {
    const { vertical, horizontal } = collectTargets(elements, selfId)
    const w = node.width() * node.scaleX()
    const h = node.height() * node.scaleY()
    const edgesX = [node.x(), node.x() + w / 2, node.x() + w]
    const edgesY = [node.y(), node.y() + h / 2, node.y() + h]

    const newGuides: GuideLine[] = []
    let snappedX: number | null = null
    let snappedY: number | null = null

    for (const target of vertical) {
      for (const edge of edgesX) {
        if (Math.abs(edge - target) < SNAP_THRESHOLD) {
          snappedX = node.x() + (target - edge)
          newGuides.push({ points: [target, 0, target, stageHeight] })
          break
        }
      }
      if (snappedX !== null) break
    }

    for (const target of horizontal) {
      for (const edge of edgesY) {
        if (Math.abs(edge - target) < SNAP_THRESHOLD) {
          snappedY = node.y() + (target - edge)
          newGuides.push({ points: [0, target, stageWidth, target] })
          break
        }
      }
      if (snappedY !== null) break
    }

    if (snappedX !== null) node.x(snappedX)
    if (snappedY !== null) node.y(snappedY)
    guides.value = newGuides
  }

  function onDragEnd() {
    guides.value = []
  }

  return { guides, onDragMove, onDragEnd }
}
