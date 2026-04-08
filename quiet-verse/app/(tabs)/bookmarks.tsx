import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReaderTheme } from '@/constants/ReaderTheme';
import { useColorScheme } from '@/components/useColorScheme';
import { useReader } from '@/context/ReaderContext';

export default function BookmarksScreen() {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const t = ReaderTheme[colorScheme];
  const insets = useSafeAreaInsets();
  const { bookmarks } = useReader();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: t.bg }]}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator>
      <Text style={[styles.title, { color: t.text }]}>Bookmarks</Text>
      <Text style={[styles.sub, { color: t.muted }]}>
        Long-press a verse in the reader to save it here.
      </Text>
      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name="bookmark-o" size={40} color={t.muted} />
          <Text style={[styles.emptyText, { color: t.muted }]}>
            No bookmarks yet
          </Text>
        </View>
      ) : (
        bookmarks.map((b) => (
          <View
            key={`${b.book}-${b.chapter}-${b.verse}`}
            style={[
              styles.row,
              { borderBottomColor: t.border, backgroundColor: t.surface },
            ]}>
            <FontAwesome name="bookmark" size={16} color={t.bookmark} />
            <Text style={[styles.ref, { color: t.text }]}>
              {b.book} {b.chapter}:{b.verse}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ref: {
    fontSize: 17,
    fontWeight: '500',
  },
});
