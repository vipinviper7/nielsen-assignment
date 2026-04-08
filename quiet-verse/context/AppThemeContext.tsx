import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AppPalette, type ThemeColors } from '@/constants/AppPalette';
import {
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '@/lib/readerStorage';

const TRANSITION_MS = 420;

type AppThemeValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  resolvedScheme: 'light' | 'dark';
  colors: ThemeColors;
};

const AppThemeContext = createContext<AppThemeValue | null>(null);
const ThemeProgressContext = createContext<SharedValue<number> | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    loadThemePreference(),
  );

  const resolvedScheme: 'light' | 'dark' =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    saveThemePreference(p);
  }, []);

  const colors = AppPalette[resolvedScheme];

  const ctx = useMemo(
    () => ({
      preference,
      setPreference,
      resolvedScheme,
      colors,
    }),
    [preference, setPreference, resolvedScheme, colors],
  );

  const progress = useSharedValue(resolvedScheme === 'dark' ? 1 : 0);
  const didMount = useRef(false);

  useEffect(() => {
    const target = resolvedScheme === 'dark' ? 1 : 0;
    if (!didMount.current) {
      didMount.current = true;
      progress.value = target;
      return;
    }
    progress.value = withTiming(target, {
      duration: TRANSITION_MS,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [resolvedScheme]);

  const rootBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [AppPalette.light.bg, AppPalette.dark.bg],
    ),
  }));

  return (
    <ThemeProgressContext.Provider value={progress}>
      <AppThemeContext.Provider value={ctx}>
        <Animated.View style={[{ flex: 1 }, rootBgStyle]}>{children}</Animated.View>
      </AppThemeContext.Provider>
    </ThemeProgressContext.Provider>
  );
}

export function useAppTheme() {
  const v = useContext(AppThemeContext);
  if (!v) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return v;
}

/** 0 = light, 1 = dark — for crossfades / interpolated text */
export function useThemeProgress() {
  const p = useContext(ThemeProgressContext);
  if (!p) {
    throw new Error('useThemeProgress must be used within AppThemeProvider');
  }
  return p;
}
