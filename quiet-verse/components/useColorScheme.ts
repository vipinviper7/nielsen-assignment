import { useAppTheme } from '@/context/AppThemeContext';

/** Resolved appearance (system + manual override). */
export function useColorScheme(): 'light' | 'dark' {
  return useAppTheme().resolvedScheme;
}
