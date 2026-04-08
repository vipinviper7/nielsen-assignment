import { useTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/AppThemeContext';
import type { ThemePreference } from '@/lib/readerStorage';

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Match device light or dark mode' },
  { value: 'light', label: 'Light', hint: 'Cream background, navy text' },
  { value: 'dark', label: 'Dark', hint: 'Deep navy background, warm white text' },
];

export default function ModalScreen() {
  const nav = useTheme();
  const { preference, setPreference, resolvedScheme, colors } = useAppTheme();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: nav.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: nav.colors.text }]}>Appearance</Text>
      <Text style={[styles.sub, { color: nav.colors.text }]}>
        Theme crossfades smoothly when you change this setting. Gold accent (
        #C9A84C) stays the same in light and dark.
      </Text>
      <Text style={[styles.now, { color: nav.colors.text }]}>
        Active now:{' '}
        <Text style={[styles.nowStrong, { color: colors.accent }]}>
          {resolvedScheme === 'dark' ? 'Dark' : 'Light'}
        </Text>
        {preference === 'system' ? ' (from system)' : ''}
      </Text>

      <View style={styles.group}>
        {OPTIONS.map((opt) => {
          const selected = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setPreference(opt.value)}
              style={({ pressed }) => [
                styles.option,
                { borderColor: nav.colors.border },
                selected && [
                  styles.optionSelected,
                  {
                    borderColor: colors.accent,
                    backgroundColor: `${colors.accent}1F`,
                  },
                ],
                pressed && styles.optionPressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}>
              <View style={styles.optionRow}>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: nav.colors.border },
                    selected && [
                      styles.radioOuterSelected,
                      { borderColor: colors.accent },
                    ],
                  ]}>
                  {selected ? (
                    <View
                      style={[styles.radioInner, { backgroundColor: colors.accent }]}
                    />
                  ) : null}
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, { color: nav.colors.text }]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.optionHint, { color: nav.colors.text }]}>
                    {opt.hint}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 12,
  },
  now: {
    fontSize: 14,
    marginBottom: 22,
    opacity: 0.85,
  },
  nowStrong: {
    fontWeight: '700',
  },
  group: {
    gap: 12,
  },
  option: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionSelected: {},
  optionPressed: {
    opacity: 0.92,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 14,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {},
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionHint: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.72,
  },
});
