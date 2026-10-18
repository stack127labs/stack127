import { mkdir, chmod, chown, lstat } from 'node:fs/promises';
for (const path of ['/data', '/data/state']) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  if (!(await lstat(path)).isDirectory()) throw new Error('Runtime mount must be a directory');
  await chown(path, 1000, 1000); await chmod(path, 0o700);
}
