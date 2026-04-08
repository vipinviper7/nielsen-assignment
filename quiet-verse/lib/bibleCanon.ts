import { bibleManifest } from '@/lib/bibleManifest';

/** KJV canonical order: OT = first 39 books, NT = remaining 27. */
export const OLD_TESTAMENT_COUNT = 39;

export function getTestamentSections(): {
  oldTestament: string[];
  newTestament: string[];
} {
  const names = bibleManifest.books.map((b) => b.name);
  return {
    oldTestament: names.slice(0, OLD_TESTAMENT_COUNT),
    newTestament: names.slice(OLD_TESTAMENT_COUNT),
  };
}

export function getChapterNumbersForBook(bookName: string): number[] {
  const b = bibleManifest.books.find((x) => x.name === bookName);
  if (!b) return [];
  return b.versesPerChapter.map((_, i) => i + 1);
}
