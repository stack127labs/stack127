import { execFileSync, spawn } from "node:child_process";
import { access, lstat, mkdir, readFile, realpath, stat, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const envFiles = [
  ".env.local", ".env.database", ".env.deploy", ".env.analytics",
  ".env.homelab", ".env.repos", ".env.affiliate", ".env.search",
];

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

async function existing(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

async function checkEnvironmentFile(file) {
  const info = await stat(file);
  if (!info.isFile()) throw new Error(`Expected an environment file: ${file}`);
  if ((info.mode & 0o077) !== 0) throw new Error(`Environment file must be private. Run chmod 600 on ${file}`);
  await access(file);
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

  // Inspect every destination before creating links. Existing local files stay intact.
  const links = [];
  const missing = [];
  for (const name of envFiles) {
    const destination = path.join(root, name);
    const current = await existing(destination);
    const source = path.join(main, name);
    if (current) {
      if (current.isSymbolicLink() && root !== main && await realpath(destination) !== await realpath(source)) {
        throw new Error(`Environment link points somewhere else: ${destination}`);
      }
      await checkEnvironmentFile(destination);
      continue;
    }
    if (!await existing(source)) {
      if (name === ".env.local") throw new Error(`Missing development environment: ${source}`);
      missing.push(name);
      continue;
    }
    await checkEnvironmentFile(source);
    links.push({ source, destination });
  }
  for (const { source, destination } of links) await symlink(source, destination);
  await mkdir(path.join(root, "tmp"), { recursive: true });

  console.log(`Checkout: ${root}`);
  console.log(`Environment files linked: ${links.length}. Existing files preserved.`);
  if (missing.length) console.log(`Optional environment files unavailable: ${missing.join(", ")}`);
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
