import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const sublimeText: AppShortcuts = {
  slug: "sublime-text",
  name: "Sublime Text",
  category: "Code editor",
  platforms: [...platforms],
  intro:
    "Sublime Text's current community documentation publishes separate Windows/Linux and macOS tables for editing, navigation, builds, search, tabs, folding, and bookmarks.",
  versionContext:
    "Sublime Text keyboard shortcut tables checked September 1, 2026. Windows and Linux share most bindings, while macOS changes the primary modifier and a few editing commands.",
  sourceUrl: "https://docs.sublimetext.io/reference/keyboard_shortcuts_win.html",
  sourceLabel: "official Sublime Text keyboard shortcut reference",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing",
      intro: "Editing shortcuts manipulate lines, selections, indentation, comments, completion, and the undo history in the active view.",
      shortcuts: [
        { id: "cut-line", action: "Cut the current line", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "insert-after", action: "Insert a line after the current line", keys: perPlatform(platforms, { windows: ["Ctrl", "Enter"], linux: ["Ctrl", "Enter"], macos: ["Cmd", "Return"] }) },
        { id: "insert-before", action: "Insert a line before the current line", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Enter"], linux: ["Ctrl", "Shift", "Enter"], macos: ["Shift", "Cmd", "Return"] }) },
        { id: "swap-up", action: "Swap the current line up", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Up"], linux: ["Ctrl", "Shift", "Up"], macos: ["Ctrl", "Cmd", "Up"] }) },
        { id: "swap-down", action: "Swap the current line down", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Down"], linux: ["Ctrl", "Shift", "Down"], macos: ["Ctrl", "Cmd", "Down"] }) },
        { id: "select-line", action: "Select the current line", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "select-word", action: "Select the current word", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "jump-bracket", action: "Jump to the matching parenthesis", keys: perPlatform(platforms, { windows: ["Ctrl", "M"], linux: ["Ctrl", "M"], macos: ["Ctrl", "M"] }) },
        { id: "select-bracket", action: "Select the contents of the current parentheses", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "M"], linux: ["Ctrl", "Shift", "M"], macos: ["Ctrl", "Shift", "M"] }) },
        { id: "delete-to-end", action: "Delete from the cursor to the end of the line", keys: perPlatform(platforms, { windows: ["Ctrl", "K", "Ctrl", "K"], linux: ["Ctrl", "K", "Ctrl", "K"], macos: ["Cmd", "K", "Cmd", "K"] }) },
        { id: "indent", action: "Indent current lines", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "unindent", action: "Unindent current lines", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "duplicate-line", action: "Duplicate lines", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "D"], linux: ["Ctrl", "Shift", "D"], macos: ["Shift", "Cmd", "D"] }) },
        { id: "join-lines", action: "Join the line below", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "J"], linux: ["Ctrl", "Shift", "J"], macos: ["Cmd", "J"] }) },
        { id: "toggle-comment", action: "Comment or uncomment the current line", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "block-comment", action: "Comment the current selection as a block", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "/"], linux: ["Ctrl", "Shift", "/"], macos: ["Option", "Cmd", "/"] }) },
        { id: "redo", action: "Redo or repeat the last shortcut command", keys: perPlatform(platforms, { windows: ["Ctrl", "Y"], linux: ["Ctrl", "Y"], macos: ["Cmd", "Y"] }) },
        { id: "paste-indent", action: "Paste and indent correctly", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "V"], linux: ["Ctrl", "Shift", "V"], macos: ["Shift", "Cmd", "V"] }) },
        { id: "autocomplete", action: "Select the next autocomplete suggestion", keys: perPlatform(platforms, { windows: ["Ctrl", "Space"], linux: ["Ctrl", "Space"], macos: ["Ctrl", "Space"] }) },
        { id: "soft-undo", action: "Soft undo", keys: perPlatform(platforms, { windows: ["Ctrl", "U"], linux: ["Ctrl", "U"], macos: ["Cmd", "U"] }) },
      ],
    },
    {
      id: "navigation-and-search",
      title: "Navigation and search",
      intro: "Navigation and search shortcuts open files, symbols, lines, the command palette, and project-wide find and replace panels.",
      shortcuts: [
        { id: "quick-open", action: "Quick-open files by name", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "goto-symbol", action: "Go to a symbol", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
        { id: "goto-line", action: "Go to a line", keys: perPlatform(platforms, { windows: ["Ctrl", "G"], linux: ["Ctrl", "G"], macos: ["Ctrl", "G"] }) },
        { id: "build", action: "Build", keys: perPlatform(platforms, { windows: ["F7"], linux: ["F7"], macos: ["F7"] }) },
        { id: "build-command", action: "Build", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "build-selected", action: "Build selected", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "B"], linux: ["Ctrl", "Shift", "B"], macos: ["Shift", "Cmd", "B"] }) },
        { id: "command-palette", action: "Open the Command Palette", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "P"], linux: ["Ctrl", "Shift", "P"], macos: ["Shift", "Cmd", "P"] }) },
        { id: "sidebar", action: "Toggle the side bar", keys: perPlatform(platforms, { windows: ["Ctrl", "K", "Ctrl", "B"], linux: ["Ctrl", "K", "Ctrl", "B"], macos: ["Cmd", "K", "Cmd", "B"] }) },
        { id: "find", action: "Find", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "replace", action: "Replace", keys: perPlatform(platforms, { windows: ["Ctrl", "H"], linux: ["Ctrl", "H"], macos: ["Option", "Cmd", "F"] }) },
        { id: "find-files", action: "Find in files", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "F"], linux: ["Ctrl", "Shift", "F"], macos: ["Shift", "Cmd", "F"] }) },
      ],
    },
    {
      id: "tabs-and-folding",
      title: "Tabs and folding",
      intro: "Tabs and folding shortcuts reopen or close files, switch tabs, select groups, and collapse code by nesting level.",
      shortcuts: [
        { id: "reopen-tab", action: "Open the last closed tab", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "T"], linux: ["Ctrl", "Shift", "T"], macos: ["Shift", "Cmd", "T"] }) },
        { id: "recent-tab", action: "Cycle through recent tabs", keys: perPlatform(platforms, { windows: ["Ctrl", "Tab"], linux: ["Ctrl", "Tab"], macos: ["Ctrl", "Tab"] }) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "tab-number", action: "Switch to a tab by number", keys: perPlatform(platforms, { windows: ["Alt", "1"], linux: ["Alt", "1"], macos: ["Cmd", "1"] }) },
        { id: "fold", action: "Fold", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "["], linux: ["Ctrl", "Shift", "["], macos: ["Ctrl", "Shift", "["] }) },
        { id: "unfold", action: "Unfold", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "]"], linux: ["Ctrl", "Shift", "]"], macos: ["Ctrl", "Shift", "]"] }) },
        { id: "toggle-bookmark", action: "Toggle a bookmark", keys: perPlatform(platforms, { windows: ["Ctrl", "F2"], linux: ["Ctrl", "F2"], macos: ["Cmd", "F2"] }) },
        { id: "next-bookmark", action: "Go to the next bookmark", keys: perPlatform(platforms, { windows: ["F2"], linux: ["F2"], macos: ["F2"] }) },
        { id: "previous-bookmark", action: "Go to the previous bookmark", keys: perPlatform(platforms, { windows: ["Shift", "F2"], linux: ["Shift", "F2"], macos: ["Shift", "F2"] }) },
      ],
    },
  ],
};

export default sublimeText;
