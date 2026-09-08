export type SerialComparison = "same" | "left-newer" | "right-newer" | "undefined";

export function compareSerials(left: number, right: number): SerialComparison {
  const modulo = 2 ** 32;
  const halfRange = 2 ** 31;
  const delta = ((left - right) % modulo + modulo) % modulo;
  if (delta === 0) return "same";
  if (delta === halfRange) return "undefined";
  return delta < halfRange ? "left-newer" : "right-newer";
}
