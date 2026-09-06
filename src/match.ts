/**
 * Max substitutions tolerated for a fuzzy prefix match, scaled by the length
 * of the compared window. Short words require an exact prefix so query "Acm"
 * never fuzzy-matches unrelated 3-letter prefixes.
 */
function typoThreshold(len: number): number {
  if (len < 4) return 0;
  if (len < 8) return 1;
  return 2;
}

/**
 * Compares `query` against the start of `target` (both expected pre-lowercased)
 * allowing up to `typoThreshold` character substitutions. Returns how many
 * leading characters of `target` matched, or null if the mismatch count
 * exceeds the threshold.
 *
 * Deliberately substitution-only (Hamming, not Levenshtein): no insertions or
 * deletions, so the match length is always min(query.length, target.length)
 * with no backtracking needed. This is what makes "Acme" vs "Acma" highlight
 * the whole 4-char word, while "Acm" vs "Acme" highlights only 3 chars.
 */
export function fuzzyPrefixMatchLength(
  query: string,
  target: string
): number | null {
  const len = Math.min(query.length, target.length);
  if (len === 0) return null;

  const maxMismatches = typoThreshold(len);
  let mismatches = 0;

  for (let i = 0; i < len; i++) {
    if (query[i] !== target[i]) {
      mismatches++;
      if (mismatches > maxMismatches) return null;
    }
  }

  return len;
}
