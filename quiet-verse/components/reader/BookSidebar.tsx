import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReaderTheme } from '@/constants/ReaderTheme';
import { getTestamentSections } from '@/lib/bibleCanon';

type Scheme = 'light' | 'dark';

type Props = {
  colorScheme: Scheme;
  selectedBook: string | null;
  onSelectBook: (book: string) => void;
  onClose?: () => void;
};

export function BookSidebar({
  colorScheme,
  selectedBook,
  onSelectBook,
  onClose,
}: Props) {
  const t = ReaderTheme[colorScheme];
  const insets = useSafeAreaInsets();

  const sections = useMemo(() => {
    const { oldTestament, newTestament } = getTestamentSections();
    return [
      { title: 'Old Testament', data: oldTestament },
      { title: 'New Testament', data: newTestament },
    ];
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: t.sidebarBg,
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: insets.bottom + 8,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: t.text }]}>Books</Text>
        {onClose ? (
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close book list">
            <FontAwesome name="times" size={22} color={t.muted} />
          </Pressable>
        ) : null}
      </View>
      <SectionList
        style={styles.sectionList}
        sections={sections}
        keyExtractor={(item) => item}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: t.sidebarBg, borderBottomColor: t.border },
            ]}>
            <Text style={[styles.sectionTitle, { color: t.accent }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const active = selectedBook === item;
          return (
            <Pressable
              onPress={() => onSelectBook(item)}
              style={({ pressed }) => [
                styles.bookRow,
                {
                  backgroundColor: active ? t.surface : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text
                style={[styles.bookName, { color: t.text }]}
                numberOfLines={2}>
                {item}
              </Text>
            </Pressable>
          );
        }}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sectionList: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  bookRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  bookName: {
    fontSize: 16,
    lineHeight: 22,
  },
});
