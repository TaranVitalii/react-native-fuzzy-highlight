import { computeHighlightRanges } from './computeHighlightRanges';
import type { HighlightMatchOptions, HighlightRange } from './types';

/**
 * Bounded beyond a single component instance: the same (text, query) pair
 * often recurs across rows (duplicate list items) or across remounts (a row
 * scrolled out of a virtualized list's recycling window and back in), where
 * a per-component useMemo can't help. A plain Map preserves insertion order,
 * so moving a hit to the end on read is enough to implement LRU eviction.
 */
export const MAX_ENTRIES = 500;
const cache = new Map<string, HighlightRange[]>();

// A NUL separator avoids key collisions a printable one wouldn't, e.g.
// text="Acme super" + query="flow" vs. text="Acme" + query="super flow".
function cacheKey(text: string, query: string): string {
  return text + '\u0000' + query;
}

export function getCachedHighlightRanges(
  text: string,
  query: string,
  options?: HighlightMatchOptions
): HighlightRange[] {
  // A non-default matchOptions (e.g. a custom typoTolerance function) can't
  // be folded into a string cache key, so it bypasses the cache entirely
  // rather than risk serving a result computed under different options.
  if (options !== undefined) {
    return computeHighlightRanges(text, query, options);
  }

  const key = cacheKey(text, query);
  const cached = cache.get(key);
  if (cached !== undefined) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }

  const ranges = computeHighlightRanges(text, query);
  cache.set(key, ranges);
  if (cache.size > MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  return ranges;
}

export function clearHighlightRangesCache(): void {
  cache.clear();
}
