import { bibleManifest, globalIndexToLocation } from '@/lib/bibleManifest';

/** Local calendar day as days since Unix epoch (UTC ms / 864e5 at local midnight). */
export function getLocalDayOrdinal(d: Date = new Date()): number {
  const localMidnight = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  ).getTime();
  return Math.floor(localMidnight / 86_400_000);
}

function hashStringToSeed(s: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Fisher–Yates shuffle; deterministic from seed string. */
function buildPermutation(length: number, seedStr: string): Uint32Array {
  const rand = mulberry32(hashStringToSeed(seedStr));
  const perm = new Uint32Array(length);
  for (let i = 0; i < length; i++) perm[i] = i;
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = perm[i]!;
    perm[i] = perm[j]!;
    perm[j] = tmp;
  }
  return perm;
}

const PERM_SEED = 'quiet-verse-daily-kjv-v1';

let cachedPerm: Uint32Array | null = null;
let cachedLength = 0;

function versePermutation(totalVerses: number): Uint32Array {
  if (!cachedPerm || cachedLength !== totalVerses) {
    cachedPerm = buildPermutation(totalVerses, PERM_SEED);
    cachedLength = totalVerses;
  }
  return cachedPerm;
}

/**
 * Global verse index (0 .. totalVerses-1) for a local calendar day ordinal.
 * Same ordinal → same verse everywhere. Consecutive ordinals map to distinct indices
 * for 31,102 days (full permutation period), so no repeats within any 365-day window.
 */
export function getDailyGlobalVerseIndexForOrdinal(ordinal: number): number {
  const n = bibleManifest.totalVerses;
  const perm = versePermutation(n);
  return perm[ordinal % n]!;
}

/**
 * Global verse index for `date`’s local calendar day.
 */
export function getDailyGlobalVerseIndex(date: Date = new Date()): number {
  return getDailyGlobalVerseIndexForOrdinal(getLocalDayOrdinal(date));
}

export function getDailyVerseLocation(date: Date = new Date()) {
  return globalIndexToLocation(
    bibleManifest,
    getDailyGlobalVerseIndexForOrdinal(getLocalDayOrdinal(date)),
  );
}
