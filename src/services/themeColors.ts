import type { ThemeColors } from '../types/theme'

export const THEME_COLOR_VARS: Record<keyof ThemeColors, string> = {
  colorBg: '--color-bg',
  colorSurface: '--color-surface',
  colorSurfaceRaised: '--color-surface-raised',
  colorBorder: '--color-border',
  colorText: '--color-text',
  colorTextMuted: '--color-text-muted',
  colorTextHeading: '--color-text-heading',
  colorAccent: '--color-accent',
  colorAccentBg: '--color-accent-bg',
  colorAccentBorder: '--color-accent-border',
  colorSuccess: '--color-success',
  colorDanger: '--color-danger',
  colorWarning: '--color-warning',
  shadowGlow: '--shadow-glow',
  colorScheme: '--color-scheme',
}

export function readCurrentThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement)
  const entries = Object.entries(THEME_COLOR_VARS).map(([key, cssVar]) => [
    key,
    style.getPropertyValue(cssVar).trim(),
  ])
  return Object.fromEntries(entries) as unknown as ThemeColors
}

export function applyInlineThemeColors(colors: ThemeColors) {
  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(THEME_COLOR_VARS)) {
    root.style.setProperty(cssVar, colors[key as keyof ThemeColors])
  }
}

export function clearInlineThemeColors() {
  const root = document.documentElement
  for (const cssVar of Object.values(THEME_COLOR_VARS)) {
    root.style.removeProperty(cssVar)
  }
}
