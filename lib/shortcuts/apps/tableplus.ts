import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const tableplus: AppShortcuts = {
  slug: "tableplus",
  name: "TablePlus",
  category: "Database tools",
  platforms: [...platforms],
  versionContext:
    "TablePlus shortcut keys checked September 1, 2026. The documentation says to replace Command with Control on Windows and notes that key mappings can be customized in Preferences.",
  sourceUrl: "https://docs.tableplus.com/utilities/shortcut-keys",
  sourceLabel: "official TablePlus shortcut keys",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "global-and-workspace",
      title: "Connections and workspace",
      intro: "Global and workspace shortcuts open connections, tabs, preferences, plugins, panes, and the database or connection switchers.",
      shortcuts: [
        { id: "new-connection", action: "Open a new connection", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "preferences", action: "Open Preferences", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "quit", action: "Quit the app", keys: combo(platforms, ["Ctrl", "Q"], ["Cmd", "Q"]) },
        { id: "new-sql-viewer", action: "Open a new SQL Viewer", keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]) },
        { id: "close-tab", action: "Close the current tab or window", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "new-tab", action: "Open a new tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "plugin-manager", action: "Open the plugin manager", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "console-log", action: "Toggle the console log", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
        { id: "reload", action: "Reload the workspace", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
        { id: "left-tab", action: "Navigate to the left tab", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "right-tab", action: "Navigate to the right tab", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "split-pane", action: "Split the pane horizontally", keys: combo(platforms, ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]) },
        { id: "switch-database", action: "Switch database", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "switch-connection", action: "Switch connection", keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]) },
      ],
    },
    {
      id: "sql-editor",
      title: "SQL editor",
      intro: "SQL editor shortcuts execute, open, format, comment, save, and navigate query text while the SQL tab or viewer is focused.",
      shortcuts: [
        { id: "execute", action: "Execute SQL code", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Return"]) },
        { id: "open-sql", action: "Open a SQL file", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "indent", action: "Indent selected SQL code", keys: perPlatform(platforms, { windows: ["Ctrl", "I"], macos: ["Cmd", "I"] }) },
        { id: "beautify", action: "Beautify selected SQL statements", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "uglify", action: "Uglify selected SQL statements", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Shift", "Cmd", "I"]) },
        { id: "save-sql", action: "Save selected SQL statements as", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Shift", "Cmd", "S"]) },
        { id: "comment", action: "Comment or uncomment SQL lines", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "next-cursor", action: "Add a cursor above the current line", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Up"], macos: ["Ctrl", "Shift", "Up"] }) },
        { id: "next-cursor-below", action: "Add a cursor below the current line", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Down"], macos: ["Ctrl", "Shift", "Down"] }) },
        { id: "select-next", action: "Select the next instance of the current highlight", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "select-all-instances", action: "Select all instances of the current highlight", keys: perPlatform(platforms, { windows: ["Ctrl", "Ctrl", "G"], macos: ["Cmd", "Ctrl", "G"] }) },
      ],
    },
    {
      id: "table-data",
      title: "Table data",
      intro: "Table data shortcuts toggle row details, copy or paste rows, duplicate or insert rows, and open row or column filters.",
      shortcuts: [
        { id: "row-detail", action: "Toggle row detail view", keys: perPlatform(platforms, { windows: ["Space"], macos: ["Space"] }) },
        { id: "copy-rows", action: "Copy rows", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste-rows", action: "Paste rows", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "duplicate-row", action: "Duplicate a row", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "insert-row", action: "Insert a new row", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "row-filter", action: "Open the row filter", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "column-filter", action: "Open the column filter", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "F"], macos: ["Cmd", "Option", "F"] }) },
        { id: "focus-next", action: "Move focus while editing", keys: perPlatform(platforms, { windows: ["Tab"], macos: ["Tab"] }) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
        { id: "open-anything", action: "Open anything", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "open-query", action: "Open SQL Query", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
      ],
    },
  ],
};

export default tableplus;
