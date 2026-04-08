import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReaderTheme } from '@/constants/ReaderTheme';
import { useColorScheme } from '@/components/useColorScheme';
import { useBible } from '@/hooks/useBible';
import { getTestamentSections, getChapterNumbersForBook } from '@/lib/bibleCanon';

import { ChapterGrid } from '@/components/reader/ChapterGrid';
import { VerseList } from '@/components/reader/VerseList';

type Testament = 'old' | 'new';

export function BibleReaderScreen() {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const t = ReaderTheme[colorScheme];
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [testament, setTestament] = useState<Testament>('old');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<
    Array<{ verse: number; text: string }>
  >([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  const { getVersesInChapter } = useBible();

  const { oldTestament, newTestament } = useMemo(() => getTestamentSections(), []);
  const books = testament === 'old' ? oldTestament : newTestament;

  useEffect(() => {
    if (!selectedBook || selectedChapter === null) {
      setVerses([]);
      return;
    }
    let cancelled = false;
    setLoadingVerses(true);
    getVersesInChapter(selectedBook, selectedChapter).then((v) => {
      if (!cancelled) {
        setVerses(v);
        setLoadingVerses(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedBook, selectedChapter, getVersesInChapter]);

  const onSelectBook = useCallback((book: string) => {
    setSelectedBook(book);
    setSelectedChapter(null);
  }, []);

  const onSelectChapter = useCallback((ch: number) => {
    setSelectedChapter(ch);
  }, []);

  const goBack = useCallback(() => {
    if (selectedChapter !== null) {
      setSelectedChapter(null);
    } else if (selectedBook !== null) {
      setSelectedBook(null);
    }
  }, [selectedBook, selectedChapter]);

  const chapters = selectedBook
    ? getChapterNumbersForBook(selectedBook)
    : [];

  const headerTitle =
    selectedBook && selectedChapter !== null
      ? `${selectedBook} ${selectedChapter}`
      : selectedBook
        ? selectedBook
        : 'Read';

  const canGoBack = selectedBook !== null;

  const renderBookItem = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        onPress={() => onSelectBook(item)}
        style={({ pressed }) => [
          styles.bookRow,
          {
            backgroundColor: pressed ? t.surface : 'transparent',
          },
        ]}>
        <Text style={[styles.bookName, { color: t.text }]}>{item}</Text>
        <FontAwesome name="chevron-right" size={12} color={t.muted} />
      </Pressable>
    ),
    [onSelectBook, t],
  );

  const mainBody = () => {
    if (!selectedBook) {
      return (
        <View style={styles.bookListContainer}>
          {/* Testament toggle */}
          <View style={[styles.toggleRow, { borderBottomColor: t.border }]}>
            <Pressable
              onPress={() => setTestament('old')}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: testament === 'old' ? `${t.accent}22` : 'transparent',
                  borderColor: testament === 'old' ? t.accent : t.border,
                },
              ]}>
              <Text
                style={[
                  styles.toggleText,
                  { color: testament === 'old' ? t.accent : t.muted },
                ]}>
                Old Testament
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTestament('new')}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: testament === 'new' ? `${t.accent}22` : 'transparent',
                  borderColor: testament === 'new' ? t.accent : t.border,
                },
              ]}>
              <Text
                style={[
                  styles.toggleText,
                  { color: testament === 'new' ? t.accent : t.muted },
                ]}>
                New Testament
              </Text>
            </Pressable>
          </View>
          {/* Book list */}
          <FlatList
            data={books}
            keyExtractor={(item) => item}
            renderItem={renderBookItem}
            contentContainerStyle={styles.bookListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }
    if (selectedChapter === null) {
      return (
        <ChapterGrid
          colorScheme={colorScheme}
          bookName={selectedBook}
          chapters={chapters}
          onSelectChapter={onSelectChapter}
        />
      );
    }
    return (
      <VerseList
        colorScheme={colorScheme}
        book={selectedBook}
        chapter={selectedChapter}
        verses={verses}
        loading={loadingVerses}
      />
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 8),
            borderBottomColor: t.border,
            backgroundColor: t.bg,
          },
        ]}>
        <View style={styles.iconBtn}>
          {canGoBack ? (
            <Pressable
              onPress={goBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <FontAwesome name="chevron-left" size={22} color={t.accent} />
            </Pressable>
          ) : null}
        </View>
        <Text
          style={[styles.headerCenter, { color: t.text }]}
          numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.iconBtn} />
      </View>
      {mainBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  bookListContainer: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  bookListContent: {
    paddingVertical: 8,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 1,
    borderRadius: 8,
  },
  bookName: {
    fontSize: 16,
    lineHeight: 22,
  },
});
