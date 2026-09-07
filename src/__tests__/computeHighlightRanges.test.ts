import { computeHighlightRanges } from '../computeHighlightRanges';
import type { HighlightMatchOptions } from '../types';

function highlighted(
  text: string,
  query: string,
  options?: HighlightMatchOptions
) {
  return computeHighlightRanges(text, query, options).map((r) =>
    text.slice(r.start, r.end)
  );
}

describe('computeHighlightRanges', () => {
  it('fuzzy-matches a whole mistyped word and skips unrelated words', () => {
    expect(highlighted('Acma super zyntek', 'Acme zyntek')).toEqual([
      'Acma',
      'zyntek',
    ]);
  });

  it('highlights only the matched prefix, not the rest of a longer word', () => {
    const ranges = computeHighlightRanges('Acme super zyntek', 'Acm');
    expect(ranges).toEqual([{ start: 0, end: 3 }]);
  });

  it('is case-insensitive', () => {
    expect(highlighted('ACME ZYNTEK', 'acme')).toEqual(['ACME']);
  });

  it('does not tolerate typos in short words (< 4 chars)', () => {
    expect(highlighted('cat dog', 'cbt')).toEqual([]);
  });

  it('tolerates one substitution for medium words (4-7 chars)', () => {
    expect(highlighted('zyntek', 'zyntok')).toEqual(['zyntek']);
  });

  it('rejects a word once mismatches exceed the threshold', () => {
    expect(highlighted('zyntek', 'zqqte')).toEqual([]);
  });

  it('returns nothing for an empty or whitespace-only query', () => {
    expect(computeHighlightRanges('Acme zyntek', '')).toEqual([]);
    expect(computeHighlightRanges('Acme zyntek', '   ')).toEqual([]);
  });

  it('returns nothing for empty text', () => {
    expect(computeHighlightRanges('', 'acme')).toEqual([]);
  });

  it('matches target tokens regardless of query word order', () => {
    expect(highlighted('Acme zyntek', 'zyntek acme')).toEqual([
      'Acme',
      'zyntek',
    ]);
  });

  it('lets one query token match more than one target token', () => {
    expect(highlighted('super superb', 'super')).toEqual(['super', 'super']);
  });

  describe('mode: "contains"', () => {
    it('matches a query word starting anywhere inside a target word', () => {
      expect(highlighted('Lumen zyntek', 'tek', { mode: 'contains' })).toEqual([
        'tek',
      ]);
    });

    it('still matches at the start of a word (superset of prefix mode)', () => {
      expect(
        highlighted('Acma super zyntek', 'Acme zyntek', { mode: 'contains' })
      ).toEqual(['Acma', 'zyntek']);
    });

    it('is a no-op change for default (prefix) mode', () => {
      expect(highlighted('Lumen zyntek', 'tek')).toEqual([]);
    });
  });

  describe('diacritics', () => {
    it('ignores diacritics by default, matching either direction', () => {
      expect(highlighted('Café Zürich', 'cafe')).toEqual(['Café']);
      expect(highlighted('Cafe Zurich', 'café')).toEqual(['Cafe']);
    });

    it('can be made diacritic-sensitive via ignoreDiacritics: false', () => {
      // A short (< 4 char) word requires an exact match with no typo
      // tolerance at all, so a diacritic difference alone is enough to
      // demonstrate the option — at 4+ chars, the existing typo-tolerance
      // table would already forgive a single accent mismatch as "just
      // another substitution", independent of this option.
      expect(highlighted('día', 'dia', { ignoreDiacritics: false })).toEqual(
        []
      );
      expect(highlighted('día', 'dia')).toEqual(['día']);
      expect(highlighted('día', 'día', { ignoreDiacritics: false })).toEqual([
        'día',
      ]);
    });
  });

  describe('typoTolerance override', () => {
    it('can be made stricter than the default table', () => {
      // Default tolerance allows 1 substitution at this length; forcing 0
      // should reject what would otherwise be a fuzzy match.
      expect(highlighted('zyntek', 'zyntok')).toEqual(['zyntek']);
      expect(
        highlighted('zyntek', 'zyntok', { typoTolerance: () => 0 })
      ).toEqual([]);
    });

    it('can be made more lenient than the default table', () => {
      // Default tolerance rejects a 3-char word with any substitution.
      expect(highlighted('cat dog', 'cbt')).toEqual([]);
      expect(highlighted('cat dog', 'cbt', { typoTolerance: () => 1 })).toEqual(
        ['cat']
      );
    });
  });
});
