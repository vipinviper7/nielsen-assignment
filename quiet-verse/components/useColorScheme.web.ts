import { useAppTheme } from '@/context/AppThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  return useAppTheme().resolvedScheme;
}
