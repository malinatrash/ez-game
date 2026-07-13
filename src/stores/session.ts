import { defineStore } from 'pinia'
import type { TurnState } from '../types/session'

export const useSessionStore = defineStore('session', {
  state: () => ({
    gameId: null as string | null,
    answeredQuestionIds: [] as string[],
    turn: { activePlayerId: null, currentQuestionId: null } as TurnState,
    isOver: false,
  }),
  actions: {
    start(gameId: string, firstPlayerId: string | null) {
      this.gameId = gameId
      this.answeredQuestionIds = []
      this.turn = { activePlayerId: firstPlayerId, currentQuestionId: null }
      this.isOver = false
    },

    openQuestion(questionId: string) {
      this.turn.currentQuestionId = questionId
    },

    setActivePlayer(playerId: string) {
      this.turn.activePlayerId = playerId
    },

    removePlayer(playerId: string, playerOrder: string[]) {
      if (this.turn.activePlayerId !== playerId) return

      const removedIndex = playerOrder.indexOf(playerId)
      if (removedIndex < 0) return
      const remainingOrder = playerOrder.filter((id) => id !== playerId)
      this.turn.activePlayerId = remainingOrder.length > 0 ? remainingOrder[removedIndex % remainingOrder.length] : null
    },

    resolveQuestion(questionId: string, winnerId: string | null, playerOrder: string[]) {
      if (!this.answeredQuestionIds.includes(questionId)) {
        this.answeredQuestionIds.push(questionId)
      }
      this.turn.currentQuestionId = null

      if (winnerId) {
        this.turn.activePlayerId = winnerId
      } else if (playerOrder.length > 0) {
        const currentIndex = playerOrder.indexOf(this.turn.activePlayerId ?? '')
        this.turn.activePlayerId = playerOrder[(currentIndex + 1) % playerOrder.length]
      }
    },

    endGame() {
      this.isOver = true
    },
  },
})
