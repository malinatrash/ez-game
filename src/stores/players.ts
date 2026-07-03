import { defineStore } from 'pinia'
import type { Player } from '../types/player'
import { createId } from '../services/id'

const DEFAULT_COLORS = [
  '#f87171', // red
  '#fb923c', // orange-light
  '#facc15', // yellow
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#818cf8', // indigo
  '#94a3b8', // slate
  '#000000', // black
]

export const usePlayersStore = defineStore('players', {
  state: () => ({
    players: [] as Player[],
    setupGameId: null as string | null,
  }),
  actions: {
    reset() {
      this.players = []
    },

    ensureForGame(gameId: string) {
      if (this.setupGameId !== gameId) {
        this.setupGameId = gameId
        this.reset()
      }
    },

    addPlayer(name: string) {
      const used = new Set(this.players.map((p) => p.color))
      const available = DEFAULT_COLORS.filter((c) => !used.has(c))
      const pool = available.length ? available : DEFAULT_COLORS
      const color = pool[Math.floor(Math.random() * pool.length)]
      this.players.push({ id: createId(), name, color, score: 0, streak: 0 })
    },

    removePlayer(id: string) {
      this.players = this.players.filter((player) => player.id !== id)
    },

    movePlayer(id: string, direction: -1 | 1) {
      const index = this.players.findIndex((player) => player.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= this.players.length) return
        ;[this.players[index], this.players[target]] = [this.players[target], this.players[index]]
    },
  },
})
