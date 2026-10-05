import { Database, FilePenLine, Network } from "lucide-react";

/** Shared with the homepage so its count follows the displayed project list. */
export const labProjects = [
  {
    name: "BaseBuddy",
    kind: "Supabase CMS",
    description:
      "An open-source CMS with a WordPress-like editor for your existing Supabase or Postgres database.",
    icon: FilePenLine,
    website: "https://basebuddy.stack127.com",
    repository: "https://github.com/stack127labs/basebuddy",
  },
  {
    name: "DNS tools",
    kind: "open utilities",
    description: "The open-source DNS utilities that power stack127's DNS collection.",
    icon: Network,
    website: "https://stack127.com/dns-tools",
    repository: "https://github.com/stack127labs/dns-tools",
  },
  {
    name: "stack127 datasets",
    kind: "public datasets",
    description: "Versioned public data exports used by stack127 directories and tools.",
    icon: Database,
    website: "https://stack127.com/self-host-apps",
    repository: "https://github.com/stack127labs/stack127-datasets",
  },
] as const;
