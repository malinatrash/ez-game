import type { Game } from '../types/game'

export function collectAssetIds(game: Game): string[] {
  const ids = new Set<string>()
  if (game.meta.wallpaperAssetId) ids.add(game.meta.wallpaperAssetId)
  if (game.meta.backgroundMusicAssetId) ids.add(game.meta.backgroundMusicAssetId)
  if (game.meta.resultsMusicAssetId) ids.add(game.meta.resultsMusicAssetId)
  for (const category of game.categories) {
    for (const question of category.questions) {
      for (const el of [...question.content, ...question.answer]) {
        if (el.type === 'image' || el.type === 'video' || el.type === 'audio') ids.add(el.assetId)
      }
    }
  }
  return [...ids]
}
