import type { AppShortcuts, Shortcut } from "../types.ts";

const win = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys, ...(alternatives?.length ? { alternatives } : {}) }],
  ...(note ? { note } : {}),
});

export const powerBi: AppShortcuts = {
  slug: "power-bi",
  name: "Power BI",
  category: "Data and analytics",
  platforms: ["windows"],
  versionContext:
    "Power BI Desktop. Press Shift+? to show shortcuts; some only work when a visual, pane, formula bar, or model object has focus.",
  sourceUrl: "https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-keyboard-shortcuts",
  sourceLabel: "Microsoft Power BI Desktop keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "general",
      title: "General report commands",
      intro: "Open the shortcut overlay, move focus around a report, and select objects.",
      shortcuts: [
        win("show-shortcuts", "Show the keyboard shortcuts overlay", ["Shift", "?"]),
        win("pane-navigation", "Move focus between sections", ["Ctrl", "F6"]),
        win("next-visual", "Move focus forward in a section", ["Tab"]),
        win("previous-visual", "Move focus backward in a section", ["Shift", "Tab"]),
        win("select-object", "Select or clear selection of an object", ["Enter"], [["Space"]]),
        win("multi-select", "Select multiple objects", ["Ctrl", "Space"]),
        win("keytips", "Show keytips for ribbon buttons", ["Alt"]),
      ],
    },
    {
      id: "visuals-and-canvas",
      title: "Visuals and canvas",
      intro: "Navigate report visuals, open visual menus, and change the canvas zoom while a report page is active.",
      shortcuts: [
        win("focus-visual", "Enter a visual", ["Ctrl", "Right"]),
        win("escape", "Exit a layer or visual", ["Esc"]),
        win("visual-menu", "Open the visual context menu", ["Shift", "F10"]),
        win("visual-menu-focus", "Move focus to the visual menu", ["Alt", "Shift", "F10"]),
        win("clear-selection", "Clear selection", ["Ctrl", "Shift", "C"]),
        win("zoom-in", "Zoom in on the report canvas", ["Ctrl", "+"]),
        win("zoom-out", "Zoom out on the report canvas", ["Ctrl", "-"]),
        win("selection-pane", "Activate the Selection pane", ["F6"]),
      ],
    },
    {
      id: "tables-and-matrices",
      title: "Tables and matrices",
      intro: "Move through a table or matrix visual and expand or collapse its hierarchy when that visual has focus.",
      shortcuts: [
        win("table-next-cell", "Move focus one cell right", ["Right"]),
        win("table-previous-cell", "Move focus one cell left", ["Left"]),
        win("table-next-row", "Move focus one cell down", ["Down"]),
        win("table-previous-row", "Move focus one cell up", ["Up"]),
        win("matrix-expand", "Expand a matrix", ["Shift", "Right"]),
        win("matrix-collapse", "Collapse a matrix", ["Shift", "Left"]),
      ],
    },
    {
      id: "formula-and-model",
      title: "Formula and model views",
      intro: "Use these navigation and editing keys in the DAX formula bar, data entry, model view, and relationship view.",
      shortcuts: [
        win("formula-accept", "Submit a formula", ["Enter"], [["Ctrl", "Enter"]]),
        win("formula-cancel", "Close the DAX formula bar, suggestions, or a dialog", ["Esc"]),
        win("formula-next-line", "Insert a line below in the formula bar", ["Shift", "Enter"], [["Alt", "Enter"]]),
        win("exit-editable-grid", "Exit the editable grid in Enter data", ["Ctrl", "Tab"]),
        win("model-next", "Move focus to the next card", ["Tab"], [["Right"], ["Down"]]),
        win("model-previous", "Move focus to the previous card", ["Shift", "Tab"], [["Left"], ["Up"]]),
        win("relationship-properties", "Open the relationship properties pane", ["Enter"]),
      ],
    },
  ],
};

export default powerBi;
