import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

export const mondayCom: AppShortcuts = {
  slug: "monday-com",
  name: "monday.com",
  category: "Project management",
  platforms: [...platforms],
  versionContext:
    "Current monday.com web shortcuts checked September 1, 2026. The shortcut list is available from the account menu or Shift + ?. Labels differ slightly between Mac and PC, but the actions are shared.",
  sourceUrl: "https://support.monday.com/hc/en-us/articles/115005339905-monday-com-Shortcuts",
  sourceLabel: "official monday.com shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "system-navigation",
      title: "System navigation",
      intro: "System navigation shortcuts move between account areas and close the overlays that appear while searching or editing an item.",
      shortcuts: [
        dual("quick-search", "Open Quick Search", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("close-item", "Close the item page", ["Esc"], ["Esc"]),
        dual("close-dialog", "Close a dialog", ["Esc"], ["Esc"]),
        dual("close-search", "Close search", ["Esc"], ["Esc"]),
        dual("toggle-navigation", "Open or close navigation", ["Ctrl", "."], ["Cmd", "."]),
      ],
    },
    {
      id: "board-navigation",
      title: "Board navigation",
      intro: "Board navigation moves through cells and opens the board actions used most often in a monday.com table.",
      shortcuts: [
        dual("down", "Navigate down", ["Down"], ["Down"]),
        dual("up", "Navigate up", ["Up"], ["Up"]),
        dual("left", "Navigate left", ["Left"], ["Left"]),
        dual("right", "Navigate right", ["Right"], ["Right"]),
        dual("next-cell", "Navigate to the next cell", ["Tab"], ["Tab"]),
        dual("previous-cell", "Navigate to the previous cell", ["Shift", "Tab"], ["Shift", "Tab"]),
        dual("edit-cell", "Edit cell content", ["Enter"], ["Return"]),
        dual("clear-cell", "Clear cell content", ["Backspace"], ["Delete"]),
        dual("column-view", "Open column view", ["Space"], ["Space"]),
        dual("search-board", "Search the board", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("copy-cell", "Copy cell content", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste-cell", "Paste cell content", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("cut-cell", "Cut cell content", ["Ctrl", "X"], ["Cmd", "X"]),
      ],
    },
    {
      id: "board-actions",
      title: "Board actions",
      intro: "These commands select items, create board structure, open activity, and export the current board data.",
      shortcuts: [
        dual("select-item", "Select an item", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        dual("select-range", "Select a range of items", ["Shift", "Enter"], ["Shift", "Return"]),
        dual("new-group", "Create a new group", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        dual("new-column", "Create a new column", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]),
        dual("activity-log", "Open the activity log", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        dual("sort-column", "Sort another column", ["Ctrl", "Left click"], ["Cmd", "Left click"]),
        dual("export-excel", "Export to Excel", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        dual("collapse-groups", "Collapse or expand all groups", ["Ctrl", "G"], ["Ctrl", "G"], "monday.com documents the same Ctrl + G binding for Mac and PC here."),
        dual("shift-range", "Select a batch range", ["Shift", "click"], ["Shift", "click"], "Hold Shift while selecting a lower item to include the rows between the two items."),
      ],
    },
  ],
};

export default mondayCom;
