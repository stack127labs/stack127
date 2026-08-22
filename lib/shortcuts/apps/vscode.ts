import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const vscode: AppShortcuts = {
  slug: "vscode",
  name: "Visual Studio Code",
  category: "Code editor",
  platforms: [...platforms],
  intro:
    "VS Code shortcuts keep navigation, editing, search, layout, files, and AI commands within the same working rhythm. This is the set to learn before adding your own keybindings.",
  versionContext:
    "Default keybindings as documented on code.visualstudio.com in August 2026 for a US keyboard layout. Every binding can be remapped in the Keyboard Shortcuts editor.",
  sourceUrl: "https://code.visualstudio.com/docs/reference/default-keybindings",
  sourceLabel: "official default keybindings",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Jump to files, symbols, lines, and definitions without touching the mouse.",
      shortcuts: [
        {
          id: "command-palette",
          action: "Open command palette",
          keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
          note: "F1 also opens it.",
        },
        {
          id: "quick-open-file",
          action: "Go to file (Quick Open)",
          keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]),
        },
        {
          id: "goto-symbol-file",
          action: "Go to symbol in file",
          keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]),
        },
        {
          id: "goto-line",
          action: "Go to line",
          keys: combo(platforms, ["Ctrl", "G"]),
          note: "Uses Ctrl even on macOS.",
        },
        { id: "goto-definition", action: "Go to definition", keys: combo(platforms, ["F12"]) },
        { id: "all-symbols", action: "Show all symbols", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "goto-symbol", action: "Go to symbol in workspace", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "next-error", action: "Go to next error or warning", keys: combo(platforms, ["F8"]) },
        { id: "previous-error", action: "Go to previous error or warning", keys: combo(platforms, ["Shift", "F8"]) },
        { id: "show-problems", action: "Show the Problems panel", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        {
          id: "navigate-back",
          action: "Go back",
          keys: perPlatform(platforms, {
            windows: ["Alt", "Left"],
            macos: ["Ctrl", "-"],
            linux: ["Ctrl", "Alt", "-"],
          }),
          note: "The cursor location history shortcut differs on every platform.",
        },
        {
          id: "navigate-forward",
          action: "Go forward",
          keys: perPlatform(platforms, { windows: ["Alt", "Right"], macos: ["Ctrl", "Shift", "-"], linux: ["Ctrl", "Shift", "Alt", "-"] }),
        },
      ],
    },
    {
      id: "search",
      title: "Search and replace",
      intro: "Search the current file or workspace, change the query, and move through results.",
      shortcuts: [
        {
          id: "find-in-file",
          action: "Find in current file",
          keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]),
        },
        {
          id: "replace-in-file",
          action: "Replace in current file",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "H"],
            macos: ["Alt", "Cmd", "F"],
            linux: ["Ctrl", "H"],
          }),
        },
        {
          id: "search-across-files",
          action: "Show project-wide search view",
          keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        },
        {
          id: "replace-in-files",
          action: "Replace in files",
          keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]),
        },
        { id: "next-search-result", action: "Focus the next search result", keys: combo(platforms, ["F4"]) },
        { id: "previous-search-result", action: "Focus the previous search result", keys: combo(platforms, ["Shift", "F4"]) },
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Change lines, format code, add cursors, rename symbols, and apply fixes without leaving the editor.",
      shortcuts: [
        {
          id: "toggle-line-comment",
          action: "Toggle line comment",
          keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]),
        },
        {
          id: "delete-line",
          action: "Delete line",
          keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        },
        {
          id: "insert-line-below",
          action: "Insert line below without moving the cursor",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        },
        {
          id: "move-line-down",
          action: "Move line down",
          keys: combo(platforms, ["Alt", "Down"]),
          note: "Use Up instead of Down to move the line up.",
        },
        {
          id: "copy-line-down",
          action: "Copy line down",
          keys: perPlatform(platforms, {
            windows: ["Shift", "Alt", "Down"],
            macos: ["Shift", "Option", "Down"],
            linux: ["Ctrl", "Shift", "Alt", "Down"],
          }),
          note: "Linux adds Ctrl compared with Windows and macOS.",
        },
        {
          id: "format-document",
          action: "Format document",
          keys: perPlatform(platforms, {
            windows: ["Shift", "Alt", "F"],
            macos: ["Shift", "Option", "F"],
            linux: ["Ctrl", "Shift", "I"],
          }),
        },
        { id: "rename-symbol", action: "Rename symbol", keys: combo(platforms, ["F2"]) },
        {
          id: "quick-fix",
          action: "Trigger quick fix",
          keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]),
        },
        {
          id: "add-cursor-next-match",
          action: "Add selection to next find match (multi-cursor)",
          keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]),
        },
        {
          id: "undo",
          action: "Undo",
          keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]),
        },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "trim-whitespace", action: "Trim trailing whitespace", keys: combo(platforms, ["Ctrl", "K", "Ctrl", "X"], ["Cmd", "K", "Cmd", "X"]) },
        { id: "change-language", action: "Change the language mode", keys: combo(platforms, ["Ctrl", "K", "M"], ["Cmd", "K", "M"]) },
      ],
    },
    {
      id: "layout",
      title: "Editors, panels, and terminal",
      intro: "Split editor groups, focus panels, open the terminal, and move the active editor around the workspace.",
      shortcuts: [
        {
          id: "split-editor",
          action: "Split editor",
          keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]),
        },
        {
          id: "close-editor",
          action: "Close editor",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "F4"],
            macos: ["Cmd", "W"],
            linux: ["Ctrl", "W"],
          }),
        },
        {
          id: "reopen-closed-editor",
          action: "Reopen closed editor",
          keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
        },
        {
          id: "toggle-sidebar",
          action: "Toggle sidebar visibility",
          keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]),
        },
        {
          id: "toggle-terminal",
          action: "Toggle integrated terminal",
          keys: combo(platforms, ["Ctrl", "`"]),
          note: "Uses Ctrl even on macOS.",
        },
        { id: "new-window", action: "Open a new window", keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]) },
        { id: "close-window", action: "Close the window", keys: perPlatform(platforms, { windows: ["Alt", "F4"], macos: ["Cmd", "Shift", "W"], linux: ["Ctrl", "Shift", "W"] }) },
        { id: "focus-first-group", action: "Focus the first editor group", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]) },
        { id: "focus-second-group", action: "Focus the second editor group", keys: combo(platforms, ["Ctrl", "2"], ["Cmd", "2"]) },
      ],
    },
    {
      id: "files",
      title: "Files and settings",
      intro: "Open files, change language or settings, save work, and reach the keyboard shortcuts editor.",
      shortcuts: [
        { id: "save", action: "Save", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        {
          id: "open-settings",
          action: "Open Settings",
          keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]),
        },
        { id: "open-keybindings", action: "Open Keyboard Shortcuts", keys: combo(platforms, ["Ctrl", "K", "Ctrl", "S"], ["Cmd", "K", "Cmd", "S"]) },
        { id: "select-theme", action: "Select a color theme", keys: combo(platforms, ["Ctrl", "K", "Ctrl", "T"], ["Cmd", "K", "Cmd", "T"]) },
        { id: "open-file", action: "Open a file", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
      ],
    },
    {
      id: "ai",
      title: "Copilot chat and AI",
      intro: "Built-in chat and inline AI actions in current VS Code.",
      shortcuts: [
        {
          id: "open-chat-view",
          action: "Open Chat view",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Alt", "I"],
            macos: ["Ctrl", "Cmd", "I"],
            linux: ["Ctrl", "Alt", "I"],
          }),
        },
        {
          id: "inline-chat",
          action: "Open inline chat in the editor",
          keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]),
          note: "The same binding starts inline chat in the integrated terminal.",
        },
      ],
    },
  ],
};
