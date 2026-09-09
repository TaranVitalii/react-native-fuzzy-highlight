import { useMemo } from 'react';
import { getCachedHighlightScore } from './highlightScoreCache';
import type { HighlightMatchOptions } from './types';

export function useHighlightScore(
  text: string,
  query: string,
  options?: HighlightMatchOptions
): number {
  return useMemo(
    () => getCachedHighlightScore(text, query, options),
    [text, query, options]
  );
}
