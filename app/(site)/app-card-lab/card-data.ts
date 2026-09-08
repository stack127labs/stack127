// Read-only snapshot of public directory records, captured 2026-09-06.
// Keep these examples stable while comparing designs. No runtime production access.
export type CardFact = { label: string; value: string; estimated?: boolean };
export type CardSample = {
  family: "self-host" | "cli";
  name: string;
  summary: string;
  image: string;
  href: string;
  kind: string;
  categories: string[];
  maintenance: string | null;
  facts: CardFact[];
};

export const samples: CardSample[] = [
  {
    family: "self-host",
    name: "Home Assistant",
    summary: "Home automation hub for controlling devices, automations, dashboards, and local smart home integrations.",
    image: "https://tulgfrqamtcshdtmhvpx.supabase.co/storage/v1/object/public/stack127-media/directories/self-host-apps/icons/home-assistant-68851947cd10d971.png",
    href: "https://www.home-assistant.io",
    kind: "Self-hosted app",
    categories: ["home automation & iot"],
    maintenance: null,
    facts: [
      { label: "Source", value: "open source" },
      { label: "Pricing", value: "free to self-host" },
      { label: "RAM", value: "2-4gb" },
      { label: "Storage", value: "high" },
      { label: "Last update", value: "3 Jul 2026" },
    ],
  },
  {
    family: "cli",
    name: "Gemini CLI",
    summary: "Google's terminal coding agent for repo analysis, code edits, and task automation.",
    image: "https://tulgfrqamtcshdtmhvpx.supabase.co/storage/v1/object/public/stack127-media/directories/cli-apps/icons/gemini-cli-1898ba1b611f8ac4.png",
    href: "https://geminicli.com/",
    kind: "AI agent",
    categories: ["AI", "Development"],
    maintenance: null,
    facts: [
      { label: "Stars", value: "106.6K" },
      { label: "Pricing", value: "free" },
      { label: "License", value: "Apache-2.0" },
      { label: "Platforms", value: "linux, macos, windows" },
      { label: "Version", value: "unknown" },
      { label: "Last commit", value: "21 Aug 2026" },
    ],
  },
];

// Third full-detail sample for the selected Fact rows design, read 2026-09-06.
export const thirdSample: CardSample = {
  family: "cli",
  name: "Deno",
  summary: "A secure runtime for JavaScript and TypeScript with built-in tooling.",
  image: "https://tulgfrqamtcshdtmhvpx.supabase.co/storage/v1/object/public/stack127-media/directories/cli-apps/icons/deno-be3887d8f100af8e.png",
  href: "https://deno.com/",
  kind: "CLI",
  categories: ["Development"],
  maintenance: null,
  facts: [
    { label: "Stars", value: "108.3K" },
    { label: "Pricing", value: "free" },
    { label: "License", value: "MIT" },
    { label: "Platforms", value: "linux, macos, windows" },
    { label: "Version", value: "unknown" },
    { label: "Last commit", value: "21 Aug 2026" },
  ],
};
