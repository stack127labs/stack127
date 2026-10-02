import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

const root = new URL("../../", import.meta.url);

// Node's type stripping does not resolve the aliases or extensionless imports used by Next.js.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith("@/")
      ? new URL(specifier.slice(2), root)
      : specifier.startsWith(".") && context.parentURL
        ? new URL(specifier, context.parentURL)
        : null;
    if (target?.protocol === "file:") {
      for (const suffix of [".ts", "/index.ts"]) {
        const candidate = new URL(target.href + suffix);
        if (existsSync(candidate)) return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});
