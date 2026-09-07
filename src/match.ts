export type TypoToleranceFn = (comparedLength: number) => number;

/**
 * Max substitutions tolerated for a fuzzy match, scaled by the length of the
 * compared window. Short words require an exact match so query "Acm" never
 * fuzzy-matches unrelated 3-letter prefixes.
 */
export function defaultTypoTolerance(comparedLength: number): number {
  if (comparedLength < 4) return 0;
  if (comparedLength < 8) return 1;
  return 2;
}

export interface PrefixMatch {
  length: number;
  mismatches: number;
}

/**
 * Compares `query` against the start of `target` (both expected pre-lowered/
 * normalized) allowing up to `typoTolerance(comparedLength)` character
 * substitutions. Returns the matched length and how many of those
 * characters were substitutions (0 = exact), or null if the mismatch count
 * exceeds the threshold.
 *
 * Deliberately substitution-only (Hamming, not Levenshtein): no insertions or
 * deletions, so the match length is always min(query.length, target.length)
 * with no backtracking needed. This is what makes "Acme" vs "Acma" highlight
 * the whole 4-char word, while "Acm" vs "Acme" highlights only 3 chars.
 */
export function fuzzyPrefixMatch(
  query: string,
  target: string,
  typoTolerance: TypoToleranceFn = defaultTypoTolerance
): PrefixMatch | null {
  const len = Math.min(query.length, target.length);
  if (len === 0) return null;

  const maxMismatches = typoTolerance(len);
  let mismatches = 0;

  for (let i = 0; i < len; i++) {
    if (query[i] !== target[i]) {
      mismatches++;
      if (mismatches > maxMismatches) return null;
    }
  }

  return { length: len, mismatches };
}

export interface ContainsMatch {
  start: number;
  length: number;
  mismatches: number;
}

/**
 * Like fuzzyPrefixMatch, but `query` may align starting at any offset within
 * `target`, not just offset 0 (e.g. "tek" matches "zyntek" at offset 3).
 * Returns the longest match found, ties broken by earliest start.
 */
export function fuzzyContainsMatch(
  query: string,
  target: string,
  typoTolerance: TypoToleranceFn = defaultTypoTolerance
): ContainsMatch | null {
  let best: ContainsMatch | null = null;

  for (let start = 0; start < target.length; start++) {
    const match = fuzzyPrefixMatch(query, target.slice(start), typoTolerance);
    if (match !== null && (best === null || match.length > best.length)) {
      best = { start, length: match.length, mismatches: match.mismatches };
    }
  }

  return best;
}
