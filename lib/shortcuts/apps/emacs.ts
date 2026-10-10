import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const bind = (platform: (typeof platforms)[number], keys: string[], alternatives?: string[][]): ShortcutKey => ({
  platform,
  keys,
  ...(alternatives ? { alternatives } : {}),
});

const control = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => bind(platform, keys)),
  ...(note ? { note } : {}),
});

const meta = (id: string, action: string, key: string, note?: string): Shortcut => ({
  id,
  action,
  keys: [
    bind("windows", ["Alt", key]),
    bind("macos", ["Option", key]),
    bind("linux", ["Alt", key]),
  ],
  ...(note ? { note } : {}),
});

const controlMeta = (id: string, action: string, key: string, note?: string): Shortcut => ({
  id,
  action,
  keys: [
    bind("windows", ["Ctrl", "Alt", key]),
    bind("macos", ["Ctrl", "Option", key]),
    bind("linux", ["Ctrl", "Alt", key]),
  ],
  ...(note ? { note } : {}),
});

const metaSequence = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [
    bind("windows", ["Alt", ...keys]),
    bind("macos", ["Option", ...keys]),
    bind("linux", ["Alt", ...keys]),
  ],
  ...(note ? { note } : {}),
});

export const emacs: AppShortcuts = {
  slug: "emacs",
  name: "GNU Emacs",
  category: "Text editors",
  platforms: [...platforms],
  versionContext:
    "GNU Emacs 30.2 manual and current GNU Emacs reference card checked September 1, 2026. Emacs modes can add local bindings, and terminal or operating-system settings can change how Meta, Alt, and function keys reach Emacs.",
  sourceUrl: "https://www.gnu.org/software/emacs/manual/html_node/emacs/",
  sourceLabel: "GNU Emacs Manual",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "movement",
      title: "Movement",
      intro: "These default editing commands move by character, word, line, sentence, screen, or buffer.",
      shortcuts: [
        control("forward-character", "Move forward one character", ["Ctrl", "F"]),
        control("backward-character", "Move backward one character", ["Ctrl", "B"]),
        control("next-line", "Move to the next line", ["Ctrl", "N"]),
        control("previous-line", "Move to the previous line", ["Ctrl", "P"]),
        control("line-start", "Move to the beginning of the line", ["Ctrl", "A"]),
        control("line-end", "Move to the end of the line", ["Ctrl", "E"]),
        meta("forward-word", "Move forward one word", "F"),
        meta("backward-word", "Move backward one word", "B"),
        meta("previous-sentence", "Move to the previous sentence", "A"),
        meta("next-sentence", "Move to the next sentence", "E"),
        control("next-screen", "Scroll forward one screen", ["Ctrl", "V"]),
        meta("previous-screen", "Scroll backward one screen", "V"),
        meta("buffer-start", "Move to the beginning of the buffer", "<"),
        meta("buffer-end", "Move to the end of the buffer", ">"),
        metaSequence("goto-line", "Go to a line", ["G", "then", "G"]),
      ],
    },
    {
      id: "editing",
      title: "Editing and regions",
      intro: "Kill commands remove text into the kill ring, while yank commands put it back.",
      shortcuts: [
        control("delete-forward", "Delete the character at point", ["Ctrl", "D"]),
        control("delete-backward", "Delete the character before point", ["DEL"], "GNU documents this as DEL, which is commonly the Backspace key on a modern keyboard."),
        control("kill-line", "Kill to the end of the line", ["Ctrl", "K"]),
        meta("kill-word", "Kill the next word", "D"),
        meta("backward-kill-word", "Kill the previous word", "Backspace"),
        control("kill-region", "Kill the active region", ["Ctrl", "W"]),
        meta("copy-region", "Copy the active region to the kill ring", "W"),
        control("yank", "Yank the most recent kill", ["Ctrl", "Y"]),
        meta("yank-previous", "Replace the last yank with the previous kill", "Y"),
        control("set-mark", "Set the mark", ["Ctrl", "Space"]),
        control("exchange-point-mark", "Exchange point and mark", ["Ctrl", "X", "then", "Ctrl", "X"]),
        control("mark-buffer", "Mark the entire buffer", ["Ctrl", "X", "then", "H"]),
        control("undo", "Undo", ["Ctrl", "_"]),
        control("abort", "Quit the current command", ["Ctrl", "G"]),
      ],
    },
    {
      id: "files",
      title: "Files",
      intro: "File commands visit, save, write, revert, and close buffers in the current Emacs session.",
      shortcuts: [
        control("visit-file", "Visit a file", ["Ctrl", "X", "then", "Ctrl", "F"]),
        control("visit-read-only", "Visit a file read-only", ["Ctrl", "X", "then", "Ctrl", "R"]),
        control("visit-alternate", "Visit a different file in the current buffer", ["Ctrl", "X", "then", "Ctrl", "V"]),
        control("visit-other-window", "Visit a file in another window", ["Ctrl", "X", "then", "4", "then", "F"]),
        control("visit-other-frame", "Visit a file in another frame", ["Ctrl", "X", "then", "5", "then", "F"]),
        control("save-buffer", "Save the current buffer", ["Ctrl", "X", "then", "Ctrl", "S"]),
        control("write-file", "Write the buffer to a new file", ["Ctrl", "X", "then", "Ctrl", "W"]),
        control("save-some", "Save some modified buffers", ["Ctrl", "X", "then", "S"]),
        meta("execute-command", "Execute a named command", "X"),
        control("quit", "Quit Emacs", ["Ctrl", "X", "then", "Ctrl", "C"]),
      ],
    },
    {
      id: "buffers-and-windows",
      title: "Buffers and windows",
      intro: "Switch buffers, split or remove windows, and move between windows with these prefix commands.",
      shortcuts: [
        control("switch-buffer", "Switch to a buffer", ["Ctrl", "X", "then", "B"]),
        control("switch-buffer-other-window", "Switch to a buffer in another window", ["Ctrl", "X", "then", "4", "then", "B"]),
        control("switch-buffer-other-frame", "Switch to a buffer in another frame", ["Ctrl", "X", "then", "5", "then", "B"]),
        control("kill-buffer", "Kill a buffer", ["Ctrl", "X", "then", "K"]),
        control("delete-window", "Remove the selected window", ["Ctrl", "X", "then", "0"]),
        control("only-window", "Make the selected window the only window", ["Ctrl", "X", "then", "1"]),
        control("split-horizontal", "Split the selected window horizontally", ["Ctrl", "X", "then", "2"]),
        control("split-vertical", "Split the selected window vertically", ["Ctrl", "X", "then", "3"]),
        control("other-window", "Move to another window", ["Ctrl", "X", "then", "O"]),
      ],
    },
    {
      id: "search",
      title: "Search and replacement",
      intro: "Incremental search starts matching as text is entered. Query replacement asks how to handle each match.",
      shortcuts: [
        control("search-forward", "Search forward incrementally", ["Ctrl", "S"]),
        control("search-backward", "Search backward incrementally", ["Ctrl", "R"]),
        controlMeta("regexp-search", "Search forward with a regular expression", "S"),
        meta("query-replace", "Query and replace text", "%"),
      ],
    },
    {
      id: "help",
      title: "Help",
      intro: "The Control-H prefix opens Emacs's built-in command and manual help.",
      shortcuts: [
        control("help-bindings", "Show active key bindings", ["Ctrl", "H", "then", "B"]),
        control("describe-key-briefly", "Show the command bound to a key", ["Ctrl", "H", "then", "C"]),
        control("describe-key", "Show documentation for a key", ["Ctrl", "H", "then", "K"]),
        control("describe-function", "Show documentation for a function", ["Ctrl", "H", "then", "F"]),
        control("apropos-command", "Search for commands by topic", ["Ctrl", "H", "then", "A"]),
        control("manual", "Open the Emacs manual", ["Ctrl", "H", "then", "R"]),
        control("tutorial", "Open the Emacs tutorial", ["Ctrl", "H", "then", "T"]),
      ],
    },
    {
      id: "keyboard-macros",
      title: "Keyboard macros",
      intro: "Record a sequence of keystrokes and replay it from the keyboard macro commands.",
      shortcuts: [
        control("macro-start", "Start recording a keyboard macro", ["Ctrl", "X", "then", "("]),
        control("macro-end", "Stop recording a keyboard macro", ["Ctrl", "X", "then", ")"]),
        control("macro-run", "Run the last keyboard macro", ["Ctrl", "X", "then", "E"]),
      ],
    },
  ],
};

export default emacs;
