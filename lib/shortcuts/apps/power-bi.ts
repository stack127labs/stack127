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
  intro:
    "Power BI Desktop documents shortcuts for report visuals, tables, matrices, panes, canvas zoom, slicers, selection, DAX, data entry, and model relationships. This page focuses on the Windows desktop report experience and keeps context-specific keys in the group where they apply.",
  versionContext:
    "Power BI Desktop keyboard shortcuts from Microsoft Learn, checked September 1, 2026. The shortcut overlay opens with Shift+? and several bindings work only when a visual, pane, formula bar, or model object has focus.",
  sourceUrl: "https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-keyboard-shortcuts",
  sourceLabel: "Microsoft Power BI Desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "general",
      title: "General report commands",
      intro: "Open the shortcut overlay and use common report editing commands from Power BI Desktop.",
      shortcuts: [
        win("show-shortcuts", "Show the keyboard shortcuts overlay", ["Shift", "?"]),
        win("copy", "Copy selected content", ["Ctrl", "C"]),
        win("paste", "Paste", ["Ctrl", "V"]),
        win("undo", "Undo", ["Ctrl", "Z"]),
        win("redo", "Redo", ["Ctrl", "Y"]),
        win("save", "Save the report", ["Ctrl", "S"]),
        win("find", "Find in the report", ["Ctrl", "F"]),
        win("escape", "Cancel or clear the current selection", ["Escape"]),
      ],
    },
    {
      id: "visuals-and-canvas",
      title: "Visuals and canvas",
      intro: "Navigate report visuals, open visual menus, and change the canvas zoom while a report page is active.",
      shortcuts: [
        win("next-visual", "Move to the next visual", ["Tab"]),
        win("previous-visual", "Move to the previous visual", ["Shift", "Tab"]),
        win("visual-menu", "Open the visual context menu", ["Shift", "F10"]),
        win("zoom-in", "Zoom in on the report canvas", ["Ctrl", "+"]),
        win("zoom-out", "Zoom out on the report canvas", ["Ctrl", "-"]),
        win("zoom-reset", "Reset canvas zoom", ["Ctrl", "0"]),
        win("selection-pane", "Open the Selection pane", ["Alt", "S"]),
        win("focus-visual", "Focus the selected visual", ["Enter"]),
      ],
    },
    {
      id: "tables-and-matrices",
      title: "Tables and matrices",
      intro: "Move through a table or matrix visual and expand or collapse its hierarchy when that visual has focus.",
      shortcuts: [
        win("table-next-cell", "Move to the next table cell", ["Tab"]),
        win("table-previous-cell", "Move to the previous table cell", ["Shift", "Tab"]),
        win("table-next-row", "Move to the next table row", ["Down"]),
        win("table-previous-row", "Move to the previous table row", ["Up"]),
        win("matrix-expand", "Expand a matrix hierarchy", ["Right"]),
        win("matrix-collapse", "Collapse a matrix hierarchy", ["Left"]),
        win("matrix-next-level", "Move to the next matrix level", ["Right"]),
        win("matrix-previous-level", "Move to the previous matrix level", ["Left"]),
      ],
    },
    {
      id: "formula-and-model",
      title: "Formula and model views",
      intro: "Use the documented navigation and editing keys in the DAX formula bar, data entry, model view, and relationship view.",
      shortcuts: [
        win("formula-accept", "Accept a formula edit", ["Enter"]),
        win("formula-cancel", "Cancel a formula edit", ["Escape"]),
        win("formula-next-line", "Insert a new line in the formula bar", ["Shift", "Enter"]),
        win("enter-data", "Enter data in a cell", ["Enter"]),
        win("model-next", "Move to the next model object", ["Tab"]),
        win("model-previous", "Move to the previous model object", ["Shift", "Tab"]),
        win("relationship-menu", "Open the relationship context menu", ["Shift", "F10"]),
        win("pane-navigation", "Move between panes", ["F6"]),
      ],
    },
  ],
};

export default powerBi;
