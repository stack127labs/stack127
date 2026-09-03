import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const githubCopilot: AppShortcuts = {
  slug: "github-copilot",
  name: "GitHub Copilot",
  category: "AI coding assistant",
  platforms: [...platforms],
  intro:
    "GitHub Copilot's documented keys live inside the host IDE. These entries use GitHub's current Visual Studio Code reference for inline suggestions and the separate pane, with the same suggestion controls also documented for JetBrains IDEs.",
  versionContext:
    "The official GitHub page separates Visual Studio Code, JetBrains, Visual Studio, Eclipse, Vim/Neovim, and Xcode. This record uses the Visual Studio Code defaults for Windows, macOS, and Linux. Host keymaps and user rebinding can change the active commands.",
  sourceUrl: "https://docs.github.com/en/copilot/reference/keyboard-shortcuts?tool=vscode",
  sourceLabel: "official GitHub Copilot IDE keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "inline-suggestions",
      title: "Inline suggestions",
      intro: "Accept, dismiss, move through, or request a Copilot suggestion while editing code in the host IDE.",
      shortcuts: [
        { id: "accept-suggestion", action: "Accept an inline suggestion", keys: combo(platforms, ["Tab"]) },
        { id: "dismiss-suggestion", action: "Dismiss an inline suggestion", keys: combo(platforms, ["Esc"]) },
        { id: "next-suggestion", action: "Show the next inline suggestion", keys: combo(platforms, ["Alt", "]"], ["Option", "]"]) },
        { id: "previous-suggestion", action: "Show the previous inline suggestion", keys: combo(platforms, ["Alt", "["], ["Option", "["]) },
        { id: "trigger-suggestion", action: "Trigger an inline suggestion", keys: combo(platforms, ["Alt", "\\"], ["Option", "\\"]) },
      ],
    },
    {
      id: "copilot-pane",
      title: "Copilot pane",
      intro: "Open the separate Copilot suggestions pane when the inline result is not the one you want to use.",
      shortcuts: [
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
    {
      id: "suggestion-navigation",
      title: "Suggestion navigation",
      intro: "Accept the next word or line when a longer completion is visible in the Copilot inline suggestion.",
      shortcuts: [
        {
          id: "accept-next-word",
          action: "Accept the next word of a suggestion",
          keys: perPlatform(platforms, {
            macos: ["Cmd", "Right"],
            windows: ["Ctrl", "Right"],
            linux: ["Ctrl", "Right"],
          }),
        },
        {
          id: "accept-next-line",
          action: "Accept the next line of a suggestion",
          keys: perPlatform(platforms, {
            macos: ["Cmd", "Ctrl", "Right"],
            windows: ["Ctrl", "Alt", "Right"],
            linux: ["Ctrl", "Alt", "Right"],
          }),
          note: "GitHub documents this command in its code-suggestions guide. The inline suggestion accept-next-line command may need a custom key binding in some host versions.",
        },
      ],
    },
  ],
};

export default githubCopilot;
