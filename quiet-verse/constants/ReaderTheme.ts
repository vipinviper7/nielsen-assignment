import { AppPalette } from '@/constants/AppPalette';

/** Reader / Bible UI — aligned with AppPalette */
export const ReaderTheme = {
  light: {
    bg: AppPalette.light.bg,
    sidebarBg: AppPalette.light.sidebarBg,
    surface: AppPalette.light.surface,
    text: AppPalette.light.text,
    muted: AppPalette.light.muted,
    accent: AppPalette.light.accent,
    border: AppPalette.light.border,
    overlay: AppPalette.light.overlay,
    bookmark: AppPalette.light.bookmark,
  },
  dark: {
    bg: AppPalette.dark.bg,
    sidebarBg: AppPalette.dark.sidebarBg,
    surface: AppPalette.dark.surface,
    text: AppPalette.dark.text,
    muted: AppPalette.dark.muted,
    accent: AppPalette.dark.accent,
    border: AppPalette.dark.border,
    overlay: AppPalette.dark.overlay,
    bookmark: AppPalette.dark.bookmark,
  },
} as const;

export const FONT_PRESETS = {
  sm: { verse: 17, verseNum: 13, lineHeight: 26 },
  md: { verse: 20, verseNum: 14, lineHeight: 30 },
  lg: { verse: 24, verseNum: 16, lineHeight: 36 },
} as const;

export type FontPreset = keyof typeof FONT_PRESETS;
