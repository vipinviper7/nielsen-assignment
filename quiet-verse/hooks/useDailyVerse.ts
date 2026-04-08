import { useEffect, useState } from 'react';

import {
  bibleManifest,
  globalIndexToLocation,
  verseFromBookData,
} from '@/lib/bibleManifest';
import { loadCachedBook } from '@/lib/bibleBookCache';
import { getDailyGlobalVerseIndexForOrdinal } from '@/lib/dailyVerse';
import type { BibleVerseRef } from '@/lib/bibleTypes';

import { useDayOrdinal } from '@/hooks/useDayOrdinal';

export function useDailyVerse() {
  const dayOrdinal = useDayOrdinal();
  const [verse, setVerse] = useState<BibleVerseRef | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const globalIdx = getDailyGlobalVerseIndexForOrdinal(dayOrdinal);
    const loc = globalIndexToLocation(bibleManifest, globalIdx);

    (async () => {
      try {
        const data = await loadCachedBook(loc.book);
        if (cancelled) return;
        if (!data) {
          setVerse(null);
          setError('Could not load scripture.');
          return;
        }
        const v = verseFromBookData(data, loc.book, loc.chapter, loc.verse);
        if (!cancelled) {
          setVerse(v);
          if (!v) setError('Verse not found.');
        }
      } catch (e) {
        if (!cancelled) {
          setVerse(null);
          setError(e instanceof Error ? e.message : 'Failed to load verse.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dayOrdinal]);

  return { verse, error, dayOrdinal };
}
