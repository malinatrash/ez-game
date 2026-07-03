import { defineStore } from 'pinia'
import { idb } from '../services/idb'

// Separate singleton Audio() (not a Vue-managed <audio>) — same rationale as
// useBackgroundMusicStore: it must survive independently of component lifecycle
// and be stoppable from anywhere (e.g. before the results screen mounts).
const audio = new Audio()
let objectUrl: string | null = null

export const useResultsMusicStore = defineStore('resultsMusic', {
  state: () => ({
    playing: false,
  }),
  actions: {
    async play(assetId: string | undefined) {
      this.stop()
      if (!assetId) return

      const blob = await idb.getAsset(assetId)
      if (!blob) return

      objectUrl = URL.createObjectURL(blob)
      audio.src = objectUrl
      try {
        await audio.play()
        this.playing = true
      } catch {
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
      this.playing = false
    },
  },
})
