import {
  getCachedHighlightRanges,
  clearHighlightRangesCache,
  MAX_ENTRIES,
} from '../highlightRangesCache';
import { computeHighlightRanges } from '../computeHighlightRanges';

describe('getCachedHighlightRanges', () => {
  beforeEach(() => {
    clearHighlightRangesCache();
  });

  it('returns results equal to the uncached function', () => {
    expect(
      getCachedHighlightRanges('Acma super zyntek', 'Acme zyntek')
    ).toEqual(computeHighlightRanges('Acma super zyntek', 'Acme zyntek'));
  });

  it('returns the same array reference for a repeated (text, query) pair', () => {
    const first = getCachedHighlightRanges('Acma super zyntek', 'Acme zyntek');
    const second = getCachedHighlightRanges('Acma super zyntek', 'Acme zyntek');
    expect(second).toBe(first);
  });

  it('does not collide when text/query boundaries shift', () => {
    const a = getCachedHighlightRanges('Acme super', 'flow');
    const b = getCachedHighlightRanges('Acme', 'super flow');
    expect(a).not.toBe(b);
    expect(a).toEqual(computeHighlightRanges('Acme super', 'flow'));
    expect(b).toEqual(computeHighlightRanges('Acme', 'super flow'));
  });

  it('recomputes (new reference) once a cleared cache forgets a pair', () => {
    const first = getCachedHighlightRanges('Acma super zyntek', 'Acme zyntek');
    clearHighlightRangesCache();
    const second = getCachedHighlightRanges('Acma super zyntek', 'Acme zyntek');
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it('evicts the least-recently-used entry once past capacity', () => {
    // Fill to exactly capacity, without ever re-reading item-0 — any read
    // would refresh its LRU position and invalidate this test.
    const oldest = getCachedHighlightRanges('item-0', 'acme');
    const second = getCachedHighlightRanges('item-1', 'acme');
    for (let i = 2; i < MAX_ENTRIES; i++) {
      getCachedHighlightRanges(`item-${i}`, 'acme');
    }

    // One more unique entry pushes past capacity; item-0 (least recently
    // used) is evicted, item-1 (inserted right after it) survives.
    getCachedHighlightRanges('item-overflow', 'acme');

    // Check item-1 first — re-querying item-0 below is itself a miss that
    // re-inserts it and evicts the new oldest entry, which would be item-1.
    expect(getCachedHighlightRanges('item-1', 'acme')).toBe(second);

    const recomputed = getCachedHighlightRanges('item-0', 'acme');
    expect(recomputed).toEqual(oldest);
    expect(recomputed).not.toBe(oldest);
  });

  it('bypasses the cache when matchOptions are given', () => {
    const options = { typoTolerance: () => 0 };
    const first = getCachedHighlightRanges('zyntek', 'zyntok', options);
    const second = getCachedHighlightRanges('zyntek', 'zyntok', options);
    expect(first).toEqual(computeHighlightRanges('zyntek', 'zyntok', options));
    expect(second).not.toBe(first);

    // Doesn't pollute the default (no-options) cache entry for the same pair.
    const defaultResult = getCachedHighlightRanges('zyntek', 'zyntok');
    expect(defaultResult).toEqual(computeHighlightRanges('zyntek', 'zyntok'));
  });
});
