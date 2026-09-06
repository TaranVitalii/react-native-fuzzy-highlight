import { computeHighlightRanges } from '../computeHighlightRanges';

function highlighted(text: string, query: string) {
  return computeHighlightRanges(text, query).map((r) =>
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
});
