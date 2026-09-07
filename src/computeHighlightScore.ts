import { tokenize } from './tokenize';
import {
  defaultTypoTolerance,
  fuzzyContainsMatch,
  fuzzyPrefixMatch,
} from './match';
import { stripDiacritics } from './diacritics';
import type { HighlightMatchOptions } from './types';

// exactness: 1.0 for an exact match, less as substitutions increase (down to
// the typoTolerance table's own cutoff, below which the match wouldn't have
// been returned at all). completeness: how much of the *target* word this
// match actually covers — a full-word match scores higher than a prefix-only
// match on a longer word (e.g. query "Acme" against target "Acme" beats
// query "Acm" against target "Acme").
function tokenScore(
  comparedLength: number,
  mismatches: number,
  targetLength: number
): number {
  const exactness = (comparedLength - mismatches) / comparedLength;
  const completeness = comparedLength / targetLength;
  return exactness * completeness;
}

/**
 * Scores how well `query` matches `text`, from 0 (no match at all) to 1
 * (every query word matched some target word fully and exactly). Useful for
 * ranking a filtered/searched list by relevance — pair with
 * computeHighlightRanges (or useHighlightRanges) to also render the
 * highlight itself; this intentionally doesn't return ranges, so sorting a
 * whole list by score doesn't require rendering every row's highlights
 * first.
 *
 * Each query word is scored independently against whichever target word it
 * matches best (order-independent, same semantics as
 * computeHighlightRanges), then averaged across all query words — so a
 * query word that matches nothing drags the score down (contributes 0)
 * rather than being ignored.
 */
export function computeHighlightScore(
  text: string,
  query: string,
  options?: HighlightMatchOptions
): number {
  const trimmedQuery = query.trim();
  if (!text || !trimmedQuery) return 0;

  const targetTokens = tokenize(text);
  const queryTokens = tokenize(trimmedQuery).map((token) => token.text);
  if (targetTokens.length === 0 || queryTokens.length === 0) return 0;

  const mode = options?.mode ?? 'prefix';
  const typoTolerance = options?.typoTolerance ?? defaultTypoTolerance;
  const ignoreDiacritics = options?.ignoreDiacritics ?? true;
  const normalize = (s: string): string => {
    const lower = s.toLowerCase();
    return ignoreDiacritics ? stripDiacritics(lower) : lower;
  };

  const normalizedTargets = targetTokens.map((token) => normalize(token.text));

  let total = 0;
  for (const queryToken of queryTokens) {
    const normalizedQuery = normalize(queryToken);
    let best = 0;

    for (let i = 0; i < normalizedTargets.length; i++) {
      const normalizedTarget = normalizedTargets[i]!;
      const targetLength = targetTokens[i]!.text.length;

      const match =
        mode === 'contains'
          ? fuzzyContainsMatch(normalizedQuery, normalizedTarget, typoTolerance)
          : fuzzyPrefixMatch(normalizedQuery, normalizedTarget, typoTolerance);

      if (match !== null && match.length > 0) {
        const score = tokenScore(match.length, match.mismatches, targetLength);
        if (score > best) best = score;
      }
    }

    total += best;
  }

  return total / queryTokens.length;
}
