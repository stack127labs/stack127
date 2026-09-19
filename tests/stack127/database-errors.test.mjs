import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { observePoolErrors } from "../../lib/database-errors.ts";

test("idle connection errors are handled without logging credentials or queries", () => {
  const pool = Object.assign(new EventEmitter(), { totalCount: 4, idleCount: 1, waitingCount: 2 });
  const entries = [];
  observePoolErrors(pool, entry => entries.push(entry));
  assert.doesNotThrow(() => pool.emit("error", Object.assign(new Error("postgres://user:secret@host/db"), { code: "ECONNRESET", query: "private query" })));
  assert.deepEqual(entries, [{ event: "database_idle_connection_error", code: "ECONNRESET", total: 4, idle: 1, waiting: 2 }]);
  pool.emit("error", { code: "secret invalid value" });
  assert.equal(entries[1].code, "UNKNOWN");
});

test("the application pool installs the background error handler", () => {
  const source = readFileSync("lib/db.ts", "utf8");
  assert.match(source, /observePoolErrors\(globalForPg\.homeLabHqPgPool\)/);
  assert.match(source, /DATABASE_POOLER_URL\s*\|\|\s*process\.env\.DATABASE_URL/);
});
