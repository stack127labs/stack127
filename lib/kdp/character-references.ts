const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  apos: "'",
  copy: "©",
  gt: ">",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  nbsp: "\u00a0",
  ndash: "–",
  quot: '"',
  rdquo: "”",
  rsquo: "’",
};

export function decodeKdpCharacterReferences(value: string): string {
  const decoded = value.replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]+);/giu, (entity, body: string) => {
    let replacement: string | undefined;
    if (body[0] === "#") {
      const hexadecimal = body[1]?.toLowerCase() === "x";
      const number = Number.parseInt(body.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      if (Number.isInteger(number) && number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)) {
        replacement = String.fromCodePoint(number);
      }
    } else {
      const name = body.toLowerCase();
      if (Object.hasOwn(NAMED_ENTITIES, name)) replacement = NAMED_ENTITIES[name];
    }
    if (replacement === undefined) return entity;
    return replacement;
  });
  return decoded;
}
