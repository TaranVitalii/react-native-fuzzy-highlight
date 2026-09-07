export interface HighlightRange {
  start: number;
  end: number;
}

export type HighlightMatchMode = 'prefix' | 'contains';

export interface HighlightMatchOptions {
  /**
   * 'prefix' (default): a query word must match starting from the
   * beginning of a target word (typo-tolerant) — e.g. "Acm" matches "Acme".
   * 'contains': a query word may match starting anywhere inside a target
   * word — e.g. "tek" matches inside "zyntek".
   */
  mode?: HighlightMatchMode;
  /**
   * Overrides the built-in length-scaled typo-tolerance table. Receives the
   * number of characters actually compared and returns how many character
   * substitutions to tolerate before rejecting the match.
   */
  typoTolerance?: (comparedLength: number) => number;
  /**
   * Default true. Strips diacritics (accents, tildes, umlauts, etc.) from
   * both `text` and `query` before comparing, so e.g. a query of "cafe"
   * matches "café" and vice versa — the same "tolerant of superficial
   * differences" spirit as the built-in typo tolerance, just for a
   * different kind of superficial difference. Set false to require an
   * exact diacritic match.
   */
  ignoreDiacritics?: boolean;
}
