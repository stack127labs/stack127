import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

export const milanote: AppShortcuts = {
  slug: "milanote",
  name: "Milanote",
  category: "Notes and docs",
  platforms: [...platforms],
  versionContext:
    "Current Milanote desktop and browser shortcuts checked September 1, 2026. Milanote also supports an in-app shortcut menu, and several actions depend on whether a note, board, table, or drawing is selected.",
  sourceUrl: "https://help.milanote.com/en/articles/111393-keyboard-shortcuts",
  sourceLabel: "official Milanote keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "basics",
      title: "Board basics",
      intro: "These commands edit selected cards and move around a board. Some actions need an object selected before the key has an effect.",
      shortcuts: [
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("stop-editing", "Deselect or stop editing", ["Escape"], ["Escape"]),
        dual("delete", "Delete an object", ["Delete"], ["Delete"]),
        dual("duplicate", "Duplicate by dragging", ["Alt", "drag"], ["Option", "drag"]),
        dual("search", "Search or view recent boards", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("zoom", "Zoom", ["Z"], ["Z"]),
        dual("pan", "Move around the board", ["Space", "drag"], ["Space", "drag"]),
        dual("nudge", "Nudge an object", ["Arrow keys"], ["Arrow keys"]),
        dual("nudge-more", "Move an object farther", ["Shift", "Arrow keys"], ["Shift", "Arrow keys"]),
      ],
    },
    {
      id: "text",
      title: "Text formatting",
      intro: "Formatting keys apply while a text card is being edited. The heading numbers select Milanote's heading sizes rather than Markdown heading levels.",
      shortcuts: [
        dual("large-heading", "Large heading", ["Ctrl", "Shift", "1"], ["Cmd", "Shift", "1"]),
        dual("normal-heading", "Normal heading", ["Ctrl", "Shift", "2"], ["Cmd", "Shift", "2"]),
        dual("bold", "Bold", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italic", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("bullet-list", "Bullet list", ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]),
        dual("numbered-list", "Numbered list", ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]),
        dual("link", "Add a link", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("highlight", "Highlight", ["Ctrl", "J"], ["Cmd", "J"]),
        dual("strikethrough", "Strikethrough", ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        dual("code-block", "Code block", ["Ctrl", ">"], ["Cmd", ">"]),
        dual("quote", "Quote", ["Ctrl", '"'], ["Cmd", '"']),
        dual("underline", "Underline", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("indent", "Indent", ["Tab"], ["Tab"]),
        dual("unindent", "Un-indent", ["Shift", "Tab"], ["Shift", "Tab"]),
        dual("align-center", "Align centre", ["Ctrl", "\\"], ["Cmd", "\\"]),
      ],
    },
    {
      id: "tables-and-drawing",
      title: "Tables and drawing",
      intro: "Milanote gives tables and drawings their own single-key tools. Table arrows act on the selected cell, while drawing keys apply inside the drawing editor.",
      shortcuts: [
        dual("add-function", "Add a table function", ["="], ["="]),
        dual("add-column-row", "Add a column or row", ["Alt", "Arrow keys"], ["Option", "Arrow keys"]),
        dual("last-cell", "Skip to the last cell in a row or column", ["Ctrl", "Arrow keys"], ["Cmd", "Arrow keys"]),
        dual("select-cells", "Select multiple cells", ["Shift", "Arrow keys"], ["Shift", "Arrow keys"]),
        dual("start-drawing", "Start drawing", ["Shift", "D"], ["Shift", "D"]),
        dual("pen", "Switch to pen", ["D"], ["D"]),
        dual("selection-tool", "Switch to selection", ["V"], ["V"]),
        dual("eraser", "Switch to eraser", ["E"], ["E"]),
        dual("previous-color", "Use the previous colour", ["X"], ["X"]),
        dual("pen-size", "Change pen size", ["1", "2", "3", "4"], ["1", "2", "3", "4"]),
        dual("save-drawing", "Save the drawing", ["Escape"], ["Escape"]),
      ],
    },
    {
      id: "navigation-and-appearance",
      title: "Navigation and appearance",
      intro: "These commands move between boards and change the Milanote interface. The appearance controls affect the whole desktop or browser workspace.",
      shortcuts: [
        dual("back", "Go back", ["Ctrl", "["], ["Cmd", "["]),
        dual("forward", "Go forward", ["Ctrl", "]"], ["Cmd", "]"]),
        dual("parent-board", "Go to the parent board", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("dark-mode", "Toggle dark mode", ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]),
        dual("smaller", "Make the interface smaller", ["Ctrl", "Shift", "<"], ["Cmd", "Shift", "<"]),
        dual("larger", "Make the interface larger", ["Ctrl", "Shift", ">"], ["Cmd", "Shift", ">"]),
      ],
    },
  ],
};

export default milanote;
