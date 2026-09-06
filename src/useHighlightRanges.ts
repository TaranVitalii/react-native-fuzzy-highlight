import { useMemo } from 'react';
import { getCachedHighlightRanges } from './highlightRangesCache';
import type { HighlightRange } from './types';

export function useHighlightRanges(
  text: string,
  query: string
): HighlightRange[] {
  return useMemo(() => getCachedHighlightRanges(text, query), [text, query]);
}
