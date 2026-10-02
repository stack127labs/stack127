"use client";

import { useMemo } from "react";
import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import type { ShortcutAppSummary } from "@/lib/shortcuts";
import { ShortcutsCheatSheetGenerator } from "./shortcuts-cheatsheet-generator";

function initialSlugs(value: string) {
  return value.split(",").map((slug) => slug.trim()).filter(Boolean);
}

// Reads ?apps= in the browser so the page stays static, then loads those apps' shortcuts.
export function ShortcutsCheatSheetGeneratorFromUrl({ catalog }: { catalog: readonly ShortcutAppSummary[] }) {
  const query = useInitialQuery();
  const apps = query.get("apps");
  const selectedSlugs = useMemo(() => {
    const knownSlugs = new Set<string>(catalog.map((app) => app.slug));
    return [...new Set(initialSlugs(apps))].filter((slug) => knownSlugs.has(slug));
  }, [apps, catalog]);

  return <ShortcutsCheatSheetGenerator catalog={catalog} initialSlugs={selectedSlugs} key={query.key} />;
}
