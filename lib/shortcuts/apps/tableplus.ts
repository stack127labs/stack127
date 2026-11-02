import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
/** TablePlus maps Cmd to Ctrl on Linux, but doesn't publish these non-Cmd keys there. */
const windowsAndMac = ["windows", "macos"] as const;

export const tableplus: AppShortcuts = {
  slug: "tableplus",
  name: "TablePlus",
  category: "Database tools",
  platforms: [...platforms],
  versionContext:
    "Windows and Linux use Ctrl for Cmd on most keys. Change some in Settings > Keymap.",
  sourceUrl: "https://tableplus.com/docs/utilities/shortcut-keys",
  sourceLabel: "official TablePlus shortcut keys",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "global-and-workspace",
      title: "Connections and workspace",
      intro: "Global and workspace shortcuts open connections, tabs, settings, plugins, panes, and databases.",
      shortcuts: [
        { id: "new-connection", action: "Open the connection list (New Workspace)", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "preferences", action: "Open Settings", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "quit", action: "Quit the app", keys: combo(platforms, ["Ctrl", "Q"], ["Cmd", "Q"]) },
        { id: "new-sql-viewer", action: "Open a new SQL Viewer", keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "new-tab", action: "Open a new tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "plugin-manager", action: "Open the plugin manager", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "console-log", action: "Toggle the console log", keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "C"] }) },
        { id: "reload", action: "Reload the workspace", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
        { id: "left-tab", action: "Select the previous tab", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "right-tab", action: "Select the next tab", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "split-pane", action: "Split the pane to the right", keys: combo(platforms, ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]) },
        { id: "switch-database", action: "Open a database", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "switch-connection", action: "Open a connection", keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]) },
      ],
    },
    {
      id: "sql-editor",
      title: "SQL editor",
      intro: "SQL editor shortcuts execute, open, format, comment, save, and navigate query text while the SQL tab or viewer is focused.",
      shortcuts: [
        { id: "execute", action: "Run the current statement or selection", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Return"]) },
        { id: "open-sql", action: "Open a file", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "beautify", action: "Beautify the selected SQL", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "uglify", action: "Uglify the selected SQL", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Shift", "Cmd", "I"]) },
        { id: "save-sql", action: "Save the SQL to a file", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Shift", "Cmd", "S"]) },
        { id: "comment", action: "Toggle a line comment", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "next-cursor", action: "Add a caret on the line above", keys: combo(windowsAndMac, ["Ctrl", "Shift", "Up"]) },
        { id: "next-cursor-below", action: "Add a caret on the line below", keys: combo(windowsAndMac, ["Ctrl", "Shift", "Down"]) },
        { id: "select-next", action: "Select the next occurrence of the current word", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "select-all-instances", action: "Select all occurrences of the current word", keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "G"] }) },
      ],
    },
    {
      id: "table-data",
      title: "Table data",
      intro: "Table data shortcuts toggle row details, copy or paste rows, duplicate or insert rows, and open row or column filters.",
      shortcuts: [
        { id: "row-detail", action: "Toggle row detail view", keys: combo(windowsAndMac, ["Space"]) },
        { id: "copy-rows", action: "Copy the selected rows", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste-rows", action: "Paste rows", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "duplicate-row", action: "Duplicate the selected rows", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "insert-row", action: "Add a new row", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "row-filter", action: "Show filters", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "column-filter", action: "Choose columns to show", keys: perPlatform(platforms, { macos: ["Cmd", "Option", "F"] }) },
        { id: "focus-next", action: "Edit the selected cell", keys: combo(windowsAndMac, ["Tab"]).map((entry) => ({ ...entry, alternatives: [[entry.platform === "macos" ? "Return" : "Enter"]] })) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
        { id: "open-anything", action: "Open anything", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "open-query", action: "Open a new SQL query editor tab", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
      ],
    },
  ],
};

export default tableplus;
