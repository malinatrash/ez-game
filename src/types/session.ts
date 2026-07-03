import type { Player } from './player'

export interface ScoreHistoryEntry {
  id: string
  playerId: string
  questionId: string
  delta: number
  reason: 'correct' | 'incorrect' | 'manual'
  timestamp: number
}

export interface TurnState {
  activePlayerId: string | null
  currentQuestionId: string | null
}

export interface GameSession {
  gameId: string
  players: Player[]
  answeredQuestionIds: string[]
  turn: TurnState
  history: ScoreHistoryEntry[]
  redoStack: ScoreHistoryEntry[]
  isOver: boolean
}
