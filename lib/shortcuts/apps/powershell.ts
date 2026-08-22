import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const powershell: AppShortcuts = {
  slug: "powershell",
  name: "PowerShell",
  category: "Shell",
  platforms: [...platforms],
  intro:
    "PowerShell's keyboard behavior comes from PSReadLine. The useful set moves the cursor, edits the current command, searches history, and changes how completion presents its choices.",
  versionContext:
    "PSReadLine default key handlers as documented by Microsoft in August 2026. Defaults depend on the active input mode (Windows, Emacs, or Vi) and the operating system; the entries here are the common defaults.",
  sourceUrl:
    "https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline_key_bindings",
  sourceLabel: "official PSReadLine key bindings",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "cursor-movement",
      title: "Cursor movement",
      intro: "Move by character, word, line, or screen position while editing the current command.",
      shortcuts: [
        {
          id: "start-of-line",
          action: "Move to the start of the line",
          keys: combo(platforms, ["Ctrl", "A"]),
          note: "Home does the same.",
        },
        {
          id: "end-of-line",
          action: "Move to the end of the line",
          keys: combo(platforms, ["Ctrl", "E"]),
          note: "End does the same.",
        },
        {
          id: "word-back",
          action: "Move back one word",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Left"],
            macos: ["Alt", "B"],
            linux: ["Alt", "B"],
          }),
        },
        {
          id: "word-forward",
          action: "Move forward one word",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Right"],
            macos: ["Alt", "F"],
            linux: ["Alt", "F"],
          }),
        },
      ],
    },
    {
      id: "editing",
      title: "Editing the line",
      intro: "Delete, transpose, transform, or accept parts of the command line before it runs.",
      shortcuts: [
        {
          id: "delete-word-left",
          action: "Delete the word before the cursor",
          keys: combo(platforms, ["Ctrl", "W"]),
        },
        {
          id: "delete-to-start",
          action: "Delete everything before the cursor",
          keys: combo(platforms, ["Ctrl", "U"]),
        },
        {
          id: "delete-to-end",
          action: "Delete everything after the cursor",
          keys: combo(platforms, ["Ctrl", "K"]),
        },
        {
          id: "paste",
          action: "Paste from the clipboard",
          keys: combo(platforms, ["Ctrl", "V"]),
        },
        {
          id: "copy-or-cancel",
          action: "Copy selected text, or cancel the line when nothing is selected",
          keys: combo(platforms, ["Ctrl", "C"]),
        },
        {
          id: "undo",
          action: "Undo the last edit",
          keys: combo(platforms, ["Ctrl", "Z"]),
        },
        {
          id: "redo",
          action: "Redo an undone edit",
          keys: combo(platforms, ["Ctrl", "Y"]),
        },
        {
          id: "yank-last-arg",
          action: "Insert the last argument of the previous command",
          keys: combo(platforms, ["Alt", "."]),
        },
      ],
    },
    {
      id: "history",
      title: "History",
      intro: "Search and move through previous commands, then reuse or edit the one you need.",
      shortcuts: [
        {
          id: "previous-history",
          action: "Previous history entry",
          keys: combo(platforms, ["Up"]),
          note: "Down moves forward through history.",
        },
        {
          id: "reverse-search",
          action: "Search history backwards interactively",
          keys: combo(platforms, ["Ctrl", "R"]),
          note: "Press again to keep searching older entries; Enter accepts the line.",
        },
        {
          id: "forward-search",
          action: "Search history forwards interactively",
          keys: combo(platforms, ["Ctrl", "S"]),
        },
        {
          id: "history-search-backward",
          action: "Jump to the previous history entry starting with what you typed",
          keys: combo(platforms, ["Ctrl", "Shift", "Up"] ),
          note: "Ctrl+Shift+Down searches forward the same way.",
        },
      ],
    },
    {
      id: "completion",
      title: "Completion",
      intro:
        "Tab behavior depends on your PSReadLine configuration; MenuComplete shows every option instead of cycling one at a time.",
      shortcuts: [
        {
          id: "menu-complete",
          action: "Show completion options in a menu",
          keys: perPlatform(platforms, {
            windows: ["Tab"],
            macos: ["Ctrl", "Space"],
            linux: ["Ctrl", "Space"],
          }),
          note: "On Windows, Tab is bound to MenuComplete by default; elsewhere Ctrl+Space is.",
        },
        {
          id: "show-all-options",
          action: "List every possible completion",
          keys: combo(platforms, ["Ctrl", "D"]),
          note: "In Emacs mode this exits the shell instead; the binding applies in Windows mode.",
        },
      ],
    },
  ],
};
