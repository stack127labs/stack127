import directory from "./data/tld-directory.json" with { type: "json" };

export type TldType = "country-code" | "generic" | "infrastructure" | "sponsored";

const tldTypes = new Map(directory.rows.map((row) => [row.tld, row.type as TldType]));

export function tldTypeFor(tld: string): TldType | null {
  return tldTypes.get(tld.toLowerCase().replace(/^\./, "")) ?? null;
}
