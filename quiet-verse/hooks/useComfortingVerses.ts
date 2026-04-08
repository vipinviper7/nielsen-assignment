import { useEffect, useState } from 'react';

import { loadCachedBook } from '@/lib/bibleBookCache';
import { verseFromBookData } from '@/lib/bibleManifest';
import { COMFORTING_VERSES } from '@/lib/comfortingVerses';
import type { BibleVerseRef } from '@/lib/bibleTypes';
import { useDayOrdinal } from '@/hooks/useDayOrdinal';

/**
 * Returns a shuffled (deterministic per day) list of comforting verses.
 * Loads them progressively so the first card appears fast.
 */
export function useComfortingVerses() {
  const dayOrdinal = useDayOrdinal();
  const [verses, setVerses] = useState<BibleVerseRef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Deterministic shuffle based on day
    const shuffled = [...COMFORTING_VERSES].sort((a, b) => {
      const ha = hashRef(a, dayOrdinal);
      const hb = hashRef(b, dayOrdinal);
      return ha - hb;
    });

    (async () => {
      const loaded: BibleVerseRef[] = [];
      for (const ref of shuffled) {
        if (cancelled) return;
        try {
          const data = await loadCachedBook(ref.book);
          if (cancelled) return;
          if (data) {
            const v = verseFromBookData(data, ref.book, ref.chapter, ref.verse);
            if (v) {
              loaded.push(v);
              // Show first card immediately, then batch updates
              if (loaded.length === 1 || loaded.length % 5 === 0) {
                setVerses([...loaded]);
              }
            }
          }
        } catch {
          // skip failed verse
        }
      }
      if (!cancelled) {
        setVerses([...loaded]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dayOrdinal]);

  return { verses, loading };
}

function hashRef(
  ref: { book: string; chapter: number; verse: number },
  seed: number,
): number {
  let h = seed;
  for (let i = 0; i < ref.book.length; i++) {
    h = Math.imul(h ^ ref.book.charCodeAt(i), 2654435761);
  }
  h = Math.imul(h ^ ref.chapter, 2654435761);
  h = Math.imul(h ^ ref.verse, 2654435761);
  return h >>> 0;
}
