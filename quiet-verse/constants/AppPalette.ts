/** Canonical Quiet Verse appearance tokens */
export const AppPalette = {
  light: {
    bg: '#FAF7F0',
    text: '#2C2416',
    accent: '#B89A3E',
    muted: 'rgba(60,50,30,0.50)',
    border: 'rgba(140,120,80,0.16)',
    surface: '#F5F0E6',
    sidebarBg: '#EFE9DD',
    overlay: 'rgba(30,25,15,0.35)',
    bookmark: '#B89A3E',
    error: '#8b4a44',
    errorTint: '#f0b0a8',
  },
  dark: {
    bg: '#0D1B2A',
    text: '#F5EDD8',
    accent: '#C9A84C',
    muted: 'rgba(245,237,216,0.52)',
    border: 'rgba(245,237,216,0.12)',
    surface: '#152536',
    sidebarBg: '#152536',
    overlay: 'rgba(0,0,0,0.5)',
    bookmark: '#C9A84C',
    error: '#e8a598',
    errorTint: '#f0b0a8',
  },
} as const;

export type ThemeScheme = keyof typeof AppPalette;
export type ThemeColors = (typeof AppPalette)[ThemeScheme];

/** React Navigation–oriented tab/header colors */
export const NavThemeFromPalette = {
  light: {
    text: AppPalette.light.text,
    background: AppPalette.light.bg,
    tint: AppPalette.light.accent,
    border: AppPalette.light.border,
    tabIconDefault: 'rgba(60,50,30,0.35)',
    tabIconSelected: AppPalette.light.accent,
  },
  dark: {
    text: AppPalette.dark.text,
    background: AppPalette.dark.bg,
    tint: AppPalette.dark.accent,
    border: AppPalette.dark.border,
    tabIconDefault: 'rgba(245,237,216,0.35)',
    tabIconSelected: AppPalette.dark.accent,
  },
} as const;
