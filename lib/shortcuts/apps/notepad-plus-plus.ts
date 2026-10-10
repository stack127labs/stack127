import type { AppShortcuts, Shortcut } from "../types.ts";

const win = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys, ...(alternatives?.length ? { alternatives } : {}) }],
  ...(note ? { note } : {}),
});

export const notepadPlusPlus: AppShortcuts = {
  slug: "notepad-plus-plus",
  name: "Notepad++",
  category: "Text editor",
  platforms: ["windows"],
  versionContext:
    "Notepad++ current user manual shortcuts checked September 1, 2026. Defaults can differ after editing Settings > Shortcut Mapper, and the manual notes that keyboard layout behavior changed in version 8.7.6.",
  sourceUrl: "https://npp-user-manual.org/docs/user-interface/",
  sourceLabel: "official Notepad++ user manual shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "files-and-tabs",
      title: "Files and tabs",
      intro: "Create, open, save, close, and move through files and tabs in the Notepad++ editor.",
      shortcuts: [
        win("new-file", "Create a new file", ["Ctrl", "N"]),
        win("open-file", "Open a file", ["Ctrl", "O"]),
        win("save", "Save the current file", ["Ctrl", "S"]),
        win("save-as", "Save as", ["Ctrl", "Shift", "S"]),
        win("close-file", "Close the current file", ["Ctrl", "W"]),
        win("close-all", "Close all files", ["Ctrl", "Shift", "W"]),
        win("next-tab", "Activate the next tab", ["Ctrl", "Page Down"]),
        win("previous-tab", "Activate the previous tab", ["Ctrl", "Page Up"]),
        win("reopen-closed", "Reopen the last closed tab", ["Ctrl", "Shift", "T"]),
        win("print", "Print", ["Ctrl", "P"]),
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Use the documented Scintilla editor defaults to select, copy, paste, indent, and change the current line.",
      shortcuts: [
        win("undo", "Undo", ["Ctrl", "Z"]),
        win("redo", "Redo", ["Ctrl", "Y"], [["Ctrl", "Shift", "Z"]]),
        win("cut", "Cut", ["Ctrl", "X"]),
        win("copy", "Copy", ["Ctrl", "C"]),
        win("paste", "Paste", ["Ctrl", "V"]),
        win("select-all", "Select all", ["Ctrl", "A"]),
        win("backtab", "Un-indent or move the caret one tab earlier", ["Shift", "Tab"]),
        win("cancel", "Cancel completion or simplify a selection", ["Escape"]),
        win("delete-line", "Delete the current line", ["Ctrl", "Shift", "L"]),
        win("duplicate-line", "Duplicate the current line", ["Ctrl", "D"]),
        win("line-up", "Move the current line up", ["Ctrl", "Shift", "Up"]),
        win("line-down", "Move the current line down", ["Ctrl", "Shift", "Down"]),
        win("function-hint", "Show function parameter hints", ["Ctrl", "Shift", "Space"]),
      ],
    },
    {
      id: "search-and-view",
      title: "Search and view",
      intro: "Find text, repeat a search, change the view, and access Notepad++ panels with these documented defaults.",
      shortcuts: [
        win("find", "Find", ["Ctrl", "F"]),
        win("replace", "Replace", ["Ctrl", "H"]),
        win("find-next", "Find next", ["F3"]),
        win("find-previous", "Find previous", ["Shift", "F3"]),
        win("select-find-next", "Select and find next", ["Ctrl", "F3"]),
        win("select-find-previous", "Select and find previous", ["Ctrl", "Shift", "F3"]),
        win("zoom-in", "Zoom in", ["Ctrl", "+"]),
        win("zoom-out", "Zoom out", ["Ctrl", "-"]),
        win("zoom-reset", "Reset zoom", ["Ctrl", "0"]),
        win("fullscreen", "Toggle full screen", ["F11"]),
        win("tools-window", "Show or hide the selected tool window", ["F5"]),
        win("menu", "Open a main menu with an accelerator", ["Alt", "Underlined letter"], undefined, "Menu accelerators can be preempted by a custom Shortcut Mapper binding."),
      ],
    },
  ],
};

export default notepadPlusPlus;
