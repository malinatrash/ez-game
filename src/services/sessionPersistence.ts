import type { Player } from '../types/player'
import type { ScoreHistoryEntry, TurnState } from '../types/session'
import { usePlayersStore } from '../stores/players'
import { useSessionStore } from '../stores/session'
import { useHistoryStore } from '../stores/history'
import { idb } from './idb'

interface PersistedPlaySession {
  players: Player[]
  answeredQuestionIds: string[]
  turn: TurnState
  isOver: boolean
  historyEntries: ScoreHistoryEntry[]
  historyRedoStack: ScoreHistoryEntry[]
}

const settingKey = (gameId: string) => `playSession:${gameId}`

export function savePlaySession(gameId: string) {
  const playersStore = usePlayersStore()
  const sessionStore = useSessionStore()
  const historyStore = useHistoryStore()
  const snapshot: PersistedPlaySession = {
    players: playersStore.players,
    answeredQuestionIds: sessionStore.answeredQuestionIds,
    turn: sessionStore.turn,
    isOver: sessionStore.isOver,
    historyEntries: historyStore.entries,
    historyRedoStack: historyStore.redoStack,
  }
  void idb.setSetting(settingKey(gameId), snapshot)
}

// Restores an in-progress game (players/score/answered questions) after a page reload.
// Returns false when no session was ever started for this gameId (fresh visit).
export async function restorePlaySessionIfNeeded(gameId: string): Promise<boolean> {
  const sessionStore = useSessionStore()
  if (sessionStore.gameId === gameId) return true

  const data = await idb.getSetting<PersistedPlaySession>(settingKey(gameId))
  if (!data) return false

  const playersStore = usePlayersStore()
  const historyStore = useHistoryStore()

  playersStore.players = data.players
  playersStore.setupGameId = gameId
  sessionStore.gameId = gameId
  sessionStore.answeredQuestionIds = data.answeredQuestionIds
  sessionStore.turn = data.turn
  sessionStore.isOver = data.isOver
  historyStore.entries = data.historyEntries
  historyStore.redoStack = data.historyRedoStack
  return true
}
