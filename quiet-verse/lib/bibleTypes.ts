/** Shape of each book file from aruljohn/Bible-kjv */
export interface BibleBookJson {
  book: string;
  chapters: Array<{
    chapter: string;
    verses: Array<{ verse: string; text: string }>;
  }>;
}

export interface BibleManifestBook {
  name: string;
  verseCount: number;
  /** Verse count per chapter in order (chapter 1 = index 0) */
  versesPerChapter: number[];
}

export interface BibleManifest {
  totalVerses: number;
  books: BibleManifestBook[];
}

export interface BibleVerseRef {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}
