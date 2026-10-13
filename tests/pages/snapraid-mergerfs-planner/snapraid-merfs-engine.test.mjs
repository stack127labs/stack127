import assert from "node:assert/strict";
import test from "node:test";
import {
  MERGERFS_POLICY_OPTIONS,
  STANDARD_EXCLUDES,
  buildSnapraidMergerfsPlan,
  parseCapacity,
} from "../../../app/(site)/(tools)/snapraid-mergerfs-planner/snapraid-merfs-engine.ts";

const baseline = () => ({
  data: [
    { path: "/mnt/disk1", capacity: "8", unit: "TB" },
    { path: "/mnt/disk2", capacity: "8", unit: "TB" },
    { path: "/mnt/disk3", capacity: "4", unit: "TB" },
    { path: "/mnt/disk4", capacity: "12", unit: "TB" },
  ],
  parity: [{ path: "/mnt/parity1", capacity: "12", unit: "TB" }],
  content: ["/mnt/disk1/.snapraid.content", "/mnt/disk2/.snapraid.content"],
  poolPath: "/mnt/storage",
  policy: "balanced",
  blocksize: 256,
  standardExcludes: true,
});

function ready(overrides = {}) {
  const result = buildSnapraidMergerfsPlan({ ...baseline(), ...overrides });
  assert.equal(result.status, "ready");
  return result;
}

test("FF-001 creates exact data-only branches and deterministic config", () => {
  const result = ready();
  assert.equal(result.dataTotalBytes, 32_000_000_000_000n);
  assert.equal(result.largestDataBytes, 12_000_000_000_000n);
  assert.equal(result.parityTotalBytes, 12_000_000_000_000n);
  assert.equal(result.contentMinimum, 2);
  assert.equal(result.fstabLine, "/mnt/disk1:/mnt/disk2:/mnt/disk3:/mnt/disk4 /mnt/storage fuse.mergerfs defaults,allow_other,cache.files=off,dropcacheonclose=true,category.create=epmfs,func.getattr=newest,moveonenospc=true,minfreespace=4G,fsname=mergerfs 0 0");
  assert.match(result.snapraidConfig, /^parity \/mnt\/parity1\/snapraid\.parity\n/);
  assert.match(result.snapraidConfig, /content \/mnt\/disk1\/.snapraid\.content/);
  assert.match(result.snapraidConfig, /data d1 \/mnt\/disk1/);
  assert.match(result.snapraidConfig, /blocksize 256/);
  for (const pattern of STANDARD_EXCLUDES) assert.ok(result.snapraidConfig.includes(`exclude ${pattern}`));
  assert.equal(result.snapraidConfig.endsWith("\n"), true);
  assert.doesNotMatch(result.fstabLine, /parity|snapraid\.content/);
  assert.equal(result.snapraidConfig, ready().snapraidConfig);
});

test("FF-002 renders three parity levels and the most-free preset", () => {
  const result = ready({
    data: [
      { path: "/mnt/disk1", capacity: "8", unit: "TiB" },
      { path: "/mnt/disk2", capacity: "8", unit: "TiB" },
    ],
    parity: [
      { path: "/mnt/parity1", capacity: "8", unit: "TiB" },
      { path: "/mnt/parity2", capacity: "8", unit: "TiB" },
      { path: "/mnt/parity3", capacity: "9", unit: "TiB" },
    ],
    content: ["/srv/content1/.content", "/srv/content2/.content", "/srv/content3/.content", "/srv/content4/.content"],
    policy: "most-free",
    blocksize: 512,
    standardExcludes: false,
  });
  assert.match(result.snapraidConfig, /^parity \/mnt\/parity1\/snapraid\.parity$/m);
  assert.match(result.snapraidConfig, /^2-parity \/mnt\/parity2\/snapraid\.parity$/m);
  assert.match(result.snapraidConfig, /^3-parity \/mnt\/parity3\/snapraid\.parity$/m);
  assert.match(result.fstabLine, /category\.create=mfs/);
  assert.match(result.snapraidConfig, /blocksize 512/);
  assert.doesNotMatch(result.snapraidConfig, /^exclude /m);
});

test("rejects parity smaller than the largest data disk and withholds output", () => {
  const result = buildSnapraidMergerfsPlan({ ...baseline(), parity: [{ path: "/mnt/parity1", capacity: "11", unit: "TB" }] });
  assert.equal(result.status, "invalid");
  assert.match(result.errors["parity.0.capacity"], /smaller than data/);
  assert.equal(result.snapraidConfig, null);
  assert.equal(result.fstabLine, null);
});

test("rejects data-parity overlap, pool recursion, and nested data paths", () => {
  for (const overrides of [
    { parity: [{ path: "/mnt/disk1/parity", capacity: "12", unit: "TB" }] },
    { poolPath: "/mnt/disk1/pool" },
    { data: [...baseline().data.slice(0, 3), { path: "/mnt/disk1/films", capacity: "8", unit: "TB" }] },
  ]) {
    const result = buildSnapraidMergerfsPlan({ ...baseline(), ...overrides });
    assert.equal(result.status, "invalid");
    assert.equal(result.snapraidConfig, null);
    assert.equal(result.fstabLine, null);
  }
});

test("rejects malformed capacity rather than silently reducing the inventory", () => {
  for (const capacity of ["8, nope", "8e1", "+8", "8 0", "0.0000000000001"]) {
    const data = baseline().data.map((row, index) => index === 0 ? { ...row, capacity } : row);
    const result = buildSnapraidMergerfsPlan({ ...baseline(), data });
    assert.equal(result.status, "invalid", capacity);
    assert.match(result.errors["data.0.capacity"], /capacity|byte/i);
    assert.equal(result.snapraidConfig, null);
  }
});

test("enforces content minimum, uniqueness, known-root separation, and pool boundary", () => {
  const tooFew = buildSnapraidMergerfsPlan({ ...baseline(), parity: [...baseline().parity, { path: "/mnt/parity2", capacity: "12", unit: "TB" }] });
  assert.equal(tooFew.status, "invalid");
  assert.match(tooFew.errors.content, /Need 3 content files/);

  const reusedRoots = buildSnapraidMergerfsPlan({
    ...baseline(),
    parity: [...baseline().parity, { path: "/mnt/parity2", capacity: "12", unit: "TB" }],
    content: ["/mnt/disk1/a", "/mnt/disk1/b", "/mnt/disk2/c"],
  });
  assert.equal(reusedRoots.status, "invalid");
  assert.match(reusedRoots.errors.content, /not distinct enough/);

  const poolContent = buildSnapraidMergerfsPlan({ ...baseline(), content: ["/mnt/storage/.content", "/mnt/disk2/.content"] });
  assert.equal(poolContent.status, "invalid");
  assert.match(Object.values(poolContent.errors).join(" "), /overlaps pool/);
});

test("accepts exact whole-byte TB and TiB values and rejects unsafe path grammar", () => {
  assert.equal(parseCapacity("1", "TB"), 1_000_000_000_000n);
  assert.equal(parseCapacity("0.5", "TiB"), 549_755_813_888n);
  assert.throws(() => parseCapacity("0.0000000000001", "TB"));
  for (const path of ["/mnt/a:b", "/mnt/a,b", "/mnt/a\\b", "/mnt/a/../b", "/mnt/a\nparity", "/mnt/a//b", "relative/path"]) {
    const result = buildSnapraidMergerfsPlan({ ...baseline(), data: [{ ...baseline().data[0], path }, ...baseline().data.slice(1)] });
    assert.equal(result.status, "invalid", path);
  }
});

test("allows only the two exact policy presets and preserves variant output", () => {
  assert.equal(Object.keys(MERGERFS_POLICY_OPTIONS).sort().join(","), "balanced,most-free");
  const invalid = buildSnapraidMergerfsPlan({ ...baseline(), policy: "balanced,exec=evil\nparity /tmp/x" });
  assert.equal(invalid.status, "invalid");
  const variant = ready({ policy: "most-free", blocksize: 1024, standardExcludes: false });
  assert.match(variant.fstabLine, /category\.create=mfs/);
  assert.match(variant.snapraidConfig, /blocksize 1024/);
  assert.doesNotMatch(variant.snapraidConfig, /^exclude /m);
});

test("normalizes one trailing slash and rejects root-only content", () => {
  const result = ready({
    data: baseline().data.map((row) => ({ ...row, path: `${row.path}/` })),
    parity: [{ path: "/mnt/parity1/", capacity: "12", unit: "TB" }],
    poolPath: "/mnt/storage/",
    content: ["/mnt/disk1/.content/", "/mnt/disk2/.content/"],
  });
  assert.match(result.fstabLine, /^\/mnt\/disk1:\/mnt\/disk2/);
  assert.doesNotMatch(result.fstabLine, /\/mnt\/disk1\/ /);
  const rootContent = buildSnapraidMergerfsPlan({ ...baseline(), content: ["/", "/mnt/disk2/.content"] });
  assert.equal(rootContent.status, "invalid");
});

test("collects malformed inputs, keeps the engine local, and does not mutate input", () => {
  const input = Object.freeze(baseline());
  const result = buildSnapraidMergerfsPlan({ ...input, data: input.data.map((row) => ({ ...row })) });
  assert.equal(result.status, "ready");
  assert.equal(input.data[0].path, "/mnt/disk1");
  for (const candidate of [null, [], { ...baseline(), unknown: true }, { ...baseline(), standardExcludes: "yes" }]) {
    const invalid = buildSnapraidMergerfsPlan(candidate);
    assert.equal(invalid.status, "invalid");
    assert.equal(invalid.snapraidConfig, null);
  }
});

test("handles the maximum inventory within the local engine budget", () => {
  const data = Array.from({ length: 42 }, (_, index) => ({ path: `/mnt/disk${index + 1}`, capacity: "8", unit: "TB" }));
  const parity = [1, 2, 3].map((index) => ({ path: `/mnt/parity${index}`, capacity: "8", unit: "TB" }));
  const content = Array.from({ length: 12 }, (_, index) => `/mnt/disk${index + 1}/.content`);
  const input = { ...baseline(), data, parity, content };
  const durations = [];
  let result;
  for (let index = 0; index < 10; index += 1) {
    const started = performance.now();
    result = buildSnapraidMergerfsPlan(input);
    durations.push(performance.now() - started);
  }
  assert.equal(result.status, "ready");
  durations.sort((a, b) => a - b);
  assert.ok(durations[8] < 50, `p95 engine duration was ${durations[8]}ms`);
  assert.equal(result.normalized.data.length, 42);
  assert.equal(result.normalized.content.length, 12);
});
