import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const tableau: AppShortcuts = {
  slug: "tableau",
  name: "Tableau",
  category: "Analytics",
  platforms: [...platforms],
  versionContext:
    "Tableau Desktop keyboard shortcuts checked September 1, 2026. The official reference also documents Server, Cloud, and Prep shortcuts, but this record focuses on the Desktop authoring workflow.",
  sourceUrl: "https://help.tableau.com/current/pro/desktop/en-us/shortcut.htm",
  sourceLabel: "official Tableau Desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "workbooks",
      title: "Workbooks and windows",
      intro: "Workbook shortcuts create, open, save, print, close, and move between Tableau Desktop workbooks and worksheets.",
      shortcuts: [
        { id: "new-workbook", action: "Create a new workbook", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "new-worksheet", action: "Create a new worksheet", keys: perPlatform(platforms, { windows: ["Ctrl", "M"], macos: ["Cmd", "T"] }) },
        { id: "open-workbook", action: "Open a workbook", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "save-workbook", action: "Save a workbook", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "save-public", action: "Save a workbook to Tableau Public", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "close-workbook", action: "Close the workbook", keys: perPlatform(platforms, { windows: ["Alt", "F4"], macos: ["Cmd", "W"] }) },
        { id: "print", action: "Print", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "cycle-sheets", action: "Cycle through worksheets", keys: perPlatform(platforms, { windows: ["Ctrl", "Tab"], macos: ["Shift", "Cmd", "]"] }) },
        { id: "previous-sheet", action: "Go to the previous worksheet", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Tab"], macos: ["Shift", "Cmd", "["] }) },
        { id: "presentation", action: "Enter presentation mode", keys: perPlatform(platforms, { windows: ["F7"], macos: ["Ctrl", "H"] }) },
        { id: "fullscreen", action: "Toggle full screen", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "F"], macos: ["Ctrl", "Cmd", "F"] }) },
        { id: "help", action: "Open Help", keys: perPlatform(platforms, { windows: ["F1"], macos: ["Ctrl", "Cmd", "?"] }) },
      ],
    },
    {
      id: "authoring",
      title: "Authoring and data",
      intro: "Authoring shortcuts find fields, refresh data, show recommendations, update views, and change the worksheet editing state.",
      shortcuts: [
        { id: "describe", action: "Describe the selected field", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "find", action: "Find", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "refresh", action: "Refresh data", keys: perPlatform(platforms, { windows: ["F5"], macos: ["Cmd", "R"] }) },
        { id: "run-updates", action: "Run automatic updates", keys: perPlatform(platforms, { windows: ["F9"], macos: ["Shift", "Cmd", "0"] }) },
        { id: "automatic-updates", action: "Turn automatic updates on or off", keys: perPlatform(platforms, { windows: ["F10"], macos: ["Option", "Cmd", "0"] }) },
        { id: "show-me", action: "Open Show Me", keys: perPlatform(platforms, { windows: ["Ctrl", "1"], macos: ["Cmd", "1"] }) },
        { id: "model", action: "Open the data model", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"]) },
        { id: "swap", action: "Swap rows and columns", keys: perPlatform(platforms, { windows: ["Ctrl", "W"], macos: ["Ctrl", "Cmd", "W"] }) },
        { id: "grid", action: "Show or hide the grid", keys: perPlatform(platforms, { windows: ["G"], macos: ["G"] }) },
        { id: "dashboard-layout", action: "Show or hide the dashboard layout pane", keys: perPlatform(platforms, { windows: ["T"], macos: ["T"] }) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: perPlatform(platforms, { windows: ["Ctrl", "Y"], macos: ["Cmd", "Shift", "Z"] }) },
        { id: "clear", action: "Clear the selection", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "Backspace"], macos: ["Option", "Shift", "Delete"] }) },
      ],
    },
    {
      id: "selection-and-marks",
      title: "Selection and marks",
      intro: "Selection and mark shortcuts select worksheet content and activate the common mark tools used to inspect and annotate a view.",
      shortcuts: [
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "escape", action: "Clear the current focus or selection", keys: perPlatform(platforms, { windows: ["Esc"], macos: ["Esc"] }) },
        { id: "tooltip", action: "Show or hide tooltips", keys: perPlatform(platforms, { windows: ["Ctrl", "H"], macos: ["Ctrl", "H"] }) },
        { id: "pages-next", action: "Move to the next page", keys: perPlatform(platforms, { windows: ["Ctrl", "Right"], macos: ["Cmd", "Right"] }) },
        { id: "pages-previous", action: "Move to the previous page", keys: perPlatform(platforms, { windows: ["Ctrl", "Left"], macos: ["Cmd", "Left"] }) },
        { id: "mark-label", action: "Add a mark label", keys: perPlatform(platforms, { windows: ["A"], macos: ["A"] }) },
        { id: "mark-detail", action: "Add a mark detail", keys: perPlatform(platforms, { windows: ["D"], macos: ["D"] }) },
        { id: "mark-size", action: "Change mark size", keys: perPlatform(platforms, { windows: ["S"], macos: ["S"] }) },
      ],
    },
  ],
};

export default tableau;
