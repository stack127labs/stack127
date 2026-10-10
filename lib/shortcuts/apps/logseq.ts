import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});

const mod = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({
    platform,
    keys: keys.map((key) =>
      platform === "macos" && key === "Ctrl" ? "Cmd" : platform === "macos" && key === "Alt" ? "Option" : key,
    ),
  })),
  ...(note ? { note } : {}),
});

const winLinux = (id: string, action: string, keys: string[], macKeys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, linux: keys, macos: macKeys }),
  ...(note ? { note } : {}),
});

export const logseq: AppShortcuts = {
  slug: "logseq",
  name: "Logseq",
  category: "Knowledge management",
  platforms: [...platforms],
  versionContext:
    "Current default Logseq keymap source checked September 1, 2026. The project defines a platform-neutral `mod` modifier, which maps to Ctrl on Windows and Linux and Command on macOS. Users can change the keymap in Logseq settings or the source configuration.",
  sourceUrl: "https://github.com/logseq/logseq/blob/master/src/main/frontend/modules/shortcut/config.cljs",
  sourceLabel: "official Logseq shortcut configuration",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "block-editing",
      title: "Block editing",
      intro: "Create, indent, move, format, and transform blocks while editing a page.",
      shortcuts: [
        shared("new-block", "Create a new block", ["Enter"]),
        shared("new-line", "Insert a line break in the current block", ["Shift", "Enter"]),
        mod("follow-link", "Follow the link under the cursor", ["Ctrl", "O"]),
        mod("open-link-sidebar", "Open the link under the cursor in the sidebar", ["Ctrl", "Shift", "O"]),
        mod("bold", "Toggle bold formatting", ["Ctrl", "B"]),
        mod("italic", "Toggle italic formatting", ["Ctrl", "I"]),
        mod("highlight", "Toggle highlight formatting", ["Ctrl", "Shift", "H"]),
        mod("strikethrough", "Toggle strikethrough formatting", ["Ctrl", "Shift", "S"]),
        mod("embed", "Embed the selected block", ["Ctrl", "Shift", "E"]),
        mod("paste-as-plain-text", "Paste as plain text", ["Ctrl", "Shift", "V"]),
        mod("toggle-todo", "Toggle the TODO state", ["Ctrl", "Enter"]),
        shared("indent", "Indent the current block", ["Tab"]),
        shared("outdent", "Outdent the current block", ["Shift", "Tab"]),
        winLinux("move-block-up", "Move the current block up", ["Alt", "Shift", "Up"], ["Cmd", "Shift", "Up"]),
        winLinux("move-block-down", "Move the current block down", ["Alt", "Shift", "Down"], ["Cmd", "Shift", "Down"]),
        mod("expand-block", "Expand the current block", ["Ctrl", "Down"]),
        mod("collapse-block", "Collapse the current block", ["Ctrl", "Up"]),
        mod("toggle-block-children", "Toggle the current block's children", ["Ctrl", ";"]),
        shared("open-parent", "Open the parent block", ["Up"]),
        shared("select-up", "Extend the selection upward", ["Shift", "Up"]),
        shared("select-down", "Extend the selection downward", ["Shift", "Down"]),
        mod("copy", "Copy the selected block", ["Ctrl", "C"]),
        mod("cut", "Cut the selected block", ["Ctrl", "X"]),
        mod("undo", "Undo the last edit", ["Ctrl", "Z"]),
        mod("redo", "Redo the last edit", ["Ctrl", "Shift", "Z"]),
        mod("select-parent", "Select the parent block", ["Ctrl", "A"]),
        mod("select-all-blocks", "Select all blocks", ["Ctrl", "Shift", "A"]),
        mod("add-link", "Add a link", ["Ctrl", "L"]),
        shared("escape-editing", "Leave the current editor or selection", ["Escape"]),
      ],
    },
    {
      id: "search-and-command",
      title: "Search and commands",
      intro: "Find pages and text, open commands, and use Logseq's quick insertion controls.",
      shortcuts: [
        mod("global-search", "Open global search", ["Ctrl", "K"]),
        mod("command-palette", "Open the command palette", ["Ctrl", "Shift", "P"]),
        mod("search-page", "Search the current page", ["Ctrl", "Shift", "K"]),
        mod("find-in-page", "Find text in the application", ["Ctrl", "F"]),
        shared("autocomplete", "Accept an autocomplete suggestion", ["Enter"]),
        shared("autocomplete-next", "Choose the next autocomplete suggestion", ["Down"]),
        shared("autocomplete-previous", "Choose the previous autocomplete suggestion", ["Up"]),
        shared("autocomplete-new-block", "Accept an autocomplete suggestion and create a block", ["Shift", "Enter"]),
        mod("autocomplete-new-line", "Accept an autocomplete suggestion and insert it with a modifier", ["Ctrl", "Enter"]),
        winLinux("zoom-in", "Increase the editor zoom", ["Alt", "Right"], ["Cmd", "."]),
        winLinux("zoom-out", "Decrease the editor zoom", ["Alt", "Left"], ["Cmd", ","]),
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "Jump between journals, pages, graphs, and recently visited locations.",
      shortcuts: [
        shared("journals", "Open Journals", ["G", "then", "J"]),
        shared("home", "Open the home page", ["G", "then", "H"]),
        shared("pages", "Open the page list", ["G", "then", "P"]),
        shared("graph", "Open the graph view", ["G", "then", "G"]),
        shared("all-pages", "Open all pages", ["G", "then", "A"]),
        winLinux("today-in-sidebar", "Open today's journal in the sidebar", ["Alt", "Shift", "J"], ["Cmd", "Shift", "J"]),
        shared("tomorrow", "Open tomorrow's journal", ["G", "then", "T"]),
        shared("next-journal", "Open the next journal", ["G", "then", "N"]),
        shared("previous-journal", "Open the previous journal", ["G", "then", "P"]),
        mod("back", "Go back", ["Ctrl", "["]),
        mod("forward", "Go forward", ["Ctrl", "]"]),
        mod("reindex", "Re-index the graph", ["Ctrl", "C", "then", "Ctrl", "S"]),
        shared("flashcards", "Open flashcards", ["G", "then", "F"]),
        shared("document-mode", "Toggle document mode", ["D"]),
        shared("toggle-wide-mode", "Toggle wide mode", ["W"]),
        shared("keyboard-shortcuts", "Open keyboard shortcuts", ["G", "then", "S"]),
        {
          id: "settings",
          action: "Open settings",
          keys: platforms.map((platform) => ({
            platform,
            keys: ["T", "then", "S"],
            ...(platform === "macos" ? { alternatives: [["Cmd", ","]] } : {}),
          })),
        },
      ],
    },
    {
      id: "sidebars-and-window",
      title: "Sidebars and window controls",
      intro: "Open or close Logseq's sidebars and control the application window.",
      shortcuts: [
        shared("toggle-left-sidebar", "Toggle the left sidebar", ["T", "then", "L"]),
        shared("toggle-right-sidebar", "Toggle the right sidebar", ["T", "then", "R"]),
        shared("open-help", "Open help", ["Shift", "/"]),
        mod("close-window", "Close the current window", ["Ctrl", "W"]),
      ],
    },
  ],
};

export default logseq;
