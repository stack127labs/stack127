import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const keys = (items: Array<[string, string, string[]]>): Shortcut[] =>
  items.map(([id, action, combination]) => ({
    id,
    action,
    keys: platforms.map((platform) => ({ platform, keys: combination })),
  }));

export const aider: AppShortcuts = {
  slug: "aider",
  name: "Aider",
  category: "AI pair programming",
  platforms: [...platforms],
  intro:
    "Aider's interactive terminal prompt supports editing, history navigation, interruption, multiline input, and external-editor handoff. Its default Emacs bindings and optional vi command mode are documented separately so the active input mode is always clear.",
  versionContext:
    "Current Aider command-line documentation checked August 31, 2026. Emacs bindings are the default. The vi group applies only when Aider is started with --vim. Terminal emulators and operating systems can intercept some control or meta combinations before Aider receives them.",
  sourceUrl: "https://aider.chat/docs/usage/commands.html",
  sourceLabel: "Aider in-chat commands and keybindings",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "prompt-and-multiline",
      title: "Prompt control and multiline input",
      intro:
        "Interrupt generation, add a line without submitting, or move the current prompt into an external editor when the terminal supports the documented key sequence.",
      shortcuts: [
        ...keys([
          ["interrupt", "Interrupt Aider while preserving the partial response", ["Ctrl", "C"]],
        ]),
        {
          id: "multiline",
          action: "Insert a new line without sending the message",
          keys: platforms.map((platform) => ({
            platform,
            keys: ["Meta", "Enter"],
            alternatives: [["Esc", "Enter"]],
            note: "The fallback is a sequence: press Escape, then Enter.",
          })),
        },
        {
          id: "external-editor",
          action: "Open the current input in an external editor",
          keys: platforms.map((platform) => ({
            platform,
            keys: ["Ctrl", "X", "Ctrl", "E"],
            note: "Press Ctrl+X, then Ctrl+E. The terminal must allow the sequence.",
          })),
        },
      ],
    },
    {
      id: "emacs-input",
      title: "Default Emacs input mode",
      intro:
        "Navigate and edit the current prompt with the Emacs-style bindings that Aider enables by default through prompt-toolkit.",
      shortcuts: keys([
        ["emacs-up-line", "Move up one line in the current message", ["Up"]],
        ["emacs-down-line", "Move down one line in the current message", ["Down"]],
        ["emacs-previous-message", "Scroll back through previously sent messages", ["Ctrl", "Up"]],
        ["emacs-next-message", "Scroll forward through previously sent messages", ["Ctrl", "Down"]],
        ["emacs-line-start", "Move the cursor to the start of the line", ["Ctrl", "A"]],
        ["emacs-back-character", "Move the cursor back one character", ["Ctrl", "B"]],
        ["emacs-delete-character", "Delete the character under the cursor", ["Ctrl", "D"]],
        ["emacs-line-end", "Move the cursor to the end of the line", ["Ctrl", "E"]],
        ["emacs-forward-character", "Move the cursor forward one character", ["Ctrl", "F"]],
        ["emacs-kill-line", "Delete from the cursor to the end of the line", ["Ctrl", "K"]],
        ["emacs-clear", "Clear the screen", ["Ctrl", "L"]],
        ["emacs-next-history", "Move down to the next history entry", ["Ctrl", "N"]],
        ["emacs-previous-history", "Move up to the previous history entry", ["Ctrl", "P"]],
        ["emacs-search-history", "Reverse-search command history", ["Ctrl", "R"]],
        ["emacs-yank", "Paste text that was previously cut", ["Ctrl", "Y"]],
      ]),
    },
    {
      id: "vi-input",
      title: "Optional vi input mode",
      intro:
        "Use these command-mode controls after starting Aider with --vim. Escape enters command mode, while i, a, A, and I return to insert mode at different positions.",
      shortcuts: keys([
        ["vi-up-line", "Move up one line in the current message", ["Up"]],
        ["vi-down-line", "Move down one line in the current message", ["Down"]],
        ["vi-previous-message", "Scroll back through previously sent messages", ["Ctrl", "Up"]],
        ["vi-next-message", "Scroll forward through previously sent messages", ["Ctrl", "Down"]],
        ["vi-command-mode", "Switch to command mode", ["Esc"]],
        ["vi-insert", "Switch to insert mode", ["i"]],
        ["vi-append", "Move right one character and switch to insert mode", ["a"]],
        ["vi-append-end", "Move to the line end and switch to insert mode", ["A"]],
        ["vi-insert-start", "Move to the line beginning and switch to insert mode", ["I"]],
        ["vi-left", "Move one character left", ["h"]],
        ["vi-down", "Move down one line", ["j"]],
        ["vi-up", "Move up one line", ["k"]],
        ["vi-right", "Move one character right", ["l"]],
        ["vi-word-forward", "Move forward one word", ["w"]],
        ["vi-word-back", "Move backward one word", ["b"]],
        ["vi-line-start", "Move to the beginning of the line", ["0"]],
        ["vi-line-end", "Move to the end of the line", ["$"]],
        ["vi-delete-character", "Delete the character under the cursor", ["x"]],
        ["vi-delete-line", "Delete the current line", ["d", "d"]],
        ["vi-undo", "Undo the last change", ["u"]],
        ["vi-redo", "Redo the last undone change", ["Ctrl", "R"]],
      ]),
    },
  ],
};

export default aider;
