import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FontPreset } from '@/constants/ReaderTheme';
import { bibleManifest } from '@/lib/bibleManifest';

const FONT_KEY = 'reader.fontPreset';
const BOOKMARKS_KEY = 'reader.bookmarks';
const THEME_PREF_KEY = 'app.themePreference';

export type ThemePreference = 'system' | 'light' | 'dark';

const VALID_THEME_PREFS: ThemePreference[] = ['system', 'light', 'dark'];

/**
 * In-memory cache that mirrors AsyncStorage.
 * Reads are synchronous (from cache); writes persist in background.
 */
const cache = new Map<string, string>();
let _hydrated = false;

const PERSISTED_KEYS = [FONT_KEY, BOOKMARKS_KEY, THEME_PREF_KEY];

/** Call once at app start to populate the sync cache from AsyncStorage. */
export async function hydrateStorage(): Promise<void> {
  if (_hydrated) return;
  if (Platform.OS === 'web') {
    _hydrated = true;
    return;
  }
  try {
    const pairs = await AsyncStorage.multiGet(PERSISTED_KEYS);
    for (const [key, value] of pairs) {
      if (value != null) cache.set(key, value);
    }
  } catch {
    // continue with empty cache
  }
  _hydrated = true;
}

function readString(key: string): string | undefined {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined;
    }
    return undefined;
  }
  return cache.get(key);
}

function writeString(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return;
  }
  cache.set(key, value);
  AsyncStorage.setItem(key, value).catch(() => {});
}

export function loadThemePreference(): ThemePreference {
  const raw = readString(THEME_PREF_KEY);
  if (raw && VALID_THEME_PREFS.includes(raw as ThemePreference)) {
    return raw as ThemePreference;
  }
  return 'system';
}

export function saveThemePreference(preference: ThemePreference) {
  writeString(THEME_PREF_KEY, preference);
}

export type BookmarkRef = {
  book: string;
  chapter: number;
  verse: number;
};

const VALID_PRESETS: FontPreset[] = ['sm', 'md', 'lg'];

export function loadFontPreset(): FontPreset {
  const raw = readString(FONT_KEY);
  if (raw && VALID_PRESETS.includes(raw as FontPreset)) {
    return raw as FontPreset;
  }
  return 'md';
}

export function saveFontPreset(preset: FontPreset) {
  writeString(FONT_KEY, preset);
}

function sortBookmarks(list: BookmarkRef[]): BookmarkRef[] {
  const order = new Map(
    bibleManifest.books.map((b, i) => [b.name, i]),
  );
  return [...list].sort((a, b) => {
    const ia = order.get(a.book) ?? 999;
    const ib = order.get(b.book) ?? 999;
    if (ia !== ib) return ia - ib;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });
}

export function loadBookmarks(): BookmarkRef[] {
  const raw = readString(BOOKMARKS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: BookmarkRef[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        'book' in item &&
        'chapter' in item &&
        'verse' in item
      ) {
        const book = String((item as BookmarkRef).book);
        const chapter = Number((item as BookmarkRef).chapter);
        const verse = Number((item as BookmarkRef).verse);
        if (book && Number.isFinite(chapter) && Number.isFinite(verse)) {
          out.push({ book, chapter, verse });
        }
      }
    }
    return sortBookmarks(out);
  } catch {
    return [];
  }
}

export function saveBookmarks(list: BookmarkRef[]) {
  writeString(BOOKMARKS_KEY, JSON.stringify(sortBookmarks(list)));
}

export function toggleBookmarkInStorage(b: BookmarkRef): boolean {
  const list = loadBookmarks();
  const i = list.findIndex(
    (x) =>
      x.book === b.book && x.chapter === b.chapter && x.verse === b.verse,
  );
  if (i >= 0) {
    list.splice(i, 1);
    saveBookmarks(list);
    return false;
  }
  list.push(b);
  saveBookmarks(list);
  return true;
}
