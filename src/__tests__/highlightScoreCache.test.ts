import {
  getCachedHighlightScore,
  clearHighlightScoreCache,
  MAX_ENTRIES,
} from '../highlightScoreCache';
import { computeHighlightScore } from '../computeHighlightScore';

describe('getCachedHighlightScore', () => {
  beforeEach(() => {
    clearHighlightScoreCache();
  });

  it('returns results equal to the uncached function', () => {
    expect(getCachedHighlightScore('Acme zyntek', 'acme')).toEqual(
      computeHighlightScore('Acme zyntek', 'acme')
    );
  });

  it('does not collide when text/query boundaries shift', () => {
    const a = getCachedHighlightScore('Acme super', 'flow');
    const b = getCachedHighlightScore('Acme', 'super flow');
    expect(a).toEqual(computeHighlightScore('Acme super', 'flow'));
    expect(b).toEqual(computeHighlightScore('Acme', 'super flow'));
  });

  it('evicts the least-recently-used entry once past capacity', () => {
    getCachedHighlightScore('item-0', 'acme');
    getCachedHighlightScore('item-1', 'acme');
    for (let i = 2; i < MAX_ENTRIES; i++) {
      getCachedHighlightScore(`item-${i}`, 'acme');
    }

    getCachedHighlightScore('item-overflow', 'acme');

    expect(getCachedHighlightScore('item-1', 'acme')).toBe(
      computeHighlightScore('item-1', 'acme')
    );
  });

  it('bypasses the cache when matchOptions are given', () => {
    const options = { typoTolerance: () => 0 };
    const result = getCachedHighlightScore('zyntek', 'zyntok', options);
    expect(result).toEqual(computeHighlightScore('zyntek', 'zyntok', options));

    // Doesn't pollute the default (no-options) cache entry for the same pair.
    const defaultResult = getCachedHighlightScore('zyntek', 'zyntok');
    expect(defaultResult).toEqual(computeHighlightScore('zyntek', 'zyntok'));
  });
});
