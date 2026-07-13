import { defineStore } from 'pinia'
import { idb } from '../services/idb'

// Module-level singleton Audio() — same rationale as backgroundMusic/resultsMusic:
// PlayQuestionPage keeps a single component instance while the host flips
// between the 'content' and 'answer' side (just a local ref, no remount/route
// change), so as long as play() is only called once per question, the track
// keeps running across both sides without restarting.
const audio = new Audio()
audio.loop = true
let objectUrl: string | null = null
let currentQuestionId: string | null = null

export const useQuestionMusicStore = defineStore('questionMusic', {
  state: () => ({
    playing: false,
  }),
  actions: {
    async play(questionId: string, assetId: string | undefined) {
      if (questionId === currentQuestionId) return
      this.stop()
      currentQuestionId = questionId
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
      currentQuestionId = null
      this.playing = false
    },
  },
})
