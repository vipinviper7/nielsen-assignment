import { useEffect, useState } from 'react';

import { getLocalDayOrdinal } from '@/lib/dailyVerse';

/** Current local calendar day; updates after local midnight. */
export function useDayOrdinal() {
  const [ordinal, setOrdinal] = useState(() => getLocalDayOrdinal());

  useEffect(() => {
    let last = getLocalDayOrdinal();
    const id = setInterval(() => {
      const next = getLocalDayOrdinal();
      if (next !== last) {
        last = next;
        setOrdinal(next);
      }
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  return ordinal;
}
