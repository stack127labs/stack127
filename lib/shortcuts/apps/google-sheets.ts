import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const googleSheets: AppShortcuts = {
  slug: "google-sheets",
  name: "Google Sheets",
  category: "Spreadsheet",
  platforms: [...platforms],
  intro:
    "Sheets is easiest to use when the selection stays in the grid. These shortcuts move through cells, edit formulas and values, format a range, and open the tools that change how data is handled.",
  versionContext:
    "Documented defaults from Google's Sheets Help in August 2026. macOS uses Cmd where Windows and Linux use Ctrl. Some shortcuts conflict with browser keys; Sheets offers a compatibility mode in its shortcut help.",
  sourceUrl: "https://support.google.com/docs/answer/181110",
  sourceLabel: "official Sheets keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "navigation",
      title: "Navigation and selection",
      intro: "Move through cells and ranges, jump to the edge of data, and extend the current selection.",
      shortcuts: [
        {
          id: "edge-of-data",
          action: "Move to the edge of the data region",
          keys: combo(platforms, ["Ctrl", "Arrow"], ["Cmd", "Arrow"]),
          note: "Works with each arrow key direction.",
        },
        {
          id: "select-to-edge",
          action: "Select from here to the edge of the data region",
          keys: combo(platforms, ["Ctrl", "Shift", "Arrow"], ["Cmd", "Shift", "Arrow"]),
        },
        { id: "go-home", action: "Move to the beginning of the sheet", keys: combo(platforms, ["Ctrl", "Home"], ["Cmd", "Home"]) },
        {
          id: "next-sheet",
          action: "Move to the next sheet",
          keys: [
            { platform: "windows", keys: ["Ctrl", "Shift", "Page Down"] },
            { platform: "macos", keys: ["Cmd", "Shift", "Fn", "Down"] },
            { platform: "linux", keys: ["Ctrl", "Shift", "Page Down"] },
          ],
          note: "The same chord with Up or Page Up moves to the previous sheet.",
        },
        {
          id: "select-column",
          action: "Select the current column",
          keys: combo(platforms, ["Ctrl", "Space"], ["Ctrl", "Space"]),
        },
        {
          id: "select-row",
          action: "Select the current row",
          keys: combo(platforms, ["Shift", "Space"], ["Shift", "Space"]),
        },
        {
          id: "go-to-range",
          action: "Open the Go to range dialog",
          keys: [{ platform: "macos", keys: ["Ctrl", "G"] }, { platform: "windows", keys: ["Ctrl", "G"] }, { platform: "linux", keys: ["Ctrl", "G"] }],
        },
        {
          id: "first-row",
          action: "Move to the beginning of the current row",
          keys: [{ platform: "windows", keys: ["Home"] }, { platform: "macos", keys: ["Fn", "Left"] }, { platform: "linux", keys: ["Home"] }],
        },
        {
          id: "last-row",
          action: "Move to the end of the current row",
          keys: [{ platform: "windows", keys: ["End"] }, { platform: "macos", keys: ["Fn", "Right"] }, { platform: "linux", keys: ["End"] }],
        },
        {
          id: "previous-sheet",
          action: "Move to the previous sheet",
          keys: [{ platform: "windows", keys: ["Alt", "Up"] }, { platform: "macos", keys: ["Option", "Up"] }, { platform: "linux", keys: ["Alt", "Up"] }],
        },
        {
          id: "sheet-list",
          action: "Display the list of sheets",
          keys: combo(platforms, ["Alt", "Shift", "K"], ["Option", "Shift", "K"]),
        },
      ],
    },
    {
      id: "editing",
      title: "Editing cells",
      intro: "Enter values and formulas, fill or repeat them, and undo changes while staying in the sheet.",
      shortcuts: [
        {
          id: "edit-cell",
          action: "Edit the active cell",
          keys: combo(platforms, ["Enter"]),
          note: "F2 also edits on Windows and Linux.",
        },
        {
          id: "newline-in-cell",
          action: "Start a new line inside the cell",
          keys: combo(platforms, ["Alt", "Enter"], ["Option", "Enter"]),
        },
        {
          id: "fill-down",
          action: "Fill down from the cell above",
          keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]),
        },
        {
          id: "fill-right",
          action: "Fill right from the cell to the left",
          keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]),
        },
        {
          id: "insert-date",
          action: "Insert today's date",
          keys: combo(platforms, ["Ctrl", ";"], ["Cmd", ";"]),
        },
        {
          id: "insert-time",
          action: "Insert the current time",
          keys: combo(platforms, ["Ctrl", "Shift", ";"], ["Cmd", "Shift", ";"]),
        },
        {
          id: "clear-formatting",
          action: "Clear formatting from the selection",
          keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]),
        },
        {
          id: "fill-range",
          action: "Fill the selected range with the current entry",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        },
        {
          id: "paste-values",
          action: "Paste values only",
          keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
        },
        {
          id: "show-shortcuts",
          action: "Show the keyboard shortcuts list",
          keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]),
        },
        {
          id: "tool-finder",
          action: "Open the tool finder",
          keys: [{ platform: "windows", keys: ["Alt", "/"] }, { platform: "macos", keys: ["Option", "/"] }, { platform: "linux", keys: ["Alt", "/"] }],
        },
        {
          id: "insert-sheet",
          action: "Insert a new sheet",
          keys: [{ platform: "windows", keys: ["Shift", "F11"] }, { platform: "macos", keys: ["Shift", "Fn", "F11"] }, { platform: "linux", keys: ["Shift", "F11"] }],
        },
      ],
    },
    {
      id: "formatting",
      title: "Formatting",
      intro: "Apply number formats, text styles, borders, alignment, and other changes to the selection.",
      shortcuts: [
        { id: "bold", action: "Bold", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italic", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        {
          id: "number-format",
          action: "Apply the default number format",
          keys: combo(platforms, ["Ctrl", "Shift", "1"], ["Cmd", "Shift", "1"]),
          note: "Digits 2 through 5 apply time, date, currency, and percentage formats.",
        },
        { id: "strikethrough", action: "Strikethrough", keys: combo(platforms, ["Alt", "Shift", "5"], ["Cmd", "Shift", "X"]) },
        { id: "center-align", action: "Center align", keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]) },
        { id: "left-align", action: "Left align", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "right-align", action: "Right align", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]) },
        { id: "decimal-format", action: "Format as decimal", keys: combo(platforms, ["Ctrl", "Shift", "1"], ["Ctrl", "Shift", "1"]) },
        { id: "time-format", action: "Format as time", keys: combo(platforms, ["Ctrl", "Shift", "2"], ["Ctrl", "Shift", "2"]) },
        { id: "date-format", action: "Format as date", keys: combo(platforms, ["Ctrl", "Shift", "3"], ["Ctrl", "Shift", "3"]) },
        { id: "currency-format", action: "Format as currency", keys: combo(platforms, ["Ctrl", "Shift", "4"], ["Ctrl", "Shift", "4"]) },
        { id: "percentage-format", action: "Format as percentage", keys: combo(platforms, ["Ctrl", "Shift", "5"], ["Ctrl", "Shift", "5"]) },
        { id: "exponent-format", action: "Format as exponent", keys: combo(platforms, ["Ctrl", "Shift", "6"], ["Ctrl", "Shift", "6"]) },
      ],
    },
    {
      id: "data-and-tools",
      title: "Data and tools",
      intro: "Open menus, comments, links, filters, and spreadsheet tools without leaving the grid.",
      shortcuts: [
        {
          id: "find",
          action: "Open find and replace",
          keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]),
        },
        {
          id: "undo",
          action: "Undo",
          keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]),
        },
        {
          id: "redo",
          action: "Redo",
          keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Y"]),
        },
        {
          id: "insert-link",
          action: "Insert a link",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
        },
        {
          id: "explore",
          action: "Open Explore for automatic analysis",
          keys: combo(platforms, ["Ctrl", "Alt", "Shift", "E"], ["Cmd", "Option", "Shift", "E"]),
        },
        { id: "find-replace", action: "Open find and replace", keys: [{ platform: "windows", keys: ["Ctrl", "H"] }, { platform: "macos", keys: ["Cmd", "Shift", "H"] }, { platform: "linux", keys: ["Ctrl", "H"] }] },
        { id: "insert-note", action: "Insert or edit a note", keys: combo(platforms, ["Shift", "F2"], ["Shift", "F2"]) },
        { id: "insert-comment", action: "Insert or edit a comment", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "M"] }, { platform: "macos", keys: ["Cmd", "Option", "M"] }, { platform: "linux", keys: ["Ctrl", "Alt", "M"] }] },
        { id: "revision-history", action: "Open revision history", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "Shift", "H"] }, { platform: "macos", keys: ["Cmd", "Option", "Shift", "H"] }, { platform: "linux", keys: ["Ctrl", "Alt", "Shift", "H"] }] },
        { id: "insert-menu", action: "Open the insert menu", keys: combo(platforms, ["Ctrl", "Alt", "="], ["Cmd", "Option", "="]) },
        { id: "delete-menu", action: "Open the delete menu", keys: combo(platforms, ["Ctrl", "Alt", "-"], ["Cmd", "Option", "-"]) },
        { id: "context-menu", action: "Open the context menu", keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "\\"] }, { platform: "macos", keys: ["Cmd", "Shift", "\\"] }, { platform: "linux", keys: ["Ctrl", "Shift", "\\"] }] },
        { id: "show-formulas", action: "Show all formulas", keys: combo(platforms, ["Ctrl", "~"], ["Ctrl", "~"]) },
        { id: "absolute-reference", action: "Cycle absolute and relative references while entering a formula", keys: [{ platform: "windows", keys: ["F4"] }, { platform: "macos", keys: ["Fn", "F4"] }, { platform: "linux", keys: ["F4"] }] },
        { id: "filter-cell-menu", action: "Open a drop-down menu on a filtered cell", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "R"] }, { platform: "macos", keys: ["Ctrl", "Cmd", "R"] }, { platform: "linux", keys: ["Ctrl", "Alt", "R"] }] },
        { id: "hide-row", action: "Hide the selected row", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "9"] }, { platform: "macos", keys: ["Cmd", "Option", "9"] }, { platform: "linux", keys: ["Ctrl", "Alt", "9"] }] },
        { id: "hide-column", action: "Hide the selected column", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "0"] }, { platform: "macos", keys: ["Cmd", "Option", "0"] }, { platform: "linux", keys: ["Ctrl", "Alt", "0"] }] },
        { id: "group-selection", action: "Group selected rows or columns", keys: combo(platforms, ["Alt", "Shift", "Right"], ["Option", "Shift", "Right"]) },
        { id: "ungroup-selection", action: "Ungroup selected rows or columns", keys: combo(platforms, ["Alt", "Shift", "Left"], ["Option", "Shift", "Left"]) },
        { id: "array-formula", action: "Insert an array formula", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]) },
      ],
    },
  ],
};
