type ObservedPool = {
  on(event: "error", listener: (error: unknown) => void): unknown;
  totalCount: number;
  idleCount: number;
  waitingCount: number;
};

export function observePoolErrors(
  pool: ObservedPool,
  report: (entry: Record<string, string | number>) => void = (entry) => console.error(JSON.stringify(entry)),
) {
  // pg removes the broken idle client itself. Handling this event prevents an
  // otherwise unhandled EventEmitter error; active query errors still reject.
  pool.on("error", (error) => {
    const rawCode = error && typeof error === "object" && "code" in error ? error.code : null;
    const code = typeof rawCode === "string" && /^[A-Z0-9_]{5,24}$/.test(rawCode) ? rawCode : "UNKNOWN";
    report({ event: "database_idle_connection_error", code, total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount });
  });
}
