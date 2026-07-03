import type Konva from 'konva'

export interface TransformPatch {
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

export function readTransformEnd(node: Konva.Node): TransformPatch {
  const scaleX = node.scaleX()
  const scaleY = node.scaleY()
  node.scaleX(1)
  node.scaleY(1)
  return {
    x: node.x(),
    y: node.y(),
    w: Math.max(5, node.width() * scaleX),
    h: Math.max(5, node.height() * scaleY),
    rotation: node.rotation(),
  }
}

export function readDragEnd(node: Konva.Node): Pick<TransformPatch, 'x' | 'y'> {
  return { x: node.x(), y: node.y() }
}
