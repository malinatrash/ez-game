export type BuiltInThemeId = 'light' | 'dark' | 'neon' | 'tv' | 'minimal' | 'mintLight' | 'mintDark'

export interface ThemeColors {
  colorBg: string
  colorSurface: string
  colorSurfaceRaised: string
  colorBorder: string
  colorText: string
  colorTextMuted: string
  colorTextHeading: string
  colorAccent: string
  colorAccentBg: string
  colorAccentBorder: string
  colorSuccess: string
  colorDanger: string
  colorWarning: string
  shadowGlow: string
  colorScheme: 'dark' | 'light'
}

export interface CustomTheme {
  id: string
  name: string
  colors: ThemeColors
}

export const BUILT_IN_THEMES: { id: BuiltInThemeId; name: string }[] = [
  { id: 'dark', name: 'Тёмная' },
  { id: 'light', name: 'Светлая' },
  { id: 'neon', name: 'Неоновая' },
  { id: 'tv', name: 'Телевизионная' },
  { id: 'minimal', name: 'Минималистичная' },
  { id: 'mintLight', name: 'Мятная светлая' },
  { id: 'mintDark', name: 'Мятная тёмная' },
]

export interface ThemePreviewColors {
  bg: string
  surface: string
  accent: string
  text: string
}

export const BUILT_IN_THEME_PREVIEWS: Record<BuiltInThemeId, ThemePreviewColors> = {
  dark: { bg: '#0f1117', surface: '#1f2330', accent: '#a855f7', text: '#e8e8ec' },
  light: { bg: '#f5f6fb', surface: '#eef0f8', accent: '#7c3aed', text: '#1f2430' },
  neon: { bg: '#05060a', surface: '#131826', accent: '#ff2fd0', text: '#e6faff' },
  tv: { bg: '#0a1854', surface: '#142873', accent: '#ffd76a', text: '#eef1ff' },
  minimal: { bg: '#fafafa', surface: '#f2f2f2', accent: '#111111', text: '#222222' },
  mintLight: { bg: '#f2fbf8', surface: '#e7f7f1', accent: '#14b8a6', text: '#123832' },
  mintDark: { bg: '#071815', surface: '#123028', accent: '#2dd4bf', text: '#d7f5ec' },
}
