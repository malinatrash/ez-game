import { defineStore } from 'pinia'
import type { BuiltInThemeId, CustomTheme, ThemeColors } from '../types/theme'
import { BUILT_IN_THEMES } from '../types/theme'
import { idb } from '../services/idb'
import { createId } from '../services/id'
import { applyInlineThemeColors, clearInlineThemeColors } from '../services/themeColors'

interface ThemeSettings {
  activeThemeId: string
  customThemes: CustomTheme[]
}

const DEFAULT_THEME_ID: BuiltInThemeId = 'dark'
const SETTINGS_KEY = 'theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    activeThemeId: DEFAULT_THEME_ID as string,
    customThemes: [] as CustomTheme[],
  }),
  getters: {
    builtInThemes: () => BUILT_IN_THEMES,
    activeCustomTheme(state): CustomTheme | undefined {
      return state.customThemes.find((t) => t.id === state.activeThemeId)
    },
  },
  actions: {
    async load() {
      const saved = await idb.getSetting<ThemeSettings>(SETTINGS_KEY)
      if (saved) {
        this.activeThemeId = saved.activeThemeId
        this.customThemes = saved.customThemes
      }
      this.applyTheme()
    },

    async persist() {
      await idb.setSetting(SETTINGS_KEY, {
        activeThemeId: this.activeThemeId,
        customThemes: this.customThemes,
      } satisfies ThemeSettings)
    },

    applyTheme() {
      const custom = this.activeCustomTheme
      if (custom) {
        document.documentElement.dataset.theme = custom.colors.colorScheme === 'light' ? 'light' : 'dark'
        applyInlineThemeColors(custom.colors)
      } else {
        clearInlineThemeColors()
        document.documentElement.dataset.theme = this.activeThemeId
      }
    },

    setActiveTheme(id: string) {
      this.activeThemeId = id
      this.applyTheme()
      this.persist()
    },

    createCustomTheme(name: string, colors: ThemeColors) {
      const theme: CustomTheme = { id: createId(), name, colors }
      this.customThemes.push(theme)
      this.setActiveTheme(theme.id)
      return theme.id
    },

    updateCustomTheme(id: string, patch: Partial<Pick<CustomTheme, 'name' | 'colors'>>) {
      const theme = this.customThemes.find((t) => t.id === id)
      if (!theme) return
      Object.assign(theme, patch)
      if (this.activeThemeId === id) this.applyTheme()
      this.persist()
    },

    deleteCustomTheme(id: string) {
      this.customThemes = this.customThemes.filter((t) => t.id !== id)
      if (this.activeThemeId === id) this.setActiveTheme(DEFAULT_THEME_ID)
      else this.persist()
    },
  },
})
