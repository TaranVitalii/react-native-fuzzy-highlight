export type TypoToleranceFn = (comparedLength: number) => number;

/**
 * Max substitutions tolerated for a fuzzy match, scaled by the length of the
 * compared window. Short words require an exact match so query "Nik" never
 * fuzzy-matches unrelated 3-letter prefixes.
 */
export function defaultTypoTolerance(comparedLength: number): number {
  if (comparedLength < 4) return 0;
  if (comparedLength < 8) return 1;
  return 2;
}

/**
 * Compares `query` against the start of `target` (both expected pre-lowercased)
 * allowing up to `typoTolerance(comparedLength)` character substitutions.
 * Returns how many leading characters of `target` matched, or null if the
 * mismatch count exceeds the threshold.
 *
 * Deliberately substitution-only (Hamming, not Levenshtein): no insertions or
 * deletions, so the match length is always min(query.length, target.length)
 * with no backtracking needed. This is what makes "Nike" vs "Nika" highlight
 * the whole 4-char word, while "Nik" vs "Nike" highlights only 3 chars.
 */
export function fuzzyPrefixMatchLength(
  query: string,
  target: string,
  typoTolerance: TypoToleranceFn = defaultTypoTolerance
): number | null {
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

  return len;
}

export interface ContainsMatch {
  start: number;
  length: number;
}

/**
 * Like fuzzyPrefixMatchLength, but `query` may align starting at any offset
 * within `target`, not just offset 0 (e.g. "max" matches "airmax" at offset
 * 3). Returns the longest match found, ties broken by earliest start.
 */
export function fuzzyContainsMatch(
  query: string,
  target: string,
  typoTolerance: TypoToleranceFn = defaultTypoTolerance
): ContainsMatch | null {
  let best: ContainsMatch | null = null;

  for (let start = 0; start < target.length; start++) {
    const length = fuzzyPrefixMatchLength(
      query,
      target.slice(start),
      typoTolerance
    );
    if (length !== null && (best === null || length > best.length)) {
      best = { start, length };
    }
  }

  return best;
}
