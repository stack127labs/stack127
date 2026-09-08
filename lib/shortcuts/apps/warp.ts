import { perPlatform } from "../build.ts";
import type { AppShortcuts, PlatformId, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const bind = (id: string, action: string, keysByPlatform: Partial<Record<PlatformId, string[]>>, note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, keysByPlatform),
  ...(note ? { note } : {}),
});

export const warp: AppShortcuts = {
  slug: "warp",
  name: "Warp",
  category: "Terminal",
  platforms: [...platforms],
  intro:
    "Warp's official shortcut reference covers panes, blocks, terminal input, command search, tabs, navigation, and font controls across macOS, Windows, and Linux. The map preserves Warp's platform-specific defaults, including Emacs-style input bindings shared by the terminal editor.",
  versionContext:
    "Warp keyboard shortcut reference last updated August 27, 2026 and checked September 1, 2026. Warp lets users remap commands in Settings and warns that macOS system shortcuts may need to be unbound first; this record uses the published defaults.",
  sourceUrl: "https://docs.warp.dev/getting-started/keyboard-shortcuts",
  sourceLabel: "official Warp keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "essentials",
      title: "Essentials and command search",
      intro: "Open Warp palettes, focus the terminal, start workflows, and split panes with the default platform bindings.",
      shortcuts: [
        bind("split-right", "Split the pane to the right", { windows: ["Ctrl", "Shift", "D"], macos: ["Cmd", "D"], linux: ["Ctrl", "Shift", "D"] }),
        bind("command-search", "Open command search", { windows: ["Ctrl", "R"], macos: ["Ctrl", "R"], linux: ["Ctrl", "R"] }),
        bind("workflows", "Open Workflows", { windows: ["Ctrl", "Shift", "R"], macos: ["Ctrl", "Shift", "R"], linux: ["Ctrl", "Shift", "R"] }),
        bind("generate", "Open natural-language command search", { windows: ["Ctrl", "`"], macos: ["Ctrl", "`"], linux: ["Ctrl", "`"] }),
        bind("focus-input", "Focus terminal input", { windows: ["Ctrl", "Shift", "L"], macos: ["Cmd", "L"], linux: ["Ctrl", "Shift", "L"] }),
        bind("warpify", "Warpify the current subshell", { windows: ["Ctrl", "I"], macos: ["Ctrl", "I"], linux: ["Ctrl", "I"] }),
        bind("warp-drive", "Toggle Warp Drive", { windows: ["Ctrl", "Shift", "\\"], macos: ["Cmd", "\\"], linux: ["Ctrl", "Shift", "\\"] }),
        bind("file-search", "Open file search", { macos: ["Cmd", "O"] }),
        bind("command-palette", "Open the command palette", { macos: ["Cmd", "P"], windows: ["Ctrl", "Shift", "P"], linux: ["Ctrl", "Shift", "P"] }),
        bind("settings", "Open Settings", { macos: ["Cmd", ","], windows: ["Ctrl", ","], linux: ["Ctrl", ","] }),
        bind("resource-center", "Open the Resource Center", { macos: ["Ctrl", "Shift", "?"] , windows: ["Ctrl", "Shift", "/"], linux: ["Ctrl", "Shift", "/"] }),
      ],
    },
    {
      id: "blocks",
      title: "Blocks",
      intro: "Select, bookmark, clear, copy, reinput, and expand Warp blocks from the terminal workspace.",
      shortcuts: [
        bind("select-all-blocks", "Select all blocks", { macos: ["Cmd", "A"], windows: ["Ctrl", "Shift", "A"], linux: ["Ctrl", "Shift", "A"] }),
        bind("clear-blocks", "Clear blocks", { macos: ["Cmd", "K"], windows: ["Ctrl", "Shift", "K"], linux: ["Ctrl", "Shift", "K"] }),
        bind("bookmark-block", "Bookmark the selected block", { macos: ["Cmd", "B"], windows: ["Ctrl", "Shift", "B"], linux: ["Ctrl", "Shift", "B"] }),
        bind("next-block", "Select the next block", { macos: ["Cmd", "Down"], windows: ["Ctrl", "Down"], linux: ["Ctrl", "Down"] }),
        bind("previous-block", "Select the previous block", { macos: ["Cmd", "Up"], windows: ["Ctrl", "Up"], linux: ["Ctrl", "Up"] }),
        bind("copy-output", "Copy command output", { macos: ["Option", "Shift", "Cmd", "C"], windows: ["Ctrl", "Shift", "Alt", "C"], linux: ["Ctrl", "Shift", "Alt", "C"] }),
        bind("copy-command", "Copy a command", { macos: ["Shift", "Cmd", "C"], windows: ["Ctrl", "Shift", "C"], linux: ["Ctrl", "Shift", "C"] }),
        bind("reinput", "Reinput selected commands", { macos: ["Cmd", "I"], windows: ["Ctrl", "Shift", "I"], linux: ["Ctrl", "Shift", "I"] }),
        bind("share-block", "Share the selected block", { macos: ["Shift", "Cmd", "S"], windows: ["Ctrl", "Shift", "S"], linux: ["Ctrl", "Shift", "S"] }),
        bind("expand-down", "Expand selected blocks below", { macos: ["Shift", "Down"], windows: ["Shift", "Down"], linux: ["Shift", "Down"] }),
        bind("expand-up", "Expand selected blocks above", { macos: ["Shift", "Up"], windows: ["Shift", "Up"], linux: ["Shift", "Up"] }),
      ],
    },
    {
      id: "terminal-and-tabs",
      title: "Terminal, panes, and tabs",
      intro: "Move between panes, resize them, navigate terminal history, manage tabs, and change the workspace font size.",
      shortcuts: [
        bind("pane-down", "Switch to the pane below", { macos: ["Option", "Cmd", "Down"], windows: ["Ctrl", "Alt", "Down"], linux: ["Ctrl", "Alt", "Down"] }),
        bind("pane-up", "Switch to the pane above", { macos: ["Option", "Cmd", "Up"], windows: ["Ctrl", "Alt", "Up"], linux: ["Ctrl", "Alt", "Up"] }),
        bind("pane-left", "Switch to the pane on the left", { macos: ["Option", "Cmd", "Left"], windows: ["Ctrl", "Alt", "Left"], linux: ["Ctrl", "Alt", "Left"] }),
        bind("pane-right", "Switch to the pane on the right", { macos: ["Option", "Cmd", "Right"], windows: ["Ctrl", "Alt", "Right"], linux: ["Ctrl", "Alt", "Right"] }),
        bind("previous-pane", "Activate the previous pane", { macos: ["Cmd", "["], windows: ["Ctrl", "Shift", "["], linux: ["Ctrl", "Shift", "["] }),
        bind("next-pane", "Activate the next pane", { macos: ["Cmd", "]"], windows: ["Ctrl", "Shift", "]"], linux: ["Ctrl", "Shift", "]"] }),
        bind("resize-pane-down", "Move the pane divider down", { macos: ["Ctrl", "Cmd", "Down"], windows: [], linux: [] }),
        bind("resize-pane-up", "Move the pane divider up", { macos: ["Ctrl", "Cmd", "Up"], windows: [], linux: [] }),
        bind("resize-pane-left", "Move the pane divider left", { macos: ["Ctrl", "Cmd", "Left"], windows: [], linux: [] }),
        bind("resize-pane-right", "Move the pane divider right", { macos: ["Ctrl", "Cmd", "Right"], windows: [], linux: [] }),
        bind("new-tab", "Open a new tab", { macos: ["Cmd", "T"], windows: ["Ctrl", "Shift", "T"], linux: ["Ctrl", "Shift", "T"] }),
        bind("reopen-tab", "Reopen the closed tab", { macos: ["Shift", "Cmd", "T"], windows: ["Ctrl", "Alt", "T"], linux: ["Ctrl", "Alt", "T"] }),
        bind("previous-tab", "Activate the previous tab", { macos: ["Shift", "Cmd", "{"], windows: ["Ctrl", "Page Up"], linux: ["Ctrl", "Page Up"] }),
        bind("next-tab", "Activate the next tab", { macos: ["Shift", "Cmd", "}"], windows: ["Ctrl", "Page Down"], linux: ["Ctrl", "Page Down"] }),
        bind("font-down", "Decrease font size", { macos: ["Cmd", "-"], windows: ["Ctrl", "-"], linux: ["Ctrl", "-"] }),
        bind("font-up", "Increase font size", { macos: ["Cmd", "="], windows: ["Ctrl", "="], linux: ["Ctrl", "="] }),
        bind("font-reset", "Reset font size", { macos: ["Cmd", "0"], windows: ["Ctrl", "0"], linux: ["Ctrl", "0"] }),
      ],
    },
    {
      id: "input-editor",
      title: "Input editor",
      intro: "Use Warp's terminal input editor to move through commands, accept suggestions, edit words, and clear or submit input.",
      shortcuts: [
        bind("delete-word-left", "Delete the word to the left", { macos: ["Option", "Backspace"], windows: ["Ctrl", "Backspace"], linux: ["Ctrl", "Backspace"] }),
        bind("delete-word-right", "Delete the word to the right", { macos: ["Option", "Delete"], windows: ["Ctrl", "Delete"], linux: ["Ctrl", "Delete"] }),
        bind("line-start", "Move to the start of the line", { macos: ["Ctrl", "A"], windows: ["Ctrl", "A"], linux: ["Ctrl", "A"] }),
        bind("line-end", "Move to the end of the line", { macos: ["Ctrl", "E"], windows: ["Ctrl", "E"], linux: ["Ctrl", "E"] }),
        bind("left", "Move the cursor left", { macos: ["Ctrl", "B"], windows: ["Ctrl", "B"], linux: ["Ctrl", "B"] }),
        bind("right", "Move the cursor right or accept a suggestion", { macos: ["Ctrl", "F"], windows: ["Ctrl", "F"], linux: ["Ctrl", "F"] }),
        bind("clear-command", "Clear the command editor", { macos: ["Ctrl", "C"], windows: ["Ctrl", "C"], linux: ["Ctrl", "C"] }),
        bind("delete", "Delete the next character", { macos: ["Ctrl", "D"], windows: ["Ctrl", "D"], linux: ["Ctrl", "D"] }),
        bind("insert-newline", "Insert a newline", { macos: ["Ctrl", "J"], windows: ["Ctrl", "J"], linux: ["Ctrl", "J"] }),
        bind("clear-screen", "Clear the screen", { macos: ["Ctrl", "L"], windows: ["Ctrl", "L"], linux: ["Ctrl", "L"] }),
        bind("cursor-down", "Move the cursor down", { macos: ["Ctrl", "N"], windows: ["Ctrl", "N"], linux: ["Ctrl", "N"] }),
        bind("cursor-up", "Move the cursor up", { macos: ["Ctrl", "P"], windows: ["Ctrl", "P"], linux: ["Ctrl", "P"] }),
        bind("undo", "Undo", { macos: ["Cmd", "Z"], windows: ["Ctrl", "Z"], linux: ["Ctrl", "Z"] }),
        bind("redo", "Redo", { macos: ["Cmd", "Shift", "Z"], windows: ["Ctrl", "Shift", "Z"], linux: ["Ctrl", "Shift", "Z"] }),
      ],
    },
  ],
};

export default warp;
