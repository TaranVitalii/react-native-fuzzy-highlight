export interface Token {
  text: string;
  start: number;
  end: number;
}

const TOKEN_PATTERN = /\S+/g;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(input)) !== null) {
    tokens.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
}
