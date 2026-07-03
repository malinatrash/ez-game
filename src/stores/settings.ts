import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    autosaveEnabled: true,
    autosaveIntervalMs: 800,
  }),
})
