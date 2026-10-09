import type { UiChartPoint } from "./chart-option";

/**
 * Keeps the shape of a long line in fewer points (largest-triangle-three-buckets), so a big
 * series doesn't flood the page HTML. Use it on the server before passing points to a chart.
 */
export function thinPoints(points: readonly UiChartPoint[], target: number): UiChartPoint[] {
  if (target < 3 || points.length <= target) return [...points];
  const kept: UiChartPoint[] = [points[0]];
  const bucketSize = (points.length - 2) / (target - 2);
  let previous = 0;

  for (let bucket = 0; bucket < target - 2; bucket += 1) {
    const start = Math.floor(bucket * bucketSize) + 1;
    const end = Math.min(Math.floor((bucket + 1) * bucketSize) + 1, points.length - 1);
    const nextEnd = Math.min(Math.floor((bucket + 2) * bucketSize) + 1, points.length);

    let averageX = 0;
    let averageY = 0;
    for (let index = end; index < nextEnd; index += 1) {
      averageX += points[index][0];
      averageY += points[index][1];
    }
    const nextCount = Math.max(1, nextEnd - end);
    averageX /= nextCount;
    averageY /= nextCount;

    const [previousX, previousY] = points[previous];
    let largest = -1;
    let chosen = start;
    for (let index = start; index < end; index += 1) {
      const area = Math.abs((previousX - averageX) * (points[index][1] - previousY) - (previousX - points[index][0]) * (averageY - previousY));
      if (area > largest) {
        largest = area;
        chosen = index;
      }
    }
    kept.push(points[chosen]);
    previous = chosen;
  }

  kept.push(points[points.length - 1]);
  return kept;
}
