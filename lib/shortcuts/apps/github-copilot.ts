import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const githubCopilot: AppShortcuts = {
  slug: "github-copilot",
  name: "GitHub Copilot",
  category: "AI coding assistant",
  platforms: [...platforms],
  versionContext:
    "GitHub's current shortcut page separates Visual Studio Code, JetBrains, Visual Studio, Eclipse, Vim/Neovim, and Xcode. This record uses the Visual Studio Code defaults for Windows, macOS, and Linux. Host keymaps and user rebinding can change the active commands.",
  sourceUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts?tool=vscode",
  sourceLabel: "official GitHub Copilot IDE keyboard shortcuts",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "inline-suggestions",
      title: "Inline suggestions",
      intro: "Accept, dismiss, move through, or request a suggestion, or open Copilot's separate suggestions pane while editing code.",
      shortcuts: [
        { id: "accept-suggestion", action: "Accept an inline suggestion", keys: combo(platforms, ["Tab"]) },
        { id: "dismiss-suggestion", action: "Dismiss an inline suggestion", keys: combo(platforms, ["Esc"]) },
        { id: "next-suggestion", action: "Show the next inline suggestion", keys: combo(platforms, ["Alt", "]"], ["Option", "]"]) },
        { id: "previous-suggestion", action: "Show the previous inline suggestion", keys: combo(platforms, ["Alt", "["], ["Option", "["]) },
        { id: "trigger-suggestion", action: "Trigger an inline suggestion", keys: combo(platforms, ["Alt", "\\"], ["Option", "\\"]) },
        {
          id: "open-copilot-pane",
          action: "Open GitHub Copilot for additional suggestions",
          keys: perPlatform(platforms, {
            macos: ["Ctrl", "Enter"],
            windows: ["Ctrl", "Enter"],
            linux: ["Ctrl", "Enter"],
          }),
          note: "GitHub's Visual Studio Code table publishes Ctrl+Enter for all three platforms. JetBrains uses Option or Alt+Enter instead.",
        },
      ],
    },
  ],
};

export default githubCopilot;
