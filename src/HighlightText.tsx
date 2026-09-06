import { memo, useMemo } from 'react';
import { Text } from 'react-native';
import type { StyleProp, TextProps, TextStyle } from 'react-native';
import { useHighlightRanges } from './useHighlightRanges';
import type { HighlightMatchOptions } from './types';

export interface HighlightTextProps extends Omit<TextProps, 'children'> {
  text: string;
  query: string;
  highlightStyle?: StyleProp<TextStyle>;
  matchOptions?: HighlightMatchOptions;
}

interface Segment {
  text: string;
  highlighted: boolean;
}

function buildSegments(
  text: string,
  ranges: { start: number; end: number }[]
): Segment[] {
  if (ranges.length === 0) {
    return [{ text, highlighted: false }];
  }

  const segments: Segment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({
        text: text.slice(cursor, range.start),
        highlighted: false,
      });
    }
    segments.push({
      text: text.slice(range.start, range.end),
      highlighted: true,
    });
    cursor = range.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
}

function HighlightTextComponent({
  text,
  query,
  style,
  highlightStyle,
  matchOptions,
  accessibilityLabel,
  ...rest
}: HighlightTextProps) {
  const ranges = useHighlightRanges(text, query, matchOptions);
  const segments = useMemo(() => buildSegments(text, ranges), [text, ranges]);

  return (
    <Text
      style={style}
      accessibilityLabel={accessibilityLabel ?? text}
      {...rest}
    >
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <Text key={index} style={highlightStyle}>
            {segment.text}
          </Text>
        ) : (
          segment.text
        )
      )}
    </Text>
  );
}

export const HighlightText = memo(HighlightTextComponent);
