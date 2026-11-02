// Empty queues are healthy; a complete outage or more than 20% failed rows is not.
export function refreshFailed({ selected, refreshed, failed }) {
  return selected > 0 && (refreshed === 0 || failed * 100 > selected * 20);
}
