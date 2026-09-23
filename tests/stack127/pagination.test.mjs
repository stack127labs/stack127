import assert from "node:assert/strict";
import test from "node:test";
import { paginationPages } from "../../lib/pagination.ts";

test("pagination keeps nearby pages reachable without an ellipsis for one missing page", () => {
  assert.deepEqual(paginationPages(1, 1), [1]);
  assert.deepEqual(paginationPages(1, 5), [1, 2, null, 5]);
  assert.deepEqual(paginationPages(3, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(paginationPages(4, 12), [1, 2, 3, 4, 5, null, 12]);
  assert.deepEqual(paginationPages(12, 12), [1, null, 11, 12]);
});
