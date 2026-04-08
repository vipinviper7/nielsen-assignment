import manifestJson from '@/assets/bible/bible-manifest.json';
import type { BibleBookJson, BibleManifest, BibleVerseRef } from '@/lib/bibleTypes';

export const bibleManifest = manifestJson as BibleManifest;

export function globalIndexToLocation(
  m: BibleManifest,
  index: number,
): { book: string; chapter: number; verse: number } {
  if (index < 0 || index >= m.totalVerses) {
    throw new RangeError('Verse index out of range');
  }
  let rest = index;
  for (const b of m.books) {
    if (rest < b.verseCount) {
      let chapter = 1;
      for (const verseCount of b.versesPerChapter) {
        if (rest < verseCount) {
          return { book: b.name, chapter, verse: rest + 1 };
        }
        rest -= verseCount;
        chapter++;
      }
      throw new Error(`Invalid manifest: ${b.name}`);
    }
    rest -= b.verseCount;
  }
  throw new Error('Invalid manifest: global index not mapped');
}

export function verseFromBookData(
  data: BibleBookJson,
  book: string,
  chapter: number,
  verse: number,
): BibleVerseRef | null {
  const ch = data.chapters.find(
    (c) => parseInt(c.chapter, 10) === chapter,
  );
  if (!ch) return null;
  const v = ch.verses.find((x) => parseInt(x.verse, 10) === verse);
  if (!v) return null;
  return { book, chapter, verse, text: v.text };
}
