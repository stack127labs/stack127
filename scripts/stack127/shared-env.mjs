import { execFileSync } from "node:child_process";
import { constants, realpathSync } from "node:fs";
import { link, lstat, mkdir, open, readFile, readdir, realpath, rename, rm, rmdir, symlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function sharedEnvDirectory(root = process.cwd()) {
  if (process.env.STACK127_ENV_DIR) return path.resolve(process.env.STACK127_ENV_DIR);
  const main = git(root, ["worktree", "list", "--porcelain", "-z"]).split("\0")[0];
  if (!main.startsWith("worktree ")) throw new Error("Could not find the main checkout.");
  return realpathSync(main.slice(9));
}

export function isPrivateEnvName(name) {
  return /^\.env(?:\.[a-zA-Z0-9_-]+)*$/.test(name)
    && !/(?:^|[.-])(?:example|backup|bak|orig|old|tmp|swp)(?:$|[.-])/i.test(name);
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

async function existing(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

function checkPrivate(info, file, directory = false) {
  if ((directory ? !info.isDirectory() : !info.isFile()) || (info.mode & 0o077)
    || (process.getuid && info.uid !== process.getuid())) {
    throw new Error(`Expected an owner-only ${directory ? "directory" : "file"}: ${file}`);
  }
}

async function checkStore(store, root) {
  const info = await lstat(store);
  const main = await realpath(git(root, ["worktree", "list", "--porcelain", "-z"]).split("\0")[0].slice(9));
  if (store === main) {
    if (!info.isDirectory() || (info.mode & 0o002) || (process.getuid && info.uid !== process.getuid())) {
      throw new Error(`Expected an owned main checkout without world write access: ${store}`);
    }
  } else checkPrivate(info, store, true);
  return main;
}

export async function resolvePrivateEnvFile(file, store = sharedEnvDirectory(path.dirname(path.resolve(file)))) {
  const info = await lstat(file);
  if (!info.isSymbolicLink()) {
    checkPrivate(info, file);
    return file;
  }
  store = await realpath(store);
  await checkStore(store, path.dirname(path.resolve(file)));
  const target = await realpath(file);
  if (target !== path.join(await realpath(store), path.basename(file))) {
    throw new Error(`Environment link points somewhere else: ${file}`);
  }
  checkPrivate(await lstat(target), target);
  return target;
}

export async function repositoryCheckouts(root = process.cwd()) {
  root = await realpath(git(root, ["rev-parse", "--show-toplevel"]));
  const entries = git(root, ["worktree", "list", "--porcelain", "-z"]).split("\0");
  const checkouts = [];
  for (const entry of entries.filter((value) => value.startsWith("worktree "))) {
    const checkout = entry.slice(9);
    if (!await existing(checkout)) continue;
    const pkg = JSON.parse(await readFile(path.join(checkout, "package.json"), "utf8"));
    if (pkg.name !== "stack127") throw new Error(`Expected a stack127 checkout: ${checkout}`);
    checkouts.push(await realpath(checkout));
  }
  return [...new Set(checkouts)];
}

async function namesIn(directory) {
  if (!await existing(directory)) return [];
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => isPrivateEnvName(entry.name) && (entry.isFile() || entry.isSymbolicLink()))
    .map((entry) => entry.name);
}

function checkIgnored(root, name) {
  if (git(root, ["ls-files", "--", name])) throw new Error(`Private environment file is tracked by Git: ${path.join(root, name)}`);
  try { git(root, ["check-ignore", "--quiet", "--", name]); }
  catch { throw new Error(`Private environment file must be ignored by Git: ${path.join(root, name)}`); }
}

async function bytes(file) {
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try { checkPrivate(await handle.stat(), file); return await handle.readFile(); }
  finally { await handle.close(); }
}

async function replaceWithLink(destination, source) {
  const temporary = `${destination}.tmp-${randomUUID()}`;
  await symlink(source, temporary);
  try { await rename(temporary, destination); }
  finally { await rm(temporary, { force: true }); }
}

async function withLockGuard(lock, action) {
  const guard = `${lock}.takeover`;
  for (let attempt = 0; ; attempt++) {
    try { await mkdir(guard, { mode: 0o700 }); break; }
    catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (attempt === 24) {
        throw new Error(`Another environment sync is running. Retry after it finishes. If no sync is running, remove the stale takeover guard: ${guard}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  try { return await action(); }
  finally { await rmdir(guard); }
}

async function staleLock(lock) {
  const info = await lstat(lock);
  checkPrivate(info, lock, true);
  let pid = null;
  try {
    const value = (await bytes(path.join(lock, "pid"))).toString();
    if (/^[1-9][0-9]*$/.test(value) && Number.isSafeInteger(Number(value))) pid = Number(value);
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  if (pid === null) return Date.now() - info.mtimeMs > 30_000;
  try { process.kill(pid, 0); return false; }
  catch (error) { return error.code === "ESRCH"; }
}

async function acquireLock(lock) {
  // Guard every acquisition and release, not just takeover: a new holder must
  // never appear while a contender is checking or removing an older lock.
  await withLockGuard(lock, async () => {
    if (await existing(lock)) {
      if (!await staleLock(lock)) throw new Error("Another environment sync is running. Retry after it finishes.");
      await rm(lock, { recursive: true });
    }
    await mkdir(lock, { mode: 0o700 });
    try {
      const temporary = path.join(lock, `pid.tmp-${randomUUID()}`);
      await writeFile(temporary, String(process.pid), { mode: 0o600, flag: "wx" });
      await rename(temporary, path.join(lock, "pid"));
    } catch (error) { await rm(lock, { recursive: true }); throw error; }
  });
  return () => withLockGuard(lock, () => rm(lock, { recursive: true }));
}

async function withEnvLock(options, action) {
  const root = options.root ?? process.cwd();
  let store = options.store ?? sharedEnvDirectory(root);
  store = await realpath(store).catch((error) => {
    if (error.code !== "ENOENT") throw error;
    return path.resolve(store);
  });
  const checkouts = await repositoryCheckouts(root);
  const main = checkouts[0];
  if (checkouts.some((checkout) => (store === checkout && store !== main) || store.startsWith(`${checkout}${path.sep}`))) {
    throw new Error("Shared environment storage must be the main checkout or outside all checkouts.");
  }
  if (process.platform === "darwin" && store !== main) {
    throw new Error("Mac environment files must stay in the mirrored main checkout.");
  }
  if (await existing(store)) await checkStore(store, root);
  // Keep the main-store lock compatible with the installed homelab timer.
  // All stores share this lock because they operate on the same checkouts.
  const lockDirectory = path.join(os.homedir(), ".config/stack127");
  await mkdir(lockDirectory, { recursive: true, mode: 0o700 });
  checkPrivate(await lstat(lockDirectory), lockDirectory, true);
  const lock = path.join(lockDirectory, "shared-env-sync-lock");
  const release = await acquireLock(lock);
  try { return await action({ root, store, main, checkouts }); }
  finally { await release(); }
}

// Check all copies under the lock before changing any file. Never combine differing values.
async function syncLocked({ store, checkouts }, { requireLocal = false } = {}) {
  const names = [...new Set((await Promise.all([namesIn(store), ...checkouts.map(namesIn)])).flat())].sort();
  if (requireLocal && !names.includes(".env.local")) throw new Error("Missing development environment: .env.local");
  const plans = [];
  for (const name of names) {
    const source = path.join(store, name);
    const candidates = [];
    if (await existing(source)) candidates.push(source);
    else if (process.platform === "darwin") {
      throw new Error(`Missing mirrored environment file: ${name}. Restore it from homelab; Mac setup cannot create it.`);
    }
    const destinations = [];
    for (const checkout of checkouts) {
      checkIgnored(checkout, name);
      const file = path.join(checkout, name);
      if (file === source) continue;
      const info = await existing(file);
      if (info?.isSymbolicLink()) {
        const target = await realpath(file);
        if (target !== source && !checkouts.some((other) => target === path.join(other, name))) {
          throw new Error(`Environment link points somewhere else: ${file}`);
        }
        candidates.push(target);
        destinations.push({ file, target });
      } else {
        if (info) candidates.push(file);
        destinations.push({ file, target: null, existed: Boolean(info) });
      }
    }
    let value;
    for (const candidate of new Set(candidates)) {
      const candidateValue = await bytes(candidate);
      if (value && !value.equals(candidateValue)) throw new Error(`Conflicting private copies of ${name}. All copies were left unchanged.`);
      value ??= candidateValue;
    }
    if (!value) throw new Error(`Missing shared environment file: ${name}`);
    plans.push({ name, source, value, destinations });
  }
  let linked = 0;
  await mkdir(store, { recursive: true, mode: 0o700 });
  for (const { source, value, destinations } of plans) {
    if (!await existing(source)) {
      // Publish only a complete file, without ever replacing an existing source.
      const temporary = `${source}.tmp-${randomUUID()}`;
      const handle = await open(temporary, "wx", 0o600);
      try {
        await handle.writeFile(value);
        await handle.sync();
        await link(temporary, source);
      } finally { await handle.close(); await rm(temporary, { force: true }); }
    }
    if (!(await bytes(source)).equals(value)) throw new Error(`Environment changed during sync: ${path.basename(source)}. Retry.`);
    for (const { file, target, existed } of destinations) {
      const current = await existing(file);
      if (current) {
        const currentTarget = current.isSymbolicLink() ? await realpath(file) : file;
        if (!(await bytes(currentTarget)).equals(value)) throw new Error(`Environment changed during sync: ${file}. Retry.`);
      } else if (target || existed) throw new Error(`Environment disappeared during sync: ${file}. Retry.`);
      if (current?.isSymbolicLink() && await realpath(file) === source) continue;
      if (current) await replaceWithLink(file, source);
      else await symlink(source, file);
      linked++;
    }
  }
  return { store, names, checkouts, linked };
}

export async function syncSharedEnvs(options = {}) {
  return withEnvLock(options, (context) => syncLocked(context, options));
}

export async function createSharedEnv(name, options = {}) {
  if (!isPrivateEnvName(name)) throw new Error("Use a private env filename, such as .env.domain-prices.");
  if (process.platform === "darwin") throw new Error("Create environment files on homelab, never on a Mac.");
  return withEnvLock(options, async (context) => {
    for (const checkout of context.checkouts) checkIgnored(checkout, name);
    await syncLocked(context, options);
    const handle = await open(path.join(context.store, name), "wx", 0o600);
    await handle.close();
    return syncLocked(context, options);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const command = args.shift() ?? "sync";
    const name = command === "create" ? args.shift() : null;
    const options = {};
    while (args.length) {
      const flag = args.shift();
      if (flag !== "--root" && flag !== "--store") throw new Error(`Unknown option: ${flag}`);
      const value = args.shift();
      if (!value) throw new Error(`Missing value for ${flag}`);
      options[flag.slice(2)] = value;
    }
    if (!["sync", "create"].includes(command)) throw new Error("Use sync or create .env.<name>.");
    const result = command === "create" ? await createSharedEnv(name ?? "", options) : await syncSharedEnvs(options);
    console.log(`Shared env files: ${result.names.length}. Checkouts: ${result.checkouts.length}. Links updated: ${result.linked}.`);
  } catch (error) {
    console.error(`Shared environment setup failed: ${error.message}`);
    process.exitCode = 1;
  }
}
