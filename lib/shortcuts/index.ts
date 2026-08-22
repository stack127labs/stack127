import { shortcutCount, type AppShortcuts } from "./types.ts";

import { brave } from "./apps/brave.ts";
import { chrome } from "./apps/chrome.ts";
import { claudeCode } from "./apps/claude-code.ts";
import { codex } from "./apps/codex.ts";
import { cursor } from "./apps/cursor.ts";
import { excel } from "./apps/excel.ts";
import { figma } from "./apps/figma.ts";
import { firefox } from "./apps/firefox.ts";
import { ghostty } from "./apps/ghostty.ts";
import { github } from "./apps/github.ts";
import { gmail } from "./apps/gmail.ts";
import { gnome } from "./apps/gnome.ts";
import { googleSheets } from "./apps/google-sheets.ts";
import { iterm2 } from "./apps/iterm2.ts";
import { macos } from "./apps/macos.ts";
import { neovim } from "./apps/neovim.ts";
import { notion } from "./apps/notion.ts";
import { opencode } from "./apps/opencode.ts";
import { piCodingAgent } from "./apps/pi-coding-agent.ts";
import { powershell } from "./apps/powershell.ts";
import { slack } from "./apps/slack.ts";
import { vim } from "./apps/vim.ts";
import { vscode } from "./apps/vscode.ts";
import { windows } from "./apps/windows.ts";
import { windowsTerminal } from "./apps/windows-terminal.ts";
import { zed } from "./apps/zed.ts";

/** Every app in the reference, ordered by display name. */
export const shortcutApps: AppShortcuts[] = [
  brave,
  chrome,
  claudeCode,
  codex,
  cursor,
  excel,
  figma,
  firefox,
  ghostty,
  github,
  gmail,
  gnome,
  googleSheets,
  iterm2,
  macos,
  neovim,
  notion,
  opencode,
  piCodingAgent,
  powershell,
  slack,
  vim,
  vscode,
  windows,
  windowsTerminal,
  zed,
].sort((left, right) => left.name.localeCompare(right.name));

const appsBySlug = new Map(shortcutApps.map((app) => [app.slug, app]));

export function getShortcutApp(slug: string): AppShortcuts | undefined {
  return appsBySlug.get(slug);
}

/** Category names in a stable, curated order for the directory. */
export const shortcutCategories: string[] = [
  "Code editor",
  "AI code editor",
  "AI coding agent",
  "Text editor",
  "Web browser",
  "Operating system",
  "Desktop environment",
  "Terminal emulator",
  "Shell",
  "Code hosting platform",
  "Spreadsheet",
  "Email",
  "Team chat",
  "Notes and docs",
  "Design tool",
];

export function appsInCategory(category: string): AppShortcuts[] {
  return shortcutApps.filter((app) => app.category === category);
}

export { shortcutCount };
