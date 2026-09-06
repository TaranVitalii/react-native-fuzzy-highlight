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
    expect(highlighted('Nika super airmax', 'Nike airmax')).toEqual([
      'Nika',
      'airmax',
    ]);
  });

  it('highlights only the matched prefix, not the rest of a longer word', () => {
    const ranges = computeHighlightRanges('Nike super airmax', 'Nik');
    expect(ranges).toEqual([{ start: 0, end: 3 }]);
  });

  it('is case-insensitive', () => {
    expect(highlighted('NIKE AIRMAX', 'nike')).toEqual(['NIKE']);
  });

  it('does not tolerate typos in short words (< 4 chars)', () => {
    expect(highlighted('cat dog', 'cbt')).toEqual([]);
  });

  it('tolerates one substitution for medium words (4-7 chars)', () => {
    expect(highlighted('airmax', 'airnax')).toEqual(['airmax']);
  });

  it('rejects a word once mismatches exceed the threshold', () => {
    expect(highlighted('airmax', 'aqqax')).toEqual([]);
  });

  it('returns nothing for an empty or whitespace-only query', () => {
    expect(computeHighlightRanges('Nike airmax', '')).toEqual([]);
    expect(computeHighlightRanges('Nike airmax', '   ')).toEqual([]);
  });

  it('returns nothing for empty text', () => {
    expect(computeHighlightRanges('', 'nike')).toEqual([]);
  });

  it('matches target tokens regardless of query word order', () => {
    expect(highlighted('Nike airmax', 'airmax nike')).toEqual([
      'Nike',
      'airmax',
    ]);
  });

  it('lets one query token match more than one target token', () => {
    expect(highlighted('super superb', 'super')).toEqual(['super', 'super']);
  });

  describe('mode: "contains"', () => {
    it('matches a query word starting anywhere inside a target word', () => {
      expect(
        highlighted('New balance airmax', 'max', { mode: 'contains' })
      ).toEqual(['max']);
    });

    it('still matches at the start of a word (superset of prefix mode)', () => {
      expect(
        highlighted('Nika super airmax', 'Nike airmax', { mode: 'contains' })
      ).toEqual(['Nika', 'airmax']);
    });

    it('is a no-op change for default (prefix) mode', () => {
      expect(highlighted('New balance airmax', 'max')).toEqual([]);
    });
  });

  describe('typoTolerance override', () => {
    it('can be made stricter than the default table', () => {
      // Default tolerance allows 1 substitution at this length; forcing 0
      // should reject what would otherwise be a fuzzy match.
      expect(highlighted('airmax', 'airnax')).toEqual(['airmax']);
      expect(
        highlighted('airmax', 'airnax', { typoTolerance: () => 0 })
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
