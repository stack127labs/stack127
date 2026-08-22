import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const vim: AppShortcuts = {
  slug: "vim",
  name: "Vim",
  category: "Text editor",
  platforms: [...platforms],
  intro:
    "Vim is a language of motions, operators, and modes rather than a list of isolated hotkeys. Start with movement, combine it with editing, then use visual selection and window or file commands.",
  versionContext:
    "Documented Vim behavior from the official Vim help in August 2026. Commands are identical on every platform because they are typed in normal mode rather than pressed as chords.",
  sourceUrl: "https://vimhelp.org/",
  sourceLabel: "official Vim help",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "motions",
      title: "Motions",
      intro: "Move by character, word, sentence, paragraph, line, or matching delimiter in normal mode.",
      shortcuts: [
        { id: "word-forward", action: "Next word start", keys: combo(platforms, ["w"]) },
        { id: "word-back", action: "Previous word start", keys: combo(platforms, ["b"]) },
        { id: "word-end", action: "Next word end", keys: combo(platforms, ["e"]) },
        { id: "line-start", action: "First non-blank of the line", keys: combo(platforms, ["^"]) },
        { id: "line-end", action: "End of the line", keys: combo(platforms, ["$"]) },
        { id: "file-start", action: "Start of the file", keys: combo(platforms, ["g", "g"]) },
        { id: "file-end", action: "End of the file", keys: combo(platforms, ["G"]) },
        {
          id: "paragraph",
          action: "Previous paragraph boundary",
          keys: combo(platforms, ["{"]),
          note: "} moves to the next one.",
        },
        {
          id: "matching-pair",
          action: "Jump to matching bracket or paren",
          keys: combo(platforms, ["%"]),
        },
        {
          id: "find-char",
          action: "Jump to next occurrence of a character",
          keys: combo(platforms, ["f"]),
          note: "Type f then the character. t jumps to just before it; F and T search backwards.",
        },
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Combine operators with motions, change text, copy and paste, undo, and repeat edits.",
      shortcuts: [
        { id: "delete-line", action: "Delete the line", keys: combo(platforms, ["d", "d"]) },
        { id: "yank-line", action: "Copy (yank) the line", keys: combo(platforms, ["y", "y"]) },
        { id: "paste-after", action: "Paste after the cursor", keys: combo(platforms, ["p"]), note: "P pastes before." },
        { id: "delete-char", action: "Delete the character under the cursor", keys: combo(platforms, ["x"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["u"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "r"]) },
        { id: "open-below", action: "Open a new line below", keys: combo(platforms, ["o"]), note: "O opens above." },
        {
          id: "change-word",
          action: "Change the whole word under the cursor",
          keys: combo(platforms, ["c", "i", "w"]),
          note: "The ci text-object pattern works with other objects: ci( changes inside parentheses.",
        },
        { id: "change-line", action: "Change the whole line", keys: combo(platforms, ["c", "c"]) },
        {
          id: "repeat",
          action: "Repeat the last change",
          keys: combo(platforms, ["."]),
        },
      ],
    },
    {
      id: "visual-and-search",
      title: "Visual mode and search",
      intro: "Select text, search the buffer, move through matches, and replace what you find.",
      shortcuts: [
        { id: "visual-char", action: "Start character-wise visual mode", keys: combo(platforms, ["v"]) },
        { id: "visual-line", action: "Start line-wise visual mode", keys: combo(platforms, ["V"]) },
        {
          id: "visual-block",
          action: "Start block-wise visual mode",
          keys: combo(platforms, ["Ctrl", "v"]),
        },
        { id: "search-forward", action: "Search forward", keys: combo(platforms, ["/"]) , note: "? searches backwards." },
        { id: "search-next", action: "Next search match", keys: combo(platforms, ["n"]), note: "N goes to the previous match." },
        {
          id: "search-word",
          action: "Search for the word under the cursor",
          keys: combo(platforms, ["*"]),
          note: "# searches backwards.",
        },
      ],
    },
    {
      id: "windows-and-files",
      title: "Windows, files, and ex commands",
      intro:
        "Ctrl+w prefixes window commands: press Ctrl+w, release, then press the command key.",
      shortcuts: [
        { id: "split-horizontal", action: "Split the window horizontally", keys: combo(platforms, ["Ctrl", "w", "s"]) },
        { id: "split-vertical", action: "Split the window vertically", keys: combo(platforms, ["Ctrl", "w", "v"]) },
        { id: "window-down", action: "Move to the window below", keys: combo(platforms, ["Ctrl", "w", "j"]), note: "h, k, and l move left, up, and right." },
        { id: "close-window", action: "Close the current window", keys: combo(platforms, ["Ctrl", "w", "q"]) },
        { id: "save", action: "Write the file", keys: combo(platforms, [":", "w"]) },
        { id: "quit", action: "Quit", keys: combo(platforms, [":", "q"]), note: ":wq writes and quits; :q! quits without saving." },
        {
          id: "substitute",
          action: "Substitute across the file",
          keys: combo(platforms, [":", "%", "s"]),
          note: "Full form: :%s/old/new/g replaces every occurrence in the file.",
        },
      ],
    },
  ],
};
