import { stripDiacritics } from '../diacritics';

describe('stripDiacritics', () => {
  it('strips common Latin accents', () => {
    expect(stripDiacritics('café')).toBe('cafe');
    expect(stripDiacritics('naïve')).toBe('naive');
    expect(stripDiacritics('piñata')).toBe('pinata');
    expect(stripDiacritics('Zürich')).toBe('Zurich');
  });

  it('leaves plain ASCII untouched', () => {
    expect(stripDiacritics('Acme zyntek')).toBe('Acme zyntek');
  });

  it('preserves string length so match positions stay aligned', () => {
    const input = 'café';
    expect(stripDiacritics(input).length).toBe(input.length);
  });

  it('leaves a character untouched when its decomposition is not exactly one base character', () => {
    // A Hangul syllable decomposes (NFD) into multiple Jamo characters, none
    // of which are combining marks — stripping marks doesn't collapse it
    // back to a single character, so the 1:1-length-preservation fallback
    // keeps the original character rather than expanding "1 char in" into
    // "2 chars out", which would misalign match positions.
    expect(stripDiacritics('가')).toBe('가');
    expect(stripDiacritics('가').length).toBe(1);
  });
});
