import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const zed: AppShortcuts = {
  slug: "zed",
  name: "Zed",
  category: "Code editor",
  platforms: [...platforms],
  intro:
    "Zed's default keymap is built around moving through a fast editor, opening the right panel, and keeping the terminal or agent close. These groups cover that path across macOS, Linux, and Windows.",
  versionContext:
    "Defaults from the built-in Zed base keymap as documented on zed.dev in August 2026. Any action can be remapped in keymap.json, and alternative base keymaps such as VS Code or JetBrains can be selected in settings.",
  sourceUrl: "https://zed.dev/docs/key-bindings",
  sourceLabel: "official key bindings",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "navigation",
      title: "Navigation and search",
      intro: "Jump to files, symbols, lines, commands, and search results inside the workspace.",
      shortcuts: [
        {
          id: "command-palette",
          action: "Open command palette",
          keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        },
        {
          id: "file-finder",
          action: "Open file finder",
          keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]),
        },
        {
          id: "goto-symbol-file",
          action: "Go to symbol in current file",
          keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]),
        },
        {
          id: "goto-symbol-project",
          action: "Search symbols across the project",
          keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]),
        },
        {
          id: "project-search",
          action: "Project-wide text search",
          keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        },
        {
          id: "text-finder",
          action: "Open Text Finder for quick project search",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Alt", "F"],
            macos: ["Alt", "Cmd", "F"],
            linux: ["Ctrl", "Alt", "F"],
          }),
        },
        {
          id: "goto-definition",
          action: "Go to definition",
          keys: combo(platforms, ["F12"]),
          note: "Ctrl+Click (Cmd+Click on macOS) also jumps to definition.",
        },
        {
          id: "find-references",
          action: "Find references",
          keys: combo(platforms, ["Alt", "Shift", "F12"]),
        },
        {
          id: "outline-panel",
          action: "Toggle outline panel",
          keys: combo(platforms, ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]),
        },
        {
          id: "tab-switcher",
          action: "Open tab switcher",
          keys: combo(platforms, ["Ctrl", "Tab"]),
          note: "Hold Ctrl and press Tab repeatedly to cycle; release Ctrl to confirm.",
        },
      ],
    },
    {
      id: "panels",
      title: "Panels and workspace",
      intro: "Open or focus the project panel, outline, diagnostics, and editor groups around the file.",
      shortcuts: [
        {
          id: "project-panel",
          action: "Toggle project panel",
          keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        },
        {
          id: "toggle-terminal",
          action: "Toggle terminal panel",
          keys: combo(platforms, ["Ctrl", "`"]),
        },
        {
          id: "new-terminal",
          action: "Open a new terminal",
          keys: combo(platforms, ["Ctrl", "~"]),
        },
        {
          id: "open-folder",
          action: "Open a folder",
          keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]),
        },
        {
          id: "open-settings",
          action: "Open settings editor",
          keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]),
        },
        {
          id: "theme-selector",
          action: "Open theme selector",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "K", "Ctrl", "T"],
            macos: ["Cmd", "K", "Cmd", "T"],
            linux: ["Ctrl", "K", "Ctrl", "T"],
          }),
          note: "Two-stroke chord.",
        },
        {
          id: "extensions",
          action: "Open extensions",
          keys: combo(platforms, ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        },
      ],
    },
    {
      id: "ai",
      title: "AI agent",
      intro: "Open the agent panel, start an inline assistant request, and change the model or context around it.",
      shortcuts: [
        {
          id: "agent-panel",
          action: "Open agent panel",
          keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]),
        },
        {
          id: "inline-assistant",
          action: "Open inline assistant",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
          note: "Works in editors and in the terminal.",
        },
        {
          id: "agent-new-thread",
          action: "New agent thread",
          keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]),
          note: "Focused in the agent panel.",
        },
        {
          id: "threads-sidebar",
          action: "Toggle threads sidebar",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Alt", "J"],
            macos: ["Cmd", "Option", "J"],
            linux: ["Ctrl", "Alt", "J"],
          }),
        },
        {
          id: "review-changes",
          action: "Review agent changes",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "R"],
            macos: ["Shift", "Ctrl", "R"],
            linux: ["Ctrl", "Shift", "R"],
          }),
          note: "macOS uses Shift+Ctrl+R, not Cmd.",
        },
        {
          id: "model-selector",
          action: "Toggle model selector",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Alt", "/"],
            macos: ["Cmd", "Alt", "/"],
            linux: ["Ctrl", "Alt", "/"],
          }),
        },
        {
          id: "add-selection-to-thread",
          action: "Add selection to agent thread",
          keys: combo(platforms, ["Ctrl", ">"], ["Cmd", ">"]),
        },
      ],
    },
    {
      id: "terminal",
      title: "Terminal",
      intro: "Clipboard and input modes inside the integrated terminal.",
      shortcuts: [
        {
          id: "terminal-copy",
          action: "Copy in terminal",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "C"],
            macos: ["Cmd", "C"],
            linux: ["Ctrl", "Shift", "C"],
          }),
        },
        {
          id: "terminal-paste",
          action: "Paste in terminal",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "V"],
            macos: ["Cmd", "V"],
            linux: ["Ctrl", "Shift", "V"],
          }),
        },
        {
          id: "clear-terminal",
          action: "Clear terminal screen",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "L"],
            macos: ["Cmd", "K"],
            linux: ["Ctrl", "Shift", "L"],
          }),
        },
        {
          id: "terminal-vi-mode",
          action: "Toggle vi-style navigation in terminal",
          keys: combo(platforms, ["Ctrl", "Shift", "Space"]),
        },
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Change text, select ranges, format code, and move through edits without leaving the editor.",
      shortcuts: [
        {
          id: "rename-symbol",
          action: "Rename symbol",
          keys: combo(platforms, ["F2"]),
          note: "Listed without platform qualifiers in the official VS Code migration guide.",
        },
      ],
    },
  ],
};
