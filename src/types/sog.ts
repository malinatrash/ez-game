import type { Game } from './game'

export interface AssetIndexEntry {
  id: string
  filename: string
  mimeType: string
}

export interface SogManifest {
  formatVersion: number
  game: Game
  assets: AssetIndexEntry[]
}

export const SOG_FORMAT_VERSION = 2
