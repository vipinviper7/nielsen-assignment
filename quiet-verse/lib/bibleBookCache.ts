import { bibleBookLoaders } from '@/lib/bibleBookLoaders';
import type { BibleBookJson } from '@/lib/bibleTypes';

const cache = new Map<string, BibleBookJson>();

export function isBookCached(bookName: string): boolean {
  return cache.has(bookName);
}

export async function loadCachedBook(
  bookName: string,
): Promise<BibleBookJson | null> {
  if (!bibleBookLoaders[bookName]) return null;
  const hit = cache.get(bookName);
  if (hit) return hit;
  const data = await bibleBookLoaders[bookName]();
  cache.set(bookName, data);
  return data;
}

export function clearBibleBookCache() {
  cache.clear();
}
