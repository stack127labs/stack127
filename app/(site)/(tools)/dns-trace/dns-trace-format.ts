export function sentenceFragment(value: string) {
  const trimmed = value.trim().replace(/[.!?]+$/, "");
  if (!trimmed) return "the trace could not continue";

  const firstWord = trimmed.match(/^\S+/)?.[0] ?? "";
  const hasAcronymCasing = /[A-Z0-9]/.test(firstWord.slice(1));
  return hasAcronymCasing
    ? trimmed
    : `${trimmed[0].toLocaleLowerCase()}${trimmed.slice(1)}`;
}
