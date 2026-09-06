import { useMemo } from 'react';
import { getCachedHighlightRanges } from './highlightRangesCache';
import type { HighlightMatchOptions, HighlightRange } from './types';

export function useHighlightRanges(
  text: string,
  query: string,
  options?: HighlightMatchOptions
): HighlightRange[] {
  return useMemo(
    () => getCachedHighlightRanges(text, query, options),
    [text, query, options]
  );
}
