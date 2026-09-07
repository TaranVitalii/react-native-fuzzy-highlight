// Unicode "Combining Diacritical Marks" block (U+0300-U+036F) — what NFD
// decomposition produces for accents/tildes/umlauts etc.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

// String.prototype.normalize is core ECMA-262 (not an Intl/ICU feature), and
// NFD is confirmed supported on Hermes — but this library ships to
// unknown/older host engines, so fall back to a no-op rather than throw if
// it's ever missing.
const supportsNormalize = typeof ''.normalize === 'function';

/**
 * Strips a combining diacritical mark from a single character via Unicode
 * NFD decomposition (e.g. "é" -> "e" + a combining acute accent, which is
 * then dropped). Falls back to the original character untouched if
 * decomposition doesn't reduce to exactly one base character (e.g.
 * ligatures like "æ", which NFD leaves as a single, non-decomposable
 * codepoint) — every character maps 1:1, so callers can strip diacritics
 * from a string without shifting any other character's position.
 */
function stripDiacritic(char: string): string {
  if (!supportsNormalize) return char;
  const normalized = char.normalize('NFD').replace(COMBINING_MARKS, '');
  return normalized.length === 1 ? normalized : char;
}

/**
 * Diacritics-insensitive normalization, e.g. "café" -> "cafe" — applied
 * per character (not to the string as a whole) so the result is always the
 * same length as the input, keeping match positions aligned with the
 * original (un-normalized) text they're computed against.
 */
export function stripDiacritics(text: string): string {
  if (!supportsNormalize) return text;
  let result = '';
  for (const char of text) {
    result += stripDiacritic(char);
  }
  return result;
}
