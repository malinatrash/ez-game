import { defineStore } from 'pinia'
import type { ScoreHistoryEntry } from '../types/session'
import { usePlayersStore } from './players'
import { createId } from '../services/id'

type RecordInput = Omit<ScoreHistoryEntry, 'id' | 'timestamp'>

export const useHistoryStore = defineStore('history', {
  state: () => ({
    entries: [] as ScoreHistoryEntry[],
    redoStack: [] as ScoreHistoryEntry[],
  }),
  actions: {
    reset() {
      this.entries = []
      this.redoStack = []
    },

    removePlayerEntries(playerId: string) {
      this.entries = this.entries.filter((entry) => entry.playerId !== playerId)
      this.redoStack = this.redoStack.filter((entry) => entry.playerId !== playerId)
    },

    record(entry: RecordInput) {
      const player = usePlayersStore().players.find((p) => p.id === entry.playerId)
      if (!player) return
      player.score += entry.delta
      if (entry.reason === 'correct') player.streak += 1
      else if (entry.reason === 'incorrect') player.streak = 0
      this.entries.push({ id: createId(), timestamp: Date.now(), ...entry })
      this.redoStack = []
    },

    undo() {
      const entry = this.entries.pop()
      if (!entry) return
      const player = usePlayersStore().players.find((p) => p.id === entry.playerId)
      if (player) {
        player.score -= entry.delta
        if (entry.reason === 'correct') player.streak = Math.max(0, player.streak - 1)
      }
      this.redoStack.push(entry)
    },

    redo() {
      const entry = this.redoStack.pop()
      if (!entry) return
      const player = usePlayersStore().players.find((p) => p.id === entry.playerId)
      if (player) {
        player.score += entry.delta
        if (entry.reason === 'correct') player.streak += 1
        else if (entry.reason === 'incorrect') player.streak = 0
      }
      this.entries.push(entry)
    },
  },
})
