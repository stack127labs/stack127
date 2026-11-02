export function maintenanceFrom(github, override, now = Date.now()) {
  if (override) return override.toLowerCase();
  if (github?.archived) return "archived";
  if (!github?.pushed_at) return "unknown";
  const pushedAt = new Date(github.pushed_at).getTime();
  const ageDays = (now - pushedAt) / (1000 * 60 * 60 * 24);
  if (Number.isNaN(ageDays)) return "unknown";
  if (ageDays < 110) return "active";
  if (ageDays < 395) return "slow";
  return "stale";
}

