import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

export const excel: AppShortcuts = {
  slug: "excel",
  name: "Microsoft Excel",
  category: "Spreadsheet",
  platforms: ["windows"],
  intro:
    "Excel rewards staying in the grid. These Windows shortcuts move through a sheet, extend selections, edit cells in place, format values, and turn a range into something you can sort or filter.",
  versionContext:
    "Documented defaults from Microsoft Support in August 2026. On macOS most of these work with Command in place of Ctrl, but a few differ; check Microsoft's Mac list before relying on a specific one.",
  sourceUrl: "https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-excel-1798d9d5-842a-42b8-9c99-9b7213f0040f",
  sourceLabel: "official Excel shortcut list",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "navigation",
      title: "Navigation and selection",
      intro: "Move across a worksheet and extend selections by cell, region, row, column, or data boundary.",
      shortcuts: [
        {
          id: "edge-of-data",
          action: "Move to the edge of the data region",
          keys: [{ platform: "windows", keys: ["Ctrl", "Arrow"] }],
          note: "Works with each arrow key direction.",
        },
        {
          id: "select-to-edge",
          action: "Select from here to the edge of the data region",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Arrow"] }],
        },
        {
          id: "go-to-a1",
          action: "Move to cell A1",
          keys: [{ platform: "windows", keys: ["Ctrl", "Home"] }],
        },
        {
          id: "last-cell",
          action: "Move to the last used cell",
          keys: [{ platform: "windows", keys: ["Ctrl", "End"] }],
        },
        {
          id: "next-sheet",
          action: "Switch to the next worksheet",
          keys: [{ platform: "windows", keys: ["Ctrl", "Page Down"] }],
          note: "Ctrl+Page Up switches back.",
        },
        { id: "close-workbook", action: "Close the current workbook", keys: [{ platform: "windows", keys: ["Ctrl", "W"] }] },
        { id: "select-row", action: "Select the current row", keys: [{ platform: "windows", keys: ["Shift", "Space"] }] },
        { id: "select-column", action: "Select the current column", keys: [{ platform: "windows", keys: ["Ctrl", "Space"] }] },
        { id: "select-region", action: "Select the current data region", keys: [{ platform: "windows", keys: ["Ctrl", "A"] }] },
        { id: "page-down", action: "Move one screen down", keys: [{ platform: "windows", keys: ["Page Down"] }] },
        { id: "page-up", action: "Move one screen up", keys: [{ platform: "windows", keys: ["Page Up"] }] },
      ],
    },
    {
      id: "cell-editing",
      title: "Cell editing",
      intro: "Enter, cancel, repeat, and edit formulas or values without leaving the grid.",
      shortcuts: [
        {
          id: "edit-cell",
          action: "Edit the active cell",
          keys: [{ platform: "windows", keys: ["F2"] }],
        },
        {
          id: "newline-in-cell",
          action: "Start a new line inside the cell",
          keys: [{ platform: "windows", keys: ["Alt", "Enter"] }],
        },
        {
          id: "fill-down",
          action: "Fill down from the cell above",
          keys: [{ platform: "windows", keys: ["Ctrl", "D"] }],
        },
        {
          id: "fill-right",
          action: "Fill right from the cell to the left",
          keys: [{ platform: "windows", keys: ["Ctrl", "R"] }],
        },
        {
          id: "insert-date",
          action: "Insert today's date",
          keys: [{ platform: "windows", keys: ["Ctrl", ";"] }],
        },
        {
          id: "insert-time",
          action: "Insert the current time",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", ";"] }],
        },
        {
          id: "repeat-action",
          action: "Repeat the last action",
          keys: [{ platform: "windows", keys: ["F4"] }],
          note: "While editing a formula, F4 instead cycles a reference through absolute and relative forms.",
        },
        { id: "cancel-edit", action: "Cancel the current cell entry", keys: [{ platform: "windows", keys: ["Esc"] }] },
        { id: "remove-content", action: "Remove the contents of selected cells", keys: [{ platform: "windows", keys: ["Delete"] }] },
        { id: "insert-function", action: "Insert a function", keys: [{ platform: "windows", keys: ["Shift", "F3"] }] },
      ],
    },
    {
      id: "formatting",
      title: "Formatting",
      intro: "Apply number formats, borders, alignment, and other common presentation changes to the selection.",
      shortcuts: [
        {
          id: "format-cells",
          action: "Open the Format Cells dialog",
          keys: [{ platform: "windows", keys: ["Ctrl", "1"] }],
        },
        {
          id: "format-number",
          action: "Apply the General number format",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "~"] }],
        },
        {
          id: "format-currency",
          action: "Apply the Currency format",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "$"] }],
        },
        {
          id: "format-percent",
          action: "Apply the Percentage format",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "%"] }],
        },
        {
          id: "show-formulas",
          action: "Toggle showing formulas instead of results",
          keys: [{ platform: "windows", keys: ["Ctrl", "`"] }],
        },
        { id: "format-bold", action: "Apply bold formatting", keys: [{ platform: "windows", keys: ["Ctrl", "B"] }] },
        { id: "format-underline", action: "Apply underline formatting", keys: [{ platform: "windows", keys: ["Ctrl", "U"] }] },
        { id: "format-italic", action: "Apply italic formatting", keys: [{ platform: "windows", keys: ["Ctrl", "I"] }] },
        { id: "format-date", action: "Apply the date format", keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "#"] }] },
        { id: "format-time", action: "Apply the time format", keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "@"] }] },
        { id: "format-border", action: "Apply an outline border", keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "&"] }] },
      ],
    },
    {
      id: "tables-and-data",
      title: "Tables and data",
      intro: "Sort, filter, refresh, and work with structured ranges once the sheet becomes a dataset.",
      shortcuts: [
        {
          id: "create-table",
          action: "Create a table from the current range",
          keys: [{ platform: "windows", keys: ["Ctrl", "T"] }],
        },
        {
          id: "toggle-filter",
          action: "Turn filter buttons on or off",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "L"] }],
        },
        {
          id: "hyperlink",
          action: "Insert a hyperlink",
          keys: [{ platform: "windows", keys: ["Ctrl", "K"] }],
        },
        {
          id: "new-sheet",
          action: "Insert a new worksheet",
          keys: [{ platform: "windows", keys: ["Shift", "F11"] }],
        },
        {
          id: "hide-rows",
          action: "Hide the selected rows",
          keys: [{ platform: "windows", keys: ["Ctrl", "9"] }],
          note: "Ctrl+Shift+9 unhides them.",
        },
        { id: "hide-columns", action: "Hide the selected columns", keys: [{ platform: "windows", keys: ["Ctrl", "0"] }] },
        { id: "insert-row", action: "Insert rows, columns, or cells", keys: [{ platform: "windows", keys: ["Ctrl", "+"] }] },
        { id: "delete-row", action: "Delete selected rows, columns, or cells", keys: [{ platform: "windows", keys: ["Ctrl", "-"] }] },
        { id: "refresh-data", action: "Refresh external data", keys: [{ platform: "windows", keys: ["Alt", "F5"] }] },
        { id: "open-context-menu", action: "Open the context menu", keys: [{ platform: "windows", keys: ["Shift", "F10"] }] },
      ],
    },
    {
      id: "ribbon-and-functions",
      title: "Ribbon and functions",
      intro: "Jump to Excel's main tabs and reach formula, data, and layout commands through Key Tips.",
      shortcuts: [
        { id: "home-tab", action: "Go to the Home tab", keys: [{ platform: "windows", keys: ["Alt", "H"] }] },
        { id: "insert-tab", action: "Go to the Insert tab", keys: [{ platform: "windows", keys: ["Alt", "N"] }] },
        { id: "page-layout-tab", action: "Go to the Page Layout tab", keys: [{ platform: "windows", keys: ["Alt", "P"] }] },
        { id: "data-tab", action: "Go to the Data tab", keys: [{ platform: "windows", keys: ["Alt", "A"] }] },
        { id: "view-tab", action: "Go to the View tab", keys: [{ platform: "windows", keys: ["Alt", "W"] }] },
        { id: "formula-tab", action: "Go to the Formulas tab", keys: [{ platform: "windows", keys: ["Alt", "M"] }] },
        { id: "autosum", action: "Insert an AutoSum formula", keys: [{ platform: "windows", keys: ["Alt", "="] }] },
        { id: "show-formula-bar", action: "Expand or collapse the formula bar", keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "U"] }] },
      ],
    },
  ],
};
