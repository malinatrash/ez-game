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
