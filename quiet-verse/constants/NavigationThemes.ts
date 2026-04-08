import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from '@react-navigation/native';

import { AppPalette } from '@/constants/AppPalette';

export const QuietNavigationLight: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppPalette.light.accent,
    background: AppPalette.light.bg,
    card: AppPalette.light.surface,
    text: AppPalette.light.text,
    border: AppPalette.light.border,
    notification: AppPalette.light.accent,
  },
};

export const QuietNavigationDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: AppPalette.dark.accent,
    background: AppPalette.dark.bg,
    card: AppPalette.dark.surface,
    text: AppPalette.dark.text,
    border: AppPalette.dark.border,
    notification: AppPalette.dark.accent,
  },
};
