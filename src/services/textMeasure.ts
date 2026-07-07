const LINE_HEIGHT_RATIO = 1.2
const VERTICAL_PADDING = 16
const MIN_HEIGHT = 40

let measureCtx: CanvasRenderingContext2D | null = null

function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d')
  }
  return measureCtx!
}

function countWrappedLines(text: string, fontSize: number, width: number, fontFamily = 'Arial'): number {
  const ctx = getMeasureCtx()
  ctx.font = `${fontSize}px ${fontFamily}`
  const availableWidth = Math.max(10, width - 16)
  let total = 0
  for (const paragraph of text.split('\n')) {
    if (paragraph === '') {
      total += 1
      continue
    }
    const words = paragraph.split(' ')
    let line = ''
    let lines = 0
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (line && ctx.measureText(candidate).width > availableWidth) {
        lines += 1
        line = word
      } else {
        line = candidate
      }
    }
    total += lines + 1
  }
  return Math.max(1, total)
}

export function computeTextBlockHeight(text: string, fontSize: number, width: number): number {
  const lines = countWrappedLines(text, fontSize, width)
  return Math.max(MIN_HEIGHT, Math.round(lines * fontSize * LINE_HEIGHT_RATIO + VERTICAL_PADDING))
}
