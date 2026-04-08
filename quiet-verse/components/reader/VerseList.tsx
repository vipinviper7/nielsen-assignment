import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReaderTheme } from '@/constants/ReaderTheme';
import { useReader } from '@/context/ReaderContext';

type Scheme = 'light' | 'dark';

type VerseLine = { verse: number; text: string };

type Props = {
  colorScheme: Scheme;
  book: string;
  chapter: number;
  verses: VerseLine[];
  loading: boolean;
};

export function VerseList({
  colorScheme,
  book,
  chapter,
  verses,
  loading,
}: Props) {
  const t = ReaderTheme[colorScheme];
  const insets = useSafeAreaInsets();
  const { fontMetrics, fontPreset, setFontPreset, toggleBookmark, isBookmarked } =
    useReader();

  const onLongPressVerse = (verse: number) => {
    const added = toggleBookmark({ book, chapter, verse });
    if (Platform.OS !== 'web') {
      if (added) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.fontToolbar,
          { borderBottomColor: t.border, backgroundColor: t.bg },
        ]}>
        <Text style={[styles.fontToolbarLabel, { color: t.muted }]}>
          Text size
        </Text>
        <View style={styles.fontButtons}>
          {(['sm', 'md', 'lg'] as const).map((p) => {
            const active = fontPreset === p;
            const sizes = { sm: 14, md: 17, lg: 20 };
            return (
              <Pressable
                key={p}
                onPress={() => setFontPreset(p)}
                style={[
                  styles.fontBtn,
                  {
                    borderColor: active ? t.accent : t.border,
                    backgroundColor: active ? `${t.accent}22` : 'transparent',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Font size ${p}`}
                accessibilityState={{ selected: active }}>
                <Text
                  style={[
                    styles.fontBtnText,
                    { color: t.text, fontSize: sizes[p] },
                  ]}>
                  A
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <Text style={[styles.loading, { color: t.muted }]}>
          Loading chapter…
        </Text>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 16,
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          <Text style={[styles.chapterHeading, { color: t.text }]}>
            {book} · {chapter}
          </Text>
          {verses.map((v) => {
            const marked = isBookmarked({
              book,
              chapter,
              verse: v.verse,
            });
            return (
              <Pressable
                key={v.verse}
                onLongPress={() => onLongPressVerse(v.verse)}
                delayLongPress={380}
                style={({ pressed }) => [
                  styles.verseBlock,
                  pressed && { opacity: 0.92 },
                ]}
                accessibilityRole="text"
                accessibilityHint="Long press to bookmark">
                <View style={styles.verseRow}>
                  <Text
                    style={[
                      styles.verseNum,
                      {
                        color: marked ? t.bookmark : t.muted,
                        fontSize: fontMetrics.verseNum,
                      },
                    ]}>
                    {v.verse}
                  </Text>
                  {marked ? (
                    <FontAwesome
                      name="bookmark"
                      size={14}
                      color={t.bookmark}
                      style={styles.bookmarkIcon}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.verseText,
                      {
                        color: t.text,
                        fontSize: fontMetrics.verse,
                        lineHeight: fontMetrics.lineHeight,
                      },
                    ]}>
                    {v.text}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fontToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fontToolbarLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fontButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fontBtn: {
    width: 44,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnText: {
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  chapterHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 18,
  },
  verseBlock: {
    marginBottom: 14,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNum: {
    width: 28,
    fontWeight: '600',
    marginRight: 6,
    paddingTop: 2,
  },
  bookmarkIcon: {
    marginRight: 6,
    marginTop: 4,
  },
  verseText: {
    flex: 1,
  },
  loading: {
    padding: 24,
    textAlign: 'center',
    fontSize: 16,
  },
});
