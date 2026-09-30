/** SQL LIKE uses these characters as patterns; users search for them literally. */
export function plannerSearchPattern(query: string) {
  return `%${query.replace(/[\\%_]/g, "\\$&")}%`;
}
