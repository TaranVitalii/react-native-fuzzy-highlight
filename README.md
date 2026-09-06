# react-native-fuzzy-highlight

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/TaranVitalii/react-native-fuzzy-highlight/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/react-native-fuzzy-highlight.svg?style=flat&color=brightgreen)](https://www.npmjs.com/package/react-native-fuzzy-highlight)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/TaranVitalii/react-native-fuzzy-highlight/pulls)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-brightgreen.svg)](https://github.com/TaranVitalii/react-native-fuzzy-highlight)

Highlight the parts of a string that match a search query — tolerant of typos, without over-highlighting. Searching `Nike airmax` highlights `Nike` inside a mistyped `Nika`, highlights `airmax` wherever it appears, and leaves unrelated words alone. Typing just `Nik` highlights only `Nik` inside `Nike`, not the trailing `e`.

- **Typo-tolerant, per word** — each word of the query is matched independently against each word of the target text, so word order in the query doesn't matter.
- **Highlights only what matched** — a partial query (`Nik`) highlights only the matched prefix, not the rest of the word it's typing towards.
- **No over-matching on short words** — words under 4 characters require an exact prefix; typo tolerance only kicks in once there's enough signal to make it safe.
- **Headless core** — the matching logic is plain, framework-agnostic TypeScript (`computeHighlightRanges`); the React Native `<HighlightText>` component is a thin, memoized renderer on top.

## How it works

Both the query and the target text are split into words. Each target word is compared against every query word using an **anchored fuzzy-prefix match**: characters are compared from the start of both words, allowing a small number of substitutions before giving up — no insertions/deletions, so the match length is simply `min(query.length, target.length)`. That one rule produces both behaviors above for free:

- `"Nike"` vs `"Nika"` — same length, 1 substitution → the whole 4-character word is highlighted.
- `"Nik"` vs `"Nike"` — 3 characters compared, 0 substitutions → only those 3 characters are highlighted.

How many substitutions are tolerated scales with word length, so short words stay exact:

| Compared length | Typos tolerated |
| --- | --- |
| < 4 chars | 0 (exact prefix only) |
| 4–7 chars | 1 |
| ≥ 8 chars | 2 |

Matching and rendering are case-insensitive by default and independent of query word order — `"airmax nike"` matches the same words as `"nike airmax"`.

## Installation

```sh
npm install react-native-fuzzy-highlight
```

## Usage

```tsx
import { HighlightText } from 'react-native-fuzzy-highlight';

function ProductRow({ name, query }: { name: string; query: string }) {
  return (
    <HighlightText
      text={name}
      query={query}
      style={{ fontSize: 16 }}
      highlightStyle={{ backgroundColor: '#fff3a3', fontWeight: '700' }}
    />
  );
}
```

Inside a list, `<HighlightText>` is memoized and only recomputes its match when `text` or `query` actually change, so scrolling doesn't trigger extra work:

```tsx
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ProductRow name={item.name} query={query} />}
/>
```

### Headless matching

If you need custom rendering (e.g. non-`Text` output, or ranges merged with other formatting), use the hook or the plain function directly:

```tsx
import { useHighlightRanges, computeHighlightRanges } from 'react-native-fuzzy-highlight';

// inside a component, memoized on [text, query]
const ranges = useHighlightRanges(text, query);

// or outside React entirely
const ranges = computeHighlightRanges('Nika super airmax', 'Nike airmax');
// => [{ start: 0, end: 4 }, { start: 11, end: 17 }]
```

`HighlightRange` is `{ start: number; end: number }`, indexing into the original `text` string.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | The full text to render and search within. |
| `query` | `string` | — | The search query. Empty or whitespace-only query renders `text` unhighlighted. |
| `highlightStyle` | `StyleProp<TextStyle>` | — | Style applied only to matched segments. |
| `style` | `StyleProp<TextStyle>` | — | Style applied to the outer `Text`, same as a regular `<Text style>`. |
| ...rest | `TextProps` | — | Any other `Text` prop (`numberOfLines`, `onPress`, etc.) is passed through. |

## Roadmap

This is the v1 release: pure JS/TS, whitespace tokenization, Latin/Cyrillic-friendly case-folding. Planned next:

- Caching and scheduling optimizations for very large lists.
- Proper Unicode word segmentation for languages without spaces between words (CJK, Thai).
- Optional native renderer for pathological large-list cases.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
