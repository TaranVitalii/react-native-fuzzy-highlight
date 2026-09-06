import { computeHighlightRanges } from '../computeHighlightRanges';

function highlighted(text: string, query: string) {
  return computeHighlightRanges(text, query).map((r) =>
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
});
