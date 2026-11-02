import { resolveDatabaseUrl } from "../../stack127/tool-pages/lib.mjs";

// Editorial commands always resolve from the named env file. NODE_ENV and an
// inherited DATABASE_URL cannot silently send a manual claim/review to production.
export function databaseOptions(args) {
  for (const flag of ["dry-run", "apply-reviewed"]) {
    if (args[flag] !== undefined && args[flag] !== true) throw new Error(`--${flag} is a flag and does not accept a value`);
  }
  if (args["dry-run"] && (args["apply-reviewed"] || args.apply)) throw new Error("Use --dry-run or an apply flag, not both.");
  if (args.environment === "production" && args.confirm !== "stack127-production") {
    throw new Error("Production requires --confirm stack127-production, including previews.");
  }
  return resolveDatabaseUrl({ ...args, environment: args.environment ?? "development" });
}
