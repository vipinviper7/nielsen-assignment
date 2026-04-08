import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { FONT_PRESETS, type FontPreset } from '@/constants/ReaderTheme';
import {
  loadBookmarks,
  loadFontPreset,
  saveFontPreset,
  toggleBookmarkInStorage,
  type BookmarkRef,
} from '@/lib/readerStorage';

type ReaderContextValue = {
  fontPreset: FontPreset;
  setFontPreset: (p: FontPreset) => void;
  fontMetrics: (typeof FONT_PRESETS)[FontPreset];
  bookmarks: BookmarkRef[];
  refreshBookmarks: () => void;
  toggleBookmark: (b: BookmarkRef) => boolean;
  isBookmarked: (b: BookmarkRef) => boolean;
};

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [fontPreset, setFontPresetState] = useState<FontPreset>(loadFontPreset);
  const [bookmarks, setBookmarks] = useState<BookmarkRef[]>(loadBookmarks);

  const setFontPreset = useCallback((p: FontPreset) => {
    setFontPresetState(p);
    saveFontPreset(p);
  }, []);

  const refreshBookmarks = useCallback(() => {
    setBookmarks(loadBookmarks());
  }, []);

  const toggleBookmark = useCallback((b: BookmarkRef) => {
    const added = toggleBookmarkInStorage(b);
    setBookmarks(loadBookmarks());
    return added;
  }, []);

  const isBookmarked = useCallback(
    (b: BookmarkRef) =>
      bookmarks.some(
        (x) =>
          x.book === b.book && x.chapter === b.chapter && x.verse === b.verse,
      ),
    [bookmarks],
  );

  const value = useMemo<ReaderContextValue>(
    () => ({
      fontPreset,
      setFontPreset,
      fontMetrics: FONT_PRESETS[fontPreset],
      bookmarks,
      refreshBookmarks,
      toggleBookmark,
      isBookmarked,
    }),
    [
      fontPreset,
      setFontPreset,
      bookmarks,
      refreshBookmarks,
      toggleBookmark,
      isBookmarked,
    ],
  );

  return (
    <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
  );
}

export function useReader() {
  const ctx = useContext(ReaderContext);
  if (!ctx) {
    throw new Error('useReader must be used within ReaderProvider');
  }
  return ctx;
}
