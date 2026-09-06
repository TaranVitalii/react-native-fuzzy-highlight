import { useMemo } from 'react';
import { computeHighlightRanges } from './computeHighlightRanges';
import type { HighlightMatchOptions, HighlightRange } from './types';

export function useHighlightRanges(
  text: string,
  query: string,
  options?: HighlightMatchOptions
): HighlightRange[] {
  return useMemo(
    () => computeHighlightRanges(text, query, options),
    [text, query, options]
  );
}
