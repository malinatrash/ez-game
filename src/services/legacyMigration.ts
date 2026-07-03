import type { CanvasElement, Game } from '../types/game'
import { createId } from './id'

const LEGACY_TEXT_STYLE = { fontSize: 24, color: '#f5f5f5', align: 'center' as const }
const LEGACY_TEXT_BOX = { x: 40, y: 24, w: 560, h: 80 }
const LEGACY_IMAGE_BOX = { x: 40, y: 120, w: 560, h: 260 }

function isV2Element(el: unknown): el is CanvasElement {
  return typeof el === 'object' && el !== null && 'x' in el
}

export function ensureV2Elements(rawElements: unknown[] | undefined): CanvasElement[] {
  const elements = rawElements ?? []
  if (elements.every(isV2Element)) return elements as CanvasElement[]

  const migrated: CanvasElement[] = []
  const textEl = elements.find((el: any) => el?.type === 'text')
  if (textEl && (textEl as any).value) {
    migrated.push({
      id: (textEl as any).id ?? createId(),
      type: 'text',
      value: (textEl as any).value,
      style: LEGACY_TEXT_STYLE,
      ...LEGACY_TEXT_BOX,
      rotation: 0,
      zIndex: 0,
    })
  }
  const imageEl = elements.find((el: any) => el?.type === 'image')
  if (imageEl && (imageEl as any).assetId) {
    migrated.push({
      id: (imageEl as any).id ?? createId(),
      type: 'image',
      assetId: (imageEl as any).assetId,
      ...LEGACY_IMAGE_BOX,
      rotation: 0,
      zIndex: 1,
    })
  }
  return migrated
}

export function migrateGameToV2(game: Game): Game {
  return {
    ...game,
    categories: game.categories.map((category) => ({
      ...category,
      questions: category.questions.map((question) => ({
        ...question,
        content: ensureV2Elements(question.content as unknown[]),
        answer: ensureV2Elements(question.answer as unknown[]),
      })),
    })),
  }
}
