import { spawnSync } from 'node:child_process';

export function checkRuntimeExecutables(execute = spawnSync) {
  const executables = ['curl', 'flock'];
  for (const command of executables) {
    const result = execute(command, ['--version'], { stdio: 'ignore', timeout: 5000 });
    if (result.error || result.status !== 0) throw new Error(`Required runtime executable unavailable: ${command}`);
  }
  return { executables };
}
