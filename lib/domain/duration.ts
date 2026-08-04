/**
 * Formats an approximate day count without ever producing impossible units
 * such as "12 months" alongside a year count.
 */
export function humanDuration(days: number) {
  const absolute = Math.abs(Math.round(days));
  if (absolute < 1) return "less than a day";
  if (absolute < 14) return `${absolute} day${absolute === 1 ? "" : "s"}`;
  if (absolute < 60) {
    const weeks = Math.round(absolute / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  if (absolute < 365) {
    const months = Math.min(11, Math.round(absolute / 30.44));
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  const years = Math.floor(absolute / 365);
  const months = Math.min(
    11,
    Math.round((absolute - years * 365) / 30.44),
  );
  if (!months) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
}
