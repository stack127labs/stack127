import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateDockerignore } from "../../lib/dockerignore/evaluate.ts";

const fixtureUrl = new URL("../../tests/pages/dockerignore-tester/fixtures/buildkit-parent-exception/", import.meta.url);
const receiptUrl = new URL("../../tests/pages/dockerignore-tester/fixtures/buildkit-current-receipt.json", import.meta.url);
const expectedFiles = [".dockerignore", "Dockerfile", "docs/README.md"];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function run(executable, args, cwd) {
  const result = spawnSync(executable, args, { cwd, encoding: "utf8" });
  return { ...result, combined: `${result.stdout}\n${result.stderr}` };
}

async function listFiles(root, folder = root) {
  const output = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(root, path));
    else output.push(relative(root, path));
  }
  return output.sort();
}

const fixturePath = fileURLToPath(fixtureUrl);
const actualFiles = await listFiles(fixturePath);
if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
  throw new Error(`Unexpected receipt context: ${actualFiles.join(", ")}`);
}
const fileRecords = {};
for (const name of expectedFiles) {
  const value = await readFile(join(fixturePath, name));
  fileRecords[name] = { sha256: sha256(value), bytes: value.byteLength };
}

const rules = await readFile(join(fixturePath, ".dockerignore"), "utf8");
const engineResult = evaluateDockerignore({ rules, paths: "docs/README.md", sourceMode: "root" });
if (engineResult.status !== "valid" || engineResult.rows[0]?.verdict !== "Included" || engineResult.rows[0]?.decidingLine !== 2) {
  throw new Error("The pure engine does not return Included at line 2.");
}

const temporaryRoot = await mkdtemp(join(tmpdir(), "stack127-buildkit-receipt-"));
const contextPath = join(temporaryRoot, "context");
const outputPath = join(temporaryRoot, "output");
try {
  await cp(fixturePath, contextPath, { recursive: true });
  await mkdir(outputPath);

  const engine = run("docker", ["version", "--format", "{{json .}}"], contextPath);
  if (engine.status !== 0) throw new Error(`Docker Engine version failed: ${engine.combined}`);
  const engineIdentity = JSON.parse(engine.stdout);

  const buildx = run("docker", ["buildx", "version"], contextPath);
  if (buildx.status !== 0) throw new Error(`Buildx version failed: ${buildx.combined}`);
  const buildxMatch = buildx.stdout.match(/\bv?\d+\.\d+\.\d+(?:[-+][^\s]+)?/u);
  if (!buildxMatch) throw new Error(`Buildx version was not parseable: ${buildx.stdout}`);

  const inspect = run("docker", ["buildx", "inspect", "--bootstrap"], contextPath);
  if (inspect.status !== 0) throw new Error(`BuildKit inspection failed: ${inspect.combined}`);
  const buildkitMatch = inspect.combined.match(/BuildKit(?:\s+version)?:\s*(v?\d+\.\d+\.\d+(?:[-+][^\s]+)?)/iu);
  if (!buildkitMatch) throw new Error(`BuildKit version was not parseable: ${inspect.combined}`);

  const args = [
    "buildx", "build", "--no-cache", "--pull=false", "--progress=plain",
    "--file", "Dockerfile", "--output", `type=local,dest=${outputPath}`, ".",
  ];
  const build = run("docker", args, contextPath);
  if (build.status !== 0) throw new Error(`BuildKit receipt failed: ${build.combined}`);
  if (!/COPY docs\/README\.md \/README\.md[\s\S]*DONE/iu.test(build.combined)) {
    throw new Error(`Build output did not prove COPY completion: ${build.combined}`);
  }
  const copied = await readFile(join(outputPath, "README.md"));
  const source = await readFile(join(contextPath, "docs/README.md"));
  if (!copied.equals(source)) throw new Error("Copied README differs from the fixture source.");

  const receipt = {
    schema: 1,
    caseId: "EC-006",
    capturedAtUtc: new Date().toISOString(),
    classification: "copy-succeeded",
    platform: { os: process.platform, architecture: process.arch },
    runtime: {
      engine: {
        version: engineIdentity.Server?.Version ?? engineIdentity.Client?.Version,
        commit: engineIdentity.Server?.GitCommit ?? engineIdentity.Client?.GitCommit,
        raw: engineIdentity,
      },
      buildkit: { version: buildkitMatch[1], inspect: inspect.stdout },
      buildx: { version: buildxMatch[0], output: buildx.stdout.trim() },
    },
    command: { executable: "docker", args, workingDirectoryKind: "isolated-temporary-context" },
    context: { files: fileRecords },
    engineComparison: { verdict: engineResult.rows[0].verdict, decidingLine: engineResult.rows[0].decidingLine },
    exitCode: build.status,
    outputSha256: sha256(build.combined),
    copiedFileSha256: sha256(copied),
    stdout: build.stdout,
    stderr: build.stderr,
  };
  if (process.argv.includes("--record")) await writeFile(receiptUrl, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`Verified EC-006 with Engine ${receipt.runtime.engine.version}, BuildKit ${receipt.runtime.buildkit.version}, Buildx ${receipt.runtime.buildx.version}.`);
} finally {
  const prefix = join(tmpdir(), "stack127-buildkit-receipt-");
  if (!temporaryRoot.startsWith(prefix)) throw new Error("Refusing to remove an unexpected receipt path.");
  await rm(temporaryRoot, { recursive: true, force: true });
}
