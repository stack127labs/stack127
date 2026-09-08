// Former routes verified against the tree before the August 2026 rename.
// Keep an explicit list: invented paths should still return 404.
const formerShortcutApps = [
  "brave", "chrome", "claude-code", "codex", "cursor", "excel", "figma",
  "firefox", "ghostty", "github", "gmail", "gnome", "google-sheets", "iterm2",
  "macos", "neovim", "notion", "opencode", "pi-coding-agent", "powershell",
  "slack", "vim", "vscode", "windows-terminal", "windows", "zed",
];

export const legacyShortcutRedirects = ["", ...formerShortcutApps].map((slug) => {
  const suffix = slug ? `/${slug}` : "";
  return {
    source: `/shortcuts${suffix}`,
    destination: `/keyboard-shortcuts${suffix}`,
    permanent: true as const,
  };
});
