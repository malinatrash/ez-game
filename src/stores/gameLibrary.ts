import { defineStore } from 'pinia'
import type { Game, GameMeta } from '../types/game'
import { idb } from '../services/idb'
import { createId } from '../services/id'
import { exportGameToSog } from '../services/sogExport'
import { importSogFile } from '../services/sogImport'

export interface LibraryEntry {
  id: string
  meta: GameMeta
}

export const useGameLibraryStore = defineStore('gameLibrary', {
  state: () => ({
    entries: [] as LibraryEntry[],
    loaded: false,
  }),
  actions: {
    async loadEntries() {
      const games = await idb.getAllGames()
      this.entries = games
        .map((game) => ({ id: game.id, meta: game.meta }))
        .sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt))
      this.loaded = true
    },

    async createGame(title: string): Promise<string> {
      const now = new Date().toISOString()
      const game: Game = {
        id: createId(),
        meta: { title, createdAt: now, updatedAt: now },
        categories: [],
      }
      await idb.setGame(game)
      this.entries.unshift({ id: game.id, meta: game.meta })
      return game.id
    },

    async deleteGame(id: string) {
      await idb.deleteGame(id)
      this.entries = this.entries.filter((entry) => entry.id !== id)
    },

    async exportGame(id: string) {
      await exportGameToSog(id)
    },

    async importGame(file: File): Promise<string> {
      const id = await importSogFile(file)
      const game = await idb.getGame(id)
      if (game) {
        this.entries = this.entries.filter((entry) => entry.id !== id)
        this.entries.unshift({ id: game.id, meta: game.meta })
      }
      return id
    },
  },
})
