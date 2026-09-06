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
      getCachedHighlightRanges('Nika super airmax', 'Nike airmax')
    ).toEqual(computeHighlightRanges('Nika super airmax', 'Nike airmax'));
  });

  it('returns the same array reference for a repeated (text, query) pair', () => {
    const first = getCachedHighlightRanges('Nika super airmax', 'Nike airmax');
    const second = getCachedHighlightRanges('Nika super airmax', 'Nike airmax');
    expect(second).toBe(first);
  });

  it('does not collide when text/query boundaries shift', () => {
    const a = getCachedHighlightRanges('Nike air', 'max');
    const b = getCachedHighlightRanges('Nike', 'air max');
    expect(a).not.toBe(b);
    expect(a).toEqual(computeHighlightRanges('Nike air', 'max'));
    expect(b).toEqual(computeHighlightRanges('Nike', 'air max'));
  });

  it('recomputes (new reference) once a cleared cache forgets a pair', () => {
    const first = getCachedHighlightRanges('Nika super airmax', 'Nike airmax');
    clearHighlightRangesCache();
    const second = getCachedHighlightRanges('Nika super airmax', 'Nike airmax');
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it('evicts the least-recently-used entry once past capacity', () => {
    // Fill to exactly capacity, without ever re-reading item-0 — any read
    // would refresh its LRU position and invalidate this test.
    const oldest = getCachedHighlightRanges('item-0', 'nike');
    const second = getCachedHighlightRanges('item-1', 'nike');
    for (let i = 2; i < MAX_ENTRIES; i++) {
      getCachedHighlightRanges(`item-${i}`, 'nike');
    }

    // One more unique entry pushes past capacity; item-0 (least recently
    // used) is evicted, item-1 (inserted right after it) survives.
    getCachedHighlightRanges('item-overflow', 'nike');

    // Check item-1 first — re-querying item-0 below is itself a miss that
    // re-inserts it and evicts the new oldest entry, which would be item-1.
    expect(getCachedHighlightRanges('item-1', 'nike')).toBe(second);

    const recomputed = getCachedHighlightRanges('item-0', 'nike');
    expect(recomputed).toEqual(oldest);
    expect(recomputed).not.toBe(oldest);
  });
});
