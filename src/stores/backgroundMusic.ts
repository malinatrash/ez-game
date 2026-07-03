import { defineStore } from 'pinia'
import { idb } from '../services/idb'

const VOLUME_SETTING_KEY = 'backgroundMusicVolume'

const audio = new Audio()
audio.loop = true
let objectUrl: string | null = null

export const useBackgroundMusicStore = defineStore('backgroundMusic', {
  state: () => ({
    gameId: null as string | null,
    hasTrack: false,
    playing: false,
    volume: 1,
  }),
  actions: {
    async loadVolume() {
      const saved = await idb.getSetting<number>(VOLUME_SETTING_KEY)
      this.setVolume(saved ?? 1)
    },

    setVolume(volume: number) {
      this.volume = volume
      audio.volume = volume
      idb.setSetting(VOLUME_SETTING_KEY, volume)
    },

    async syncForGame(gameId: string | null) {
      if (gameId === this.gameId) return
      this.gameId = gameId
      this.stop()
      if (!gameId) return

      const game = await idb.getGame(gameId)
      const assetId = game?.meta.backgroundMusicAssetId
      if (!assetId) return

      const blob = await idb.getAsset(assetId)
      if (!blob) return

      objectUrl = URL.createObjectURL(blob)
      audio.src = objectUrl
      audio.volume = this.volume
      this.hasTrack = true
      try {
        await audio.play()
        this.playing = true
      } catch {
        this.playing = false
      }
    },

    async toggle() {
      if (!this.hasTrack) return
      if (audio.paused) {
        try {
          await audio.play()
          this.playing = true
        } catch {
          this.playing = false
        }
      } else {
        audio.pause()
        this.playing = false
      }
    },

    stop() {
      audio.pause()
      audio.removeAttribute('src')
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
      this.hasTrack = false
      this.playing = false
    },
  },
})
