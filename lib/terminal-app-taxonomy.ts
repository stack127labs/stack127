export const terminalAppTypes = [
  "cli",
  "tui",
  "terminal_emulator",
  "shell",
  "multiplexer",
  "prompt",
  "launcher",
  "file_manager",
  "editor",
  "monitor",
  "ai_agent",
  "game",
  "mail",
  "browser",
  "media",
  "other",
] as const;

export type TerminalAppType = (typeof terminalAppTypes)[number];

export const terminalAppTypeLabels = new Map<string, string>([
  ["cli", "CLI tool"],
  ["tui", "TUI app"],
  ["terminal_emulator", "Terminal emulator"],
  ["shell", "Shell"],
  ["multiplexer", "Multiplexer"],
  ["prompt", "Prompt"],
  ["launcher", "Launcher"],
  ["file_manager", "File manager"],
  ["editor", "Editor"],
  ["monitor", "Monitor"],
  ["ai_agent", "AI agent"],
  ["game", "Game"],
  ["mail", "Mail client"],
  ["browser", "Terminal browser"],
  ["media", "Media"],
  ["other", "Other"],
]);

/** Reviewed category vocabulary. Slugs are stable; icons reuse CategoryIcon keys. */
export const terminalAppCategories = [
  { slug: "development", name: "Development", icon_key: "code-2" },
  { slug: "devops", name: "DevOps and cloud", icon_key: "server-cog" },
  { slug: "files", name: "Files and archives", icon_key: "folder-sync" },
  { slug: "text", name: "Text and documents", icon_key: "file-text" },
  { slug: "networking", name: "Networking", icon_key: "network" },
  { slug: "security", name: "Security", icon_key: "shield" },
  { slug: "monitoring", name: "Monitoring and system", icon_key: "activity" },
  { slug: "databases", name: "Databases", icon_key: "database" },
  { slug: "media-graphics", name: "Media and graphics", icon_key: "music" },
  { slug: "productivity", name: "Productivity", icon_key: "calendar" },
  { slug: "communication", name: "Communication", icon_key: "message" },
  { slug: "games-fun", name: "Games and fun", icon_key: "gamepad" },
  { slug: "terminal-ui", name: "Terminals and shells", icon_key: "screen-share" },
  { slug: "ai", name: "AI and agents", icon_key: "bot" },
] as const;

export const terminalAppCategoryBySlug = new Map(
  (terminalAppCategories as readonly { slug: string; name: string; icon_key: string }[]).map(
    (category) => [category.slug, category],
  ),
);

export function isValidTerminalCategory(slug: string) {
  return terminalAppCategoryBySlug.has(slug);
}
