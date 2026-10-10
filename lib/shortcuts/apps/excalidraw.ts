import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const bind = (platform: (typeof platforms)[number], keys: string[], alternatives?: string[][]): ShortcutKey => ({
  platform,
  keys,
  ...(alternatives ? { alternatives } : {}),
});

const common = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [
    bind("windows", keys, alternatives),
    bind("linux", keys, alternatives),
    bind(
      "macos",
      keys.map((value) => (value === "Ctrl" ? "Cmd" : value === "Alt" ? "Option" : value)),
      alternatives?.map((choice) => choice.map((value) => (value === "Ctrl" ? "Cmd" : value === "Alt" ? "Option" : value))),
    ),
  ],
  ...(note ? { note } : {}),
});

const same = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => bind(platform, keys)),
  ...(note ? { note } : {}),
});

const pair = (id: string, action: string, windowsLinux: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [
    bind("windows", windowsLinux),
    bind("linux", windowsLinux),
    bind("macos", macos),
  ],
  ...(note ? { note } : {}),
});

export const excalidraw: AppShortcuts = {
  slug: "excalidraw",
  name: "Excalidraw",
  category: "Whiteboard and diagrams",
  platforms: [...platforms],
  versionContext:
    "The current Excalidraw shortcut map in the official repository was checked September 1, 2026. Excalidraw can be embedded in other products, where host shortcuts or browser behavior may take precedence.",
  sourceUrl: "https://raw.githubusercontent.com/excalidraw/excalidraw/master/packages/excalidraw/actions/shortcuts.ts",
  sourceLabel: "Excalidraw shortcut map",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "file-and-command",
      title: "File and command actions",
      intro: "Save, load, clear, export, or open the command palette from the canvas.",
      shortcuts: [
        common("save", "Save the drawing", ["Ctrl", "S"]),
        common("open", "Open a drawing", ["Ctrl", "O"]),
        common("clear", "Clear the canvas", ["Ctrl", "Delete"]),
        common("export-image", "Export the drawing as an image", ["Ctrl", "Shift", "E"]),
        common("command-palette", "Open the command palette", ["Ctrl", "/"], [["Ctrl", "Shift", "P"]]),
        same("shortcut-help", "Show the keyboard shortcuts", ["?"]),
        common("search-menu", "Search the menu", ["Ctrl", "F"]),
      ],
    },
    {
      id: "clipboard-and-selection",
      title: "Clipboard and selection",
      intro: "Clipboard and selection commands work on the focused canvas selection.",
      shortcuts: [
        common("cut", "Cut the selection", ["Ctrl", "X"]),
        common("copy", "Copy the selection", ["Ctrl", "C"]),
        common("paste", "Paste", ["Ctrl", "V"]),
        common("copy-style", "Copy styles", ["Ctrl", "Alt", "C"]),
        common("paste-style", "Paste styles", ["Ctrl", "Alt", "V"]),
        common("select-all", "Select all elements", ["Ctrl", "A"]),
        same("delete", "Delete the selected elements", ["Delete"]),
        common("duplicate", "Duplicate the selection", ["Ctrl", "D"]),
      ],
    },
    {
      id: "layers",
      title: "Layers and grouping",
      intro: "Change stacking order, grouping, and locking for selected elements.",
      shortcuts: [
        pair("send-backward", "Send the selection backward", ["Ctrl", "["], ["Cmd", "["]),
        pair("bring-forward", "Bring the selection forward", ["Ctrl", "]"], ["Cmd", "]"]),
        pair("send-to-back", "Send the selection to the back", ["Ctrl", "Shift", "["], ["Cmd", "Option", "["]),
        pair("bring-to-front", "Bring the selection to the front", ["Ctrl", "Shift", "]"], ["Cmd", "Option", "]"]),
        common("group", "Group the selection", ["Ctrl", "G"]),
        common("ungroup", "Ungroup the selection", ["Ctrl", "Shift", "G"]),
        common("lock", "Lock or unlock the selection", ["Ctrl", "Shift", "L"]),
      ],
    },
    {
      id: "canvas",
      title: "Canvas modes and view",
      intro: "Toggle canvas modes, change the view, and fit the drawing without changing its elements.",
      shortcuts: [
        common("theme", "Toggle the theme", ["Shift", "Alt", "D"]),
        common("grid", "Toggle grid mode", ["Ctrl", "'"]),
        common("zen", "Toggle zen mode", ["Alt", "Z"]),
        common("snap", "Toggle snap mode", ["Alt", "S"]),
        common("stats", "Toggle statistics", ["Alt", "/"]),
        common("view-mode", "Toggle view mode", ["Alt", "R"]),
        same("flip-horizontal", "Flip the selection horizontally", ["Shift", "H"]),
        same("flip-vertical", "Flip the selection vertically", ["Shift", "V"]),
        common("reset-zoom", "Reset zoom", ["Ctrl", "0"]),
        common("zoom-out", "Zoom out", ["Ctrl", "-"]),
        common("zoom-in", "Zoom in", ["Ctrl", "+"]),
        same("fit-selection", "Fit the selection to the viewport", ["Shift", "3"]),
        same("fit-all", "Fit all elements to the viewport", ["Shift", "1"]),
        same("selection-viewport", "Center the selection in the viewport", ["Shift", "2"]),
      ],
    },
    {
      id: "tools",
      title: "Tools",
      intro: "Lock a drawing tool or add a hyperlink to the selected element.",
      shortcuts: [
        common("hyperlink", "Add or edit a hyperlink", ["Ctrl", "K"]),
        same("lock-tool", "Lock the active tool", ["Q"]),
      ],
    },
  ],
};

export default excalidraw;
