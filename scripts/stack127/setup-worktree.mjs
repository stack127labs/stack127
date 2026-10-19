import { execFileSync, spawn } from "node:child_process";
import { access, lstat, mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { syncSharedEnvs } from "./shared-env.mjs";

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

async function existing(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

function run(root, command, args) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, NODE_ENV: "development" };
    delete env.STACK127_TEST_DIST_DIR;
    const child = spawn(command, args, { cwd: root, env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => code === 0
      ? resolve()
      : reject(new Error(`${path.basename(command)} ${args.join(" ")} ${signal ? `stopped by ${signal}` : `exited with code ${code}`}`)));
  });
}

export async function setupWorktree() {
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("Use Node.js 22 or newer for stack127 development.");
  const root = await realpath(git(process.cwd(), ["rev-parse", "--show-toplevel"]));
  const worktrees = git(root, ["worktree", "list", "--porcelain", "-z"]);
  const main = await realpath(process.env.T3CODE_PROJECT_ROOT ?? worktrees.split("\0")[0].slice("worktree ".length));
  const common = (checkout) => git(checkout, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (await realpath(common(root)) !== await realpath(common(main))) {
    throw new Error("T3CODE_PROJECT_ROOT must point to a checkout of this same repository.");
  }
  for (const checkout of new Set([root, main])) {
    const pkg = JSON.parse(await readFile(path.join(checkout, "package.json"), "utf8"));
    if (pkg.name !== "stack127") throw new Error(`Expected a stack127 checkout: ${checkout}`);
  }
  await access(path.join(root, "package-lock.json"));
  for (const name of ["node_modules", ".next", "tmp"]) {
    if ((await existing(path.join(root, name)))?.isSymbolicLink()) {
      throw new Error(`${name} must belong to this checkout, not be a shared link.`);
    }
  }

  const shared = await syncSharedEnvs({ root, requireLocal: true });
  await mkdir(path.join(root, "tmp"), { recursive: true });

  console.log(`Checkout: ${root}`);
  console.log(`Shared environment: ${shared.store}. Files: ${shared.names.length}. Links updated: ${shared.linked}.`);
  console.log("Installing this checkout's dependencies...");
  await run(root, "npm", ["ci", "--include=dev", "--no-audit", "--no-fund"]);
  console.log("Generating this checkout's Next.js types...");
  await run(root, process.execPath, ["node_modules/next/dist/bin/next", "typegen"]);
  for (const name of [".agents/skills", ".claude/skills"]) {
    await access(path.join(root, name));
  }
  console.log("Worktree ready. Use Dev and run or Build and run for a preview.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await setupWorktree(); }
  catch (error) { console.error(`Worktree setup failed: ${error.message}`); process.exitCode = 1; }
}
