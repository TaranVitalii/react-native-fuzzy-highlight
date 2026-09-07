import { tokenize } from './tokenize';
import {
  defaultTypoTolerance,
  fuzzyContainsMatch,
  fuzzyPrefixMatch,
} from './match';
import { stripDiacritics } from './diacritics';
import type { HighlightMatchOptions, HighlightRange } from './types';

interface BestMatch {
  start: number;
  length: number;
}

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
  query: string,
  options?: HighlightMatchOptions
): HighlightRange[] {
  if (!text) return [];

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const targetTokens = tokenize(text);
  const queryTokens = tokenize(trimmedQuery).map((token) => token.text);
  if (targetTokens.length === 0 || queryTokens.length === 0) return [];

  const mode = options?.mode ?? 'prefix';
  const typoTolerance = options?.typoTolerance ?? defaultTypoTolerance;
  const ignoreDiacritics = options?.ignoreDiacritics ?? true;
  const normalize = (s: string): string => {
    const lower = s.toLowerCase();
    return ignoreDiacritics ? stripDiacritics(lower) : lower;
  };
  const normalizedQueryTokens = queryTokens.map(normalize);

  const ranges: HighlightRange[] = [];

  for (const targetToken of targetTokens) {
    const normalizedTarget = normalize(targetToken.text);
    let best: BestMatch | null = null;

    for (const queryToken of normalizedQueryTokens) {
      if (mode === 'contains') {
        const match = fuzzyContainsMatch(
          queryToken,
          normalizedTarget,
          typoTolerance
        );
        if (match !== null && (best === null || match.length > best.length)) {
          best = match;
        }
      } else {
        const match = fuzzyPrefixMatch(
          queryToken,
          normalizedTarget,
          typoTolerance
        );
        if (match !== null && (best === null || match.length > best.length)) {
          best = { start: 0, length: match.length };
        }
      }
    }

    if (best !== null && best.length > 0) {
      ranges.push({
        start: targetToken.start + best.start,
        end: targetToken.start + best.start + best.length,
      });
    }
  }

  return ranges;
}
