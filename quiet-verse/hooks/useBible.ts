import { useCallback, useMemo, useState } from 'react';

import {
  clearBibleBookCache,
  isBookCached,
  loadCachedBook,
} from '@/lib/bibleBookCache';
import { bibleBookLoaders } from '@/lib/bibleBookLoaders';
import {
  bibleManifest,
  globalIndexToLocation,
  verseFromBookData,
} from '@/lib/bibleManifest';
import type { BibleVerseRef } from '@/lib/bibleTypes';

export function useBible() {
  const [pendingLoads, setPendingLoads] = useState(0);

  const beginLoad = useCallback(() => {
    setPendingLoads((n) => n + 1);
  }, []);

  const endLoad = useCallback(() => {
    setPendingLoads((n) => Math.max(0, n - 1));
  }, []);

  const loadBook = useCallback(
    async (bookName: string) => {
      if (!bibleBookLoaders[bookName]) return null;
      if (isBookCached(bookName)) return loadCachedBook(bookName);
      beginLoad();
      try {
        return await loadCachedBook(bookName);
      } finally {
        endLoad();
      }
    },
    [beginLoad, endLoad],
  );

  const getRandomVerse = useCallback(async (): Promise<BibleVerseRef | null> => {
    const idx = Math.floor(Math.random() * bibleManifest.totalVerses);
    const loc = globalIndexToLocation(bibleManifest, idx);
    const data = await loadBook(loc.book);
    if (!data) return null;
    return verseFromBookData(data, loc.book, loc.chapter, loc.verse);
  }, [loadBook]);

  const getVerse = useCallback(
    async (
      book: string,
      chapter: number,
      verse: number,
    ): Promise<BibleVerseRef | null> => {
      const data = await loadBook(book);
      if (!data) return null;
      return verseFromBookData(data, book, chapter, verse);
    },
    [loadBook],
  );

  const getChaptersInBook = useCallback(
    async (book: string): Promise<number[]> => {
      const data = await loadBook(book);
      if (!data) return [];
      return data.chapters.map((c) => parseInt(c.chapter, 10));
    },
    [loadBook],
  );

  const getVersesInChapter = useCallback(
    async (
      book: string,
      chapter: number,
    ): Promise<Array<{ verse: number; text: string }>> => {
      const data = await loadBook(book);
      if (!data) return [];
      const ch = data.chapters.find(
        (c) => parseInt(c.chapter, 10) === chapter,
      );
      if (!ch) return [];
      return ch.verses.map((v) => ({
        verse: parseInt(v.verse, 10),
        text: v.text,
      }));
    },
    [loadBook],
  );

  const bookNames = useMemo(
    () => bibleManifest.books.map((b) => b.name),
    [],
  );

  const clearBookCache = useCallback(() => {
    clearBibleBookCache();
  }, []);

  return {
    bookNames,
    manifest: bibleManifest,
    isLoading: pendingLoads > 0,
    loadBook,
    clearBookCache,
    getRandomVerse,
    getVerse,
    getChaptersInBook,
    getVersesInChapter,
  };
}
