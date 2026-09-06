import { tokenize } from './tokenize';
import { fuzzyPrefixMatchLength } from './match';
import type { HighlightRange } from './types';

/**
 * Computes which parts of `text` should be highlighted for `query`.
 *
 * Tokenizes both strings on whitespace and matches every target token
 * against every query token independently of word order (a matched query
 * token isn't "consumed", so it can match more than one target token). Each
 * target token contributes at most one range, sized to the best
 * (longest/most-tolerant) match among the query tokens.
 */
export function computeHighlightRanges(
  text: string,
  query: string
): HighlightRange[] {
  if (!text) return [];

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const targetTokens = tokenize(text);
  const queryTokens = tokenize(trimmedQuery).map((token) =>
    token.text.toLowerCase()
  );
  if (targetTokens.length === 0 || queryTokens.length === 0) return [];

  const ranges: HighlightRange[] = [];

  for (const targetToken of targetTokens) {
    const lowerTarget = targetToken.text.toLowerCase();
    let bestLength = 0;

    for (const queryToken of queryTokens) {
      const matchLength = fuzzyPrefixMatchLength(queryToken, lowerTarget);
      if (matchLength !== null && matchLength > bestLength) {
        bestLength = matchLength;
      }
    }

    if (bestLength > 0) {
      ranges.push({
        start: targetToken.start,
        end: targetToken.start + bestLength,
      });
    }
  }

  return ranges;
}
