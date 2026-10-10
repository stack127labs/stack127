import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const smartsheet: AppShortcuts = {
  slug: "smartsheet",
  name: "Smartsheet",
  category: "Project management",
  platforms: [...platforms],
  versionContext:
    "Smartsheet keyboard shortcuts checked September 1, 2026. The official Learning Center table says Mac users should use Command instead of Ctrl for the paired shortcuts.",
  sourceUrl: "https://help.smartsheet.com/articles/522200-keyboard-shortcuts",
  sourceLabel: "official Smartsheet keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing and sheet changes",
      intro: "Editing shortcuts handle clipboard work, saving, cell editing, fill operations, hyperlinks, and the row dialog used for structured updates.",
      shortcuts: [
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "save", action: "Save unsaved information", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "edit-cell", action: "Enter edit mode for the selected cell", keys: perPlatform(platforms, { windows: ["F2"], macos: ["Fn", "F2"] }) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Y"]) },
        { id: "fill-down", action: "Fill down", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "hyperlink", action: "Open the Hyperlink dialog", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "edit-row", action: "Open the Edit Row dialog", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "insert-row", action: "Insert a row above the selected row", keys: perPlatform(platforms, { windows: ["Insert"], macos: ["Ctrl", "I"] }) },
      ],
    },
    {
      id: "navigation",
      title: "Search and navigation",
      intro: "Navigation shortcuts open sheets and search dialogs, jump to rows or sheet edges, and move through the current grid.",
      shortcuts: [
        { id: "open-sheet", action: "Open a sheet", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "find", action: "Find information within a sheet", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "advanced-search", action: "Open the advanced Search dialog", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]) },
        { id: "go-to-row", action: "Open the Go To Row dialog", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "first-cell-row", action: "Go to the first cell of the current row", keys: perPlatform(platforms, { windows: ["Home"], macos: ["Fn", "Left"] }) },
        { id: "last-cell-row", action: "Go to the last cell of the current row", keys: perPlatform(platforms, { windows: ["End"], macos: ["Fn", "Right"] }) },
        { id: "top-left", action: "Go to the top-left cell", keys: perPlatform(platforms, { windows: ["Ctrl", "Home"], macos: ["Fn", "Control", "Left"] }) },
        { id: "bottom-right", action: "Go to the bottom-right cell", keys: perPlatform(platforms, { windows: ["Ctrl", "End"], macos: ["Fn", "Control", "Right"] }) },
        { id: "file-menu", action: "Open the File menu", keys: perPlatform(platforms, { windows: ["Alt", "F"], macos: ["Option", "F"] }) },
      ],
    },
    {
      id: "hierarchy-and-formatting",
      title: "Hierarchy and formatting",
      intro: "Hierarchy and formatting keys change row depth, insert line breaks in cells, and apply the basic text styles available in a sheet.",
      shortcuts: [
        { id: "indent", action: "Indent the row", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "outdent", action: "Outdent the row", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "line-break", action: "Insert a line break in a Text/Number cell", keys: perPlatform(platforms, { windows: ["Alt", "Enter"], macos: ["Cmd", "Return"] }) },
        { id: "italic", action: "Italic", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "bold", action: "Bold", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "bullet", action: "Insert a bullet point in a cell", keys: perPlatform(platforms, { windows: ["Alt", "0149"], macos: ["Option", "8"] }) },
      ],
    },
    {
      id: "selection-and-views",
      title: "Selection and views",
      intro: "Selection and view shortcuts select rows or columns, clear cell information, and provide the same basic focus controls in card and dashboard views.",
      shortcuts: [
        { id: "select-column", action: "Select the active column", keys: combo(platforms, ["Ctrl", "Space"], ["Cmd", "Space"]) },
        { id: "select-rows-above", action: "Select all rows or cells above", keys: combo(platforms, ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]) },
        { id: "select-rows-below", action: "Select all rows or cells below", keys: combo(platforms, ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]) },
        { id: "select-row", action: "Select the entire active row", keys: perPlatform(platforms, { windows: ["Shift", "Space"], macos: ["Shift", "Space"] }) },
        { id: "clear-cell", action: "Delete information from the cell", keys: perPlatform(platforms, { windows: ["Space"], macos: ["Space"] }) },
        { id: "card-select", action: "Select a card", keys: perPlatform(platforms, { windows: ["Arrow keys"], macos: ["Arrow keys"] }) },
        { id: "card-toggle", action: "Expand or collapse a card", keys: perPlatform(platforms, { windows: ["Space"], macos: ["Space"] }) },
        { id: "card-edit", action: "Open Edit Row for a card", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"] }) },
        { id: "dashboard-next", action: "Move focus to the next dashboard widget", keys: perPlatform(platforms, { windows: ["Tab"], macos: ["Tab"] }) },
        { id: "dashboard-focus", action: "Focus the selected dashboard widget", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"] }) },
      ],
    },
  ],
};

export default smartsheet;
