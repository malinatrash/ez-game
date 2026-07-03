import { get, set, del, keys, getMany, type UseStore } from 'idb-keyval'
import type { Game } from '../types/game'

const DB_NAME = 'svo-game-db'
const DB_VERSION = 2
const STORE_NAMES = ['games', 'assets', 'settings'] as const

let dbPromise: Promise<IDBDatabase> | undefined

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

function createStore(storeName: (typeof STORE_NAMES)[number]): UseStore {
  return (txMode, callback) => openDb().then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)))
}

const gamesStore = createStore('games')
const assetsStore = createStore('assets')
const settingsStore = createStore('settings')

// Pinia state is a reactive Proxy — IndexedDB's structured clone can't clone it directly
// (DataCloneError), so every write must go through a plain-data snapshot first.
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export const idb = {
  getGame: (id: string) => get<Game>(id, gamesStore),
  setGame: (game: Game) => set(game.id, toPlain(game), gamesStore),
  deleteGame: (id: string) => del(id, gamesStore),
  async getAllGames(): Promise<Game[]> {
    const ids = await keys(gamesStore)
    const games = await getMany<Game>(ids, gamesStore)
    return games.filter((game): game is Game => !!game)
  },

  getAsset: (id: string) => get<Blob>(id, assetsStore),
  setAsset: (id: string, blob: Blob) => set(id, blob, assetsStore),
  deleteAsset: (id: string) => del(id, assetsStore),

  getSetting: <T>(key: string) => get<T>(key, settingsStore),
  setSetting: (key: string, value: unknown) => set(key, toPlain(value), settingsStore),
}
