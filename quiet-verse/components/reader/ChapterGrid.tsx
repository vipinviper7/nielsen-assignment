import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ReaderTheme } from '@/constants/ReaderTheme';

type Scheme = 'light' | 'dark';

type Props = {
  colorScheme: Scheme;
  bookName: string;
  chapters: number[];
  onSelectChapter: (chapter: number) => void;
};

export function ChapterGrid({
  colorScheme,
  bookName,
  chapters,
  onSelectChapter,
}: Props) {
  const t = ReaderTheme[colorScheme];
  const { width } = useWindowDimensions();
  const pad = 20;
  const gap = 10;
  const cols = width >= 500 ? 6 : 5;
  const inner = width - pad * 2 - gap * (cols - 1);
  const cellSize = Math.max(48, Math.floor(inner / cols));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: pad, paddingBottom: 32 },
      ]}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.subtitle, { color: t.muted }]}>{bookName}</Text>
      <Text style={[styles.title, { color: t.text }]}>Chapters</Text>
      <View style={[styles.grid, { gap }]}>
        {chapters.map((ch) => (
          <Pressable
            key={ch}
            onPress={() => onSelectChapter(ch)}
            style={({ pressed }) => [
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Chapter ${ch}`}>
            <Text style={[styles.cellText, { color: t.text }]}>{ch}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  cellText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
