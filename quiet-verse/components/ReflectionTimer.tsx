import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppPalette } from '@/constants/AppPalette';
import { useAppTheme, useThemeProgress } from '@/context/AppThemeContext';

const PHASE_MS = 4000;

const STRIP_LIGHT = '#EDE7D8';
const STRIP_DARK = '#121d2e';

// Petal colors — soft, overlapping
const PETAL_COLORS_LIGHT = [
  'rgba(201,168,76,0.08)',
  'rgba(180,150,100,0.07)',
  'rgba(160,140,180,0.06)',
  'rgba(140,170,150,0.06)',
  'rgba(200,160,90,0.07)',
  'rgba(170,155,130,0.05)',
];
const PETAL_COLORS_DARK = [
  'rgba(201,168,76,0.12)',
  'rgba(160,140,100,0.10)',
  'rgba(120,110,180,0.08)',
  'rgba(100,150,130,0.07)',
  'rgba(180,140,70,0.09)',
  'rgba(140,130,110,0.06)',
];

const PETAL_COUNT = 6;
const PETAL_SIZE = 200;
// How far petals spread from center
const SPREAD_MIN = 5;
const SPREAD_MAX = 50;

type DurationOption = 2 | 5 | 10;
type BreathPhase = 'inhale' | 'hold' | 'exhale';

function gentleHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Single animated petal circle */
function Petal({
  index,
  breath,
  themeProgress,
}: {
  index: number;
  breath: Animated.SharedValue<number>;
  themeProgress: Animated.SharedValue<number>;
}) {
  const angle = (index / PETAL_COUNT) * Math.PI * 2;

  const style = useAnimatedStyle(() => {
    const spread = SPREAD_MIN + (SPREAD_MAX - SPREAD_MIN) * breath.value;
    const tx = Math.cos(angle) * spread;
    const ty = Math.sin(angle) * spread;
    const s = 0.7 + breath.value * 0.5;
    const lightColor = PETAL_COLORS_LIGHT[index % PETAL_COLORS_LIGHT.length];
    const darkColor = PETAL_COLORS_DARK[index % PETAL_COLORS_DARK.length];

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: s },
      ],
      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [lightColor, darkColor],
      ),
      opacity: 0.4 + breath.value * 0.6,
    };
  });

  return <Animated.View style={[styles.petal, style]} />;
}

/** Center glow that pulses with breath */
function CenterGlow({
  breath,
  themeProgress,
}: {
  breath: Animated.SharedValue<number>;
  themeProgress: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const s = 0.5 + breath.value * 0.6;
    return {
      transform: [{ scale: s }],
      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        ['rgba(201,168,76,0.06)', 'rgba(201,168,76,0.10)'],
      ),
      opacity: 0.3 + breath.value * 0.7,
    };
  });

  return <Animated.View style={[styles.centerGlow, style]} />;
}

export function ReflectionTimer() {
  const { colors } = useAppTheme();
  const progress = useThemeProgress();
  const insets = useSafeAreaInsets();

  const [minutes, setMinutes] = useState<DurationOption | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [remainingSec, setRemainingSec] = useState(0);

  // 0 = contracted (exhale), 1 = expanded (inhale)
  const breath = useSharedValue(0);
  const endTimeRef = useRef(0);
  const sessionActiveRef = useRef(false);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  const stopSession = useCallback(() => {
    cancelAnimation(breath);
    breath.value = 0;
    setSessionActive(false);
    setPhase('inhale');
  }, []);

  const advancePhase = useCallback(() => {
    if (!sessionActiveRef.current) return;
    if (Date.now() >= endTimeRef.current) {
      stopSession();
      return;
    }
    setPhase((p) => {
      if (p === 'inhale') return 'hold';
      if (p === 'hold') return 'exhale';
      return 'inhale';
    });
  }, [stopSession]);

  useEffect(() => {
    if (!sessionActive) return;
    const id = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000),
      );
      setRemainingSec(left);
      if (Date.now() >= endTimeRef.current) {
        stopSession();
      }
    }, 250);
    return () => clearInterval(id);
  }, [sessionActive, stopSession]);

  useEffect(() => {
    if (!sessionActive) return;

    gentleHaptic();

    const ease = Easing.inOut(Easing.sin);

    if (phase === 'inhale') {
      cancelAnimation(breath);
      breath.value = withTiming(
        1,
        { duration: PHASE_MS, easing: ease },
        (finished) => {
          if (finished) runOnJS(advancePhase)();
        },
      );
      return () => cancelAnimation(breath);
    }

    if (phase === 'hold') {
      const timeout = setTimeout(() => advancePhase(), PHASE_MS);
      return () => clearTimeout(timeout);
    }

    if (phase === 'exhale') {
      cancelAnimation(breath);
      breath.value = withTiming(
        0,
        { duration: PHASE_MS, easing: ease },
        (finished) => {
          if (finished) runOnJS(advancePhase)();
        },
      );
      return () => cancelAnimation(breath);
    }
  }, [phase, sessionActive, breath, advancePhase]);

  // -- Styles --

  const compactStripStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [STRIP_LIGHT, STRIP_DARK],
    ),
    borderTopColor: interpolateColor(
      progress.value,
      [0, 1],
      [AppPalette.light.border, AppPalette.dark.border],
    ),
  }));

  const modalBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [AppPalette.light.bg, AppPalette.dark.bg],
    ),
  }));

  const timerTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [AppPalette.light.muted, AppPalette.dark.muted],
    ),
  }));

  const phaseTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [AppPalette.light.text, AppPalette.dark.text],
    ),
  }));

  const endLinkStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [AppPalette.light.muted, AppPalette.dark.muted],
    ),
  }));

  const startSession = () => {
    if (minutes == null) return;
    endTimeRef.current = Date.now() + minutes * 60 * 1000;
    setRemainingSec(minutes * 60);
    breath.value = 0;
    setPhase('inhale');
    setSessionActive(true);
  };

  const phaseLabel =
    phase === 'inhale' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Breathe out';

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const durations: DurationOption[] = [2, 5, 10];

  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => i);

  return (
    <>
      <Animated.View
        style={[
          styles.compact,
          compactStripStyle,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}>
        <Text style={[styles.compactTitle, { color: colors.muted }]}>
          Reflection
        </Text>
        <View style={styles.chips}>
          {durations.map((m) => {
            const selected = minutes === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMinutes(m)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? `${colors.accent}28` : 'transparent',
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${m} minutes`}>
                <Text
                  style={[
                    styles.chipText,
                    { color: selected ? colors.text : colors.muted },
                  ]}>
                  {m} min
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={startSession}
          disabled={minutes == null}
          style={({ pressed }) => [
            styles.startBtn,
            {
              backgroundColor: minutes == null ? colors.border : colors.accent,
              opacity: pressed ? 0.88 : minutes == null ? 0.45 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Begin reflection"
          accessibilityState={{ disabled: minutes == null }}>
          <Text style={[styles.startBtnText, { color: '#1A1A2E' }]}>
            Begin
          </Text>
        </Pressable>
      </Animated.View>

      <Modal
        visible={sessionActive}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={stopSession}>
        <Animated.View style={[styles.modalRoot, modalBgStyle]}>
          {/* Timer */}
          <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24 }}>
            <Animated.Text style={[styles.timerText, timerTextStyle]}>
              {formatTime(remainingSec)}
            </Animated.Text>
          </View>

          {/* Breathing animation */}
          <View style={styles.breathArea}>
            <View style={styles.petalContainer}>
              <CenterGlow breath={breath} themeProgress={progress} />
              {petals.map((i) => (
                <Petal
                  key={i}
                  index={i}
                  breath={breath}
                  themeProgress={progress}
                />
              ))}
            </View>
            <Animated.Text style={[styles.phaseText, phaseTextStyle]}>
              {phaseLabel}
            </Animated.Text>
          </View>

          {/* End button */}
          <View
            style={[
              styles.modalFooter,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
            <Pressable
              onPress={stopSession}
              hitSlop={16}
              accessibilityRole="button"
              accessibilityLabel="End reflection">
              <Animated.Text style={[styles.endLink, endLinkStyle]}>
                End
              </Animated.Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  compact: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 14,
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  startBtn: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 999,
    minWidth: 160,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalRoot: {
    flex: 1,
  },
  timerText: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  breathArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: PETAL_SIZE,
    height: PETAL_SIZE,
    borderRadius: PETAL_SIZE / 2,
  },
  centerGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  phaseText: {
    marginTop: 48,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  modalFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  endLink: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});
