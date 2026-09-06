import { useMemo } from 'react';
import { computeHighlightRanges } from './computeHighlightRanges';
import type { HighlightRange } from './types';

export function useHighlightRanges(
  text: string,
  query: string
): HighlightRange[] {
  return useMemo(() => computeHighlightRanges(text, query), [text, query]);
}
