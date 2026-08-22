import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const neovim: AppShortcuts = {
  slug: "neovim",
  name: "Neovim",
  category: "Text editor",
  platforms: [...platforms],
  intro:
    "Neovim keeps Vim's modal editing model and adds built-in behavior around it. This reference pairs the commands you already expect with Neovim's LSP, commenting, diagnostics, and terminal-mode defaults.",
  versionContext:
    "Built-in defaults from the official Neovim documentation in August 2026. The LSP and diagnostic bindings listed here are defaults since Neovim 0.11; nothing here requires a plugin or config.",
  sourceUrl: "https://neovim.io/doc/",
  sourceLabel: "official Neovim documentation",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "core",
      title: "Core editing",
      intro: "The Vim foundation still applies: these work in every Neovim.",
      shortcuts: [
        { id: "delete-line", action: "Delete the line", keys: combo(platforms, ["d", "d"]) },
        { id: "yank-line", action: "Copy (yank) the line", keys: combo(platforms, ["y", "y"]) },
        { id: "paste-after", action: "Paste after the cursor", keys: combo(platforms, ["p"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["u"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "r"]) },
        { id: "search-forward", action: "Search forward", keys: combo(platforms, ["/"]), note: "n jumps to the next match." },
        {
          id: "file-start",
          action: "Start of the file",
          keys: combo(platforms, ["g", "g"]),
          note: "G jumps to the end.",
        },
      ],
    },
    {
      id: "lsp-defaults",
      title: "LSP defaults",
      intro:
        "When a language server attaches, these g-prefixed keys work without any configuration in Neovim 0.11 and later.",
      shortcuts: [
        { id: "lsp-rename", action: "Rename the symbol under the cursor", keys: combo(platforms, ["g", "r", "n"]) },
        { id: "lsp-references", action: "List references to the symbol", keys: combo(platforms, ["g", "r", "r"]) },
        { id: "lsp-definition", action: "Go to the definition", keys: combo(platforms, ["g", "d"]) },
        { id: "lsp-implementation", action: "List implementations", keys: combo(platforms, ["g", "r", "i"]) },
        { id: "lsp-hover", action: "Show hover information", keys: combo(platforms, ["K"]) },
        { id: "lsp-code-action", action: "Select a code action", keys: combo(platforms, ["g", "r", "a"]) },
        { id: "document-symbols", action: "Open document symbols", keys: combo(platforms, ["g", "O"]) },
      ],
    },
    {
      id: "commenting-and-diagnostics",
      title: "Commenting and diagnostics",
      intro: "Use Neovim's built-in commenting, diagnostic navigation, and location-list controls.",
      shortcuts: [
        {
          id: "comment-line",
          action: "Toggle a line comment",
          keys: combo(platforms, ["g", "c", "c"]),
          note: "gc with a motion comments that range, built in since Neovim 0.10.",
        },
        {
          id: "comment-block",
          action: "Toggle a block comment",
          keys: combo(platforms, ["g", "b"]),
        },
        {
          id: "diagnostic-prev",
          action: "Jump to the previous diagnostic",
          keys: combo(platforms, ["[", "d"]),
          note: "]d jumps to the next one.",
        },
        {
          id: "diagnostic-float",
          action: "Show diagnostics in a floating window",
          keys: combo(platforms, ["Ctrl", "w", "d"]),
        },
      ],
    },
    {
      id: "terminal-mode",
      title: "Terminal mode",
      intro:
        "Inside a :terminal buffer, keystrokes go to the running program. The Ctrl+\\ then Ctrl+n chord is the way out to normal mode.",
      shortcuts: [
        {
          id: "open-terminal",
          action: "Open a terminal in the current window",
          keys: [],
          note: "Run :terminal. Keystrokes then go to the program inside the buffer.",
        },
        {
          id: "terminal-to-normal",
          action: "Leave terminal mode for normal mode",
          keys: combo(platforms, ["Ctrl", "\\", "Ctrl", "n"]),
        },
        {
          id: "new-terminal-window",
          action: "Open a terminal in its own window",
          keys: [],
          note: "Run :term or :split +terminal from anywhere.",
        },
      ],
    },
  ],
};
