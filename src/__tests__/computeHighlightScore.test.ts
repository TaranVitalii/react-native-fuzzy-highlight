import { computeHighlightScore } from '../computeHighlightScore';

describe('computeHighlightScore', () => {
  it('scores a perfect, complete match at 1', () => {
    expect(computeHighlightScore('Acme', 'Acme')).toBe(1);
    expect(computeHighlightScore('Acme zyntek', 'Acme zyntek')).toBe(1);
  });

  it('is order-independent, like computeHighlightRanges', () => {
    expect(computeHighlightScore('Acme zyntek', 'zyntek acme')).toBe(1);
  });

  it('scores 0 for no match at all', () => {
    expect(computeHighlightScore('Acme zyntek', 'unrelated')).toBe(0);
  });

  it('scores 0 for an empty or whitespace-only query, or empty text', () => {
    expect(computeHighlightScore('Acme', '')).toBe(0);
    expect(computeHighlightScore('Acme', '   ')).toBe(0);
    expect(computeHighlightScore('', 'Acme')).toBe(0);
  });

  it('scores lower for a typo-tolerant match than an exact one', () => {
    const exact = computeHighlightScore('zyntek', 'zyntek');
    const typo = computeHighlightScore('zyntek', 'zyntok'); // 1 substitution
    expect(typo).toBeLessThan(exact);
    expect(typo).toBeGreaterThan(0);
  });

  it('scores lower for a partial prefix match than a full-word match', () => {
    const full = computeHighlightScore('Acme', 'Acme');
    const partial = computeHighlightScore('Acme', 'Acm');
    expect(partial).toBeLessThan(full);
    expect(partial).toBeGreaterThan(0);
  });

  it('drags the average down when only some query words match', () => {
    // "acme" matches fully; "unrelated" matches nothing — average of 1 and 0.
    expect(computeHighlightScore('Acme zyntek', 'acme unrelated')).toBe(0.5);
  });

  it('lets one query word match its single best target word, not an average across all', () => {
    // "super" matches "super" exactly (not "superb", which is a worse,
    // partial match) — the score should reflect the best match found, not
    // be dragged down by a worse alternative also being present.
    expect(computeHighlightScore('super superb', 'super')).toBe(1);
  });

  describe('mode: "contains"', () => {
    it('scores a mid-word match that prefix mode would miss', () => {
      expect(computeHighlightScore('zyntek', 'tek')).toBe(0);
      const score = computeHighlightScore('zyntek', 'tek', {
        mode: 'contains',
      });
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('diacritics', () => {
    it('ignores diacritics by default', () => {
      expect(computeHighlightScore('café', 'cafe')).toBe(1);
    });

    it('respects ignoreDiacritics: false', () => {
      // Short word, no ambient typo tolerance to fall back on — see the
      // equivalent computeHighlightRanges test for why this example (rather
      // than a 4+ char word) is needed to isolate the option's effect.
      expect(
        computeHighlightScore('día', 'dia', { ignoreDiacritics: false })
      ).toBe(0);
    });
  });

  describe('typoTolerance override', () => {
    it('rejects (score 0) what the default table would have tolerated', () => {
      expect(computeHighlightScore('zyntek', 'zyntok')).toBeGreaterThan(0);
      expect(
        computeHighlightScore('zyntek', 'zyntok', { typoTolerance: () => 0 })
      ).toBe(0);
    });
  });
});
