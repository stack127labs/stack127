import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const key = (platform: "windows" | "macos", keys: string[], alternatives?: string[][]): ShortcutKey => ({ platform, keys, ...(alternatives ? { alternatives } : {}) });
const pair = (id: string, action: string, win: string[], mac: string[], winAlt?: string[][], macAlt?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [key("windows", win, winAlt), key("macos", mac, macAlt)],
  ...(note ? { note } : {}),
});
const shared = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => pair(id, action, keys, keys, alternatives, alternatives, note);

export const coda: AppShortcuts = {
  slug: "coda",
  name: "Coda",
  category: "Collaborative documents",
  platforms: ["windows", "macos"],
  intro:
    "Coda combines document navigation, rich-text formatting, insert triggers, and table movement. Several keys change behavior with focus, so page, paragraph, and table commands are separated here.",
  versionContext:
    "Current complete Coda Mac and PC shortcut reference checked August 31, 2026. Coda labels Windows shortcuts as PC. Identical keys are retained where its platform tables agree, including Control-based indentation on Mac.",
  sourceUrl: "https://help.coda.io/hc/en-us/articles/39555894316173-Keyboard-shortcuts",
  sourceLabel: "Coda keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "general",
      title: "General and page navigation",
      intro: "Page-history chords differ by platform. Arrow keys navigate subpages only when the subpage header control has focus.",
      shortcuts: [
        pair("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        pair("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        pair("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        pair("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        pair("redo", "Redo", ["Ctrl", "Y"], ["Cmd", "Shift", "Z"]),
        pair("search", "Search", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        pair("previous-page", "Go to the previous page", ["Ctrl", "Alt", "Up"], ["Cmd", "Option", "["]),
        pair("next-page", "Go to the next page", ["Ctrl", "Alt", "Down"], ["Cmd", "Option", "]"]),
        pair("explore", "Open the Explore panel", ["Ctrl", "/"], ["Cmd", "/"]),
        pair("page-list", "Toggle the page list", ["Ctrl", "\\"], ["Cmd", "\\"]),
        pair("word-count", "Show the word count", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]),
        pair("present", "Present the doc", ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        shared("subpage-navigation", "Navigate subpages in the header", ["Arrow keys"]),
        shared("open-page-link", "Open the highlighted page link", ["Enter"]),
        shared("parent-page", "Move from a subpage to its parent", ["Shift", "Esc"]),
        pair("collapse-section", "Expand or collapse the current section", ["Ctrl", "."], ["Cmd", "."]),
        pair("collapse-all", "Expand or collapse all sections", ["Ctrl", "Alt", "Shift", "."], ["Cmd", "Option", "."]),
        pair("shortcut-help", "Open the in-product shortcut list", ["Ctrl", "Shift", "/"], ["Ctrl", "/"]),
      ],
    },
    {
      id: "text",
      title: "Text formatting",
      intro: "Inline code requires selected text. Expand Cell applies while editing content inside a table cell.",
      shortcuts: [
        pair("bold", "Bold", ["Ctrl", "B"], ["Cmd", "B"]),
        pair("italic", "Italic", ["Ctrl", "I"], ["Cmd", "I"]),
        pair("underline", "Underline", ["Ctrl", "U"], ["Cmd", "U"]),
        pair("strikethrough", "Strikethrough", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        shared("inline-code", "Apply inline code to selected text", ["`"]),
        pair("expand-cell", "Expand the current cell", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
      ],
    },
    {
      id: "paragraphs",
      title: "Paragraphs and lists",
      intro: "Header and collapsible-list numbers differ on Windows and Mac. Brackets indent or outdent, and arrows move the entire current paragraph.",
      shortcuts: [
        { id: "normal", action: "Apply normal paragraph style", keys: [key("macos", ["Cmd", "Option", "0"])] },
        pair("large-header", "Apply a large header", ["Ctrl", "Shift", "1"], ["Cmd", "Option", "1"]),
        pair("medium-header", "Apply a medium header", ["Ctrl", "Shift", "2"], ["Cmd", "Option", "2"]),
        pair("small-header", "Apply a small header", ["Ctrl", "Shift", "3"], ["Cmd", "Option", "3"]),
        pair("numbered-list", "Create a numbered list", ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]),
        pair("bulleted-list", "Create a bulleted list", ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]),
        pair("checklist", "Create a checklist", ["Ctrl", "Shift", "9"], ["Cmd", "Shift", "9"]),
        pair("collapsible", "Create a collapsible list", ["Ctrl", "Shift", "6"], ["Cmd", "Shift", "0"]),
        pair("block-quote", "Create a block quote", ["Ctrl", "Shift", "."], ["Cmd", "Shift", "."]),
        pair("pull-quote", "Create a pull quote", ["Ctrl", "Shift", "'"], ["Cmd", "Shift", "'"]),
        pair("code-block", "Create a code block", ["Ctrl", "Shift", ","], ["Cmd", "Shift", ","]),
        shared("indent", "Indent the paragraph", ["Ctrl", "]"]),
        shared("outdent", "Outdent the paragraph", ["Ctrl", "["]),
        pair("move-up", "Move the paragraph up", ["Alt", "Up"], ["Option", "Up"]),
        pair("move-down", "Move the paragraph down", ["Alt", "Down"], ["Option", "Down"]),
        pair("check-item", "Check the current list item", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
      ],
    },
    {
      id: "insert",
      title: "Insert and reference",
      intro: "Single-character triggers open reference, formula, and emoji entry. Comment and date commands use platform modifiers.",
      shortcuts: [
        shared("reference", "Insert a reference", ["@"]),
        shared("formula", "Start a formula", ["="]),
        pair("hyperlink", "Insert a hyperlink", ["Ctrl", "K"], ["Cmd", "K"]),
        shared("emoji", "Insert an emoji by name", [":"], undefined, "Type the emoji name and a closing colon."),
        pair("comment", "Add a comment", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        pair("today", "Insert today's date", ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]),
      ],
    },
    {
      id: "tables",
      title: "Tables",
      intro: "Row and column commands require table focus. Enter and Tab insert only from the table's final row or selected final column.",
      shortcuts: [
        pair("open-row", "Open the current row", ["Alt", "Space"], ["Option", "Space"]),
        shared("select-row", "Select the current row", ["Shift", "Space"]),
        shared("select-rows-up", "Extend row selection upward", ["Shift", "Up"]),
        shared("select-rows-down", "Extend row selection downward", ["Shift", "Down"]),
        pair("move-row-up", "Move the current row up", ["Alt", "Up"], ["Option", "Up"]),
        pair("move-row-down", "Move the current row down", ["Alt", "Down"], ["Option", "Down"]),
        pair("move-column-left", "Move the current column left", ["Alt", "Left"], ["Option", "Left"]),
        pair("move-column-right", "Move the current column right", ["Alt", "Right"], ["Option", "Right"]),
        shared("insert-row", "Insert a row from the last table row", ["Enter"]),
        shared("insert-column", "Insert a column when the last column is selected", ["Tab"]),
        pair("table-edge-up", "Move to the top of the row or column", ["Ctrl", "Up"], ["Cmd", "Up"]),
        pair("table-edge-down", "Move to the bottom of the row or column", ["Ctrl", "Down"], ["Cmd", "Down"]),
        pair("table-edge-left", "Move to the left end of the row or column", ["Ctrl", "Left"], ["Cmd", "Left"]),
        pair("table-edge-right", "Move to the right end of the row or column", ["Ctrl", "Right"], ["Cmd", "Right"]),
        shared("edit-cell", "Edit the current cell", ["Space"], [["F2"]]),
      ],
    },
  ],
};

export default coda;
