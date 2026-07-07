import type { CanvasElement, MediaPlaybackOptions, ShapeType, TextStyle } from '../types/game'
import { createId } from './id'

export const DEFAULT_ELEMENT_W = 320
export const DEFAULT_ELEMENT_H = 120
export const DEFAULT_SHAPE_SIZE = 160
export const DEFAULT_MEDIA_FIT_MAX = 360

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 24, color: '#f5f5f5', align: 'center' }
const DEFAULT_PLAYBACK: MediaPlaybackOptions = { autoplay: false, loop: false, muted: false }
const DEFAULT_SHAPE_FILL = '#ffffff'

/** Вписывает бокс исходных пропорций медиа в квадрат maxSize — дефолтный размер элемента сохраняет aspect ratio источника. */
export function fitMediaBox(dims?: { w: number; h: number } | null, maxSize = DEFAULT_MEDIA_FIT_MAX): Partial<CanvasElement> {
  if (!dims || !dims.w || !dims.h) return {}
  const ratio = dims.w / dims.h
  let w = maxSize
  let h = maxSize / ratio
  if (h > maxSize) {
    h = maxSize
    w = maxSize * ratio
  }
  return { w: Math.round(w), h: Math.round(h) }
}

export function nextZIndex(elements: CanvasElement[]): number {
  return elements.length ? Math.max(...elements.map((el) => el.zIndex)) + 1 : 0
}

function baseTransform(elements: CanvasElement[], overrides: Partial<CanvasElement> = {}) {
  return {
    x: overrides.x ?? 40,
    y: overrides.y ?? 40,
    w: overrides.w ?? DEFAULT_ELEMENT_W,
    h: overrides.h ?? DEFAULT_ELEMENT_H,
    rotation: overrides.rotation ?? 0,
    zIndex: overrides.zIndex ?? nextZIndex(elements),
  }
}

export function createTextElement(
  elements: CanvasElement[],
  value = '',
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: createId(),
    type: 'text',
    value,
    style: { ...DEFAULT_TEXT_STYLE },
    ...baseTransform(elements, overrides),
  }
}

export function createImageElement(
  elements: CanvasElement[],
  assetId: string,
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return { id: createId(), type: 'image', assetId, ...baseTransform(elements, overrides) }
}

export function createVideoElement(
  elements: CanvasElement[],
  assetId: string,
  label?: string,
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: createId(),
    type: 'video',
    assetId,
    label,
    playback: { ...DEFAULT_PLAYBACK },
    ...baseTransform(elements, overrides),
  }
}

export function createAudioElement(
  elements: CanvasElement[],
  assetId: string,
  label?: string,
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: createId(),
    type: 'audio',
    assetId,
    label,
    playback: { ...DEFAULT_PLAYBACK },
    ...baseTransform(elements, overrides),
  }
}

export function createShapeElement(
  elements: CanvasElement[],
  shapeType: ShapeType,
  overrides: Partial<CanvasElement> = {},
): CanvasElement {
  return {
    id: createId(),
    type: 'shape',
    shapeType,
    fill: DEFAULT_SHAPE_FILL,
    ...baseTransform(elements, { w: DEFAULT_SHAPE_SIZE, h: DEFAULT_SHAPE_SIZE, ...overrides }),
  }
}

export function addElement(elements: CanvasElement[], element: CanvasElement): CanvasElement[] {
  return [...elements, element]
}

export function removeElement(elements: CanvasElement[], id: string): CanvasElement[] {
  return elements.filter((el) => el.id !== id)
}

export function updateElement(
  elements: CanvasElement[],
  id: string,
  patch: Partial<CanvasElement>,
): CanvasElement[] {
  return elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el))
}

export function duplicateElement(elements: CanvasElement[], id: string): CanvasElement[] {
  const original = elements.find((el) => el.id === id)
  if (!original) return elements
  const copy: CanvasElement = {
    ...original,
    id: createId(),
    x: original.x + 16,
    y: original.y + 16,
    zIndex: nextZIndex(elements),
  }
  return [...elements, copy]
}

export function bringToFront(elements: CanvasElement[], id: string): CanvasElement[] {
  return updateElement(elements, id, { zIndex: nextZIndex(elements) })
}

export function sendToBack(elements: CanvasElement[], id: string): CanvasElement[] {
  const minZ = elements.length ? Math.min(...elements.map((el) => el.zIndex)) - 1 : 0
  return updateElement(elements, id, { zIndex: minZ })
}

export function orderedByZIndex(elements: CanvasElement[]): CanvasElement[] {
  return [...elements].sort((a, b) => a.zIndex - b.zIndex)
}
