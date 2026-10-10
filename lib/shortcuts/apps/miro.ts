import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const dualAlt = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  windowsAlternatives: string[][],
  macosAlternatives: string[][],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, {
    windows,
    macos,
  }).map((entry) => ({
    ...entry,
    alternatives: entry.platform === "macos" ? macosAlternatives : windowsAlternatives,
  })),
  ...(note ? { note } : {}),
});

export const miro: AppShortcuts = {
  slug: "miro",
  name: "Miro",
  category: "Design tool",
  platforms: [...platforms],
  versionContext:
    "Current Miro browser and desktop shortcuts checked September 1, 2026. Miro lets users turn single-character shortcuts off from Accessibility, and the desktop app adds reload, tab, exit, and board-link commands.",
  sourceUrl: "https://help.miro.com/hc/en-us/articles/360017731033-Shortcuts-and-hotkeys",
  sourceLabel: "official Miro shortcuts and hotkeys",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "tools",
      title: "Board tools",
      intro: "Single keys switch the active board tool. Miro documents these as defaults that can be disabled together for assistive technology use.",
      shortcuts: [
        dualAlt("select-hand", "Select tool or hand mode", ["V"], ["V"], [["/"], ["H"]], [["/"], ["H"]]),
        dual("text", "Text tool", ["T"], ["T"]),
        dual("sticky-notes", "Sticky notes", ["N"], ["N"]),
        dual("shapes", "Shapes", ["S"], ["S"]),
        dual("rectangle", "Rectangle", ["R"], ["R"]),
        dual("oval", "Oval", ["O"], ["O"]),
        dual("connection", "Connection line or arrow", ["L"], ["L"]),
        dual("card", "Card", ["D"], ["D"]),
        dual("pen", "Pen", ["P"], ["P"]),
        dual("eraser", "Eraser", ["E"], ["E"]),
        dual("comment", "Comment", ["C"], ["C"]),
        dual("frame", "Frame", ["F"], ["F"]),
        dual("minimap", "Minimap", ["M"], ["M"]),
        dual("grid", "Toggle grid", ["G"], ["G"]),
      ],
    },
    {
      id: "editing",
      title: "Editing and objects",
      intro: "These commands act on selected board objects or text. Return and Escape move between object editing and board selection modes.",
      shortcuts: [
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("duplicate", "Duplicate", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("edit", "Edit the selected item", ["Enter"], ["Return"]),
        dual("escape", "Deselect, quit editing, or switch to cursor", ["Esc"], ["Esc"]),
        dual("delete", "Delete", ["Backspace"], ["Delete"]),
        dual("group", "Group", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("ungroup", "Ungroup", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        dual("lock", "Lock or unlock", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        dual("protected-lock", "Protected lock or unprotected lock", ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        dualAlt("front", "Bring to front", ["PgUp"], ["Fn", "Up"], [], [["PgUp"]]),
        dual("forward", "Bring forward", ["Shift", "PgUp"], ["Shift", "Fn", "Up"]),
        dualAlt("back", "Send to back", ["PgDn"], ["Fn", "Down"], [], [["PgDn"]]),
        dual("backward", "Send backward", ["Shift", "PgDn"], ["Shift", "Fn", "Down"]),
      ],
    },
    {
      id: "navigation",
      title: "Canvas and board navigation",
      intro: "Navigation shortcuts move the canvas, change zoom, search the board, and move through objects in linear, spatial, or container order.",
      shortcuts: [
        dual("command-palette", "Open the command palette", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("new-board-tab", "Create a board in a new tab", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        dual("link-object", "Add or edit an object link", ["Alt", "Ctrl", "K"], ["Option", "Cmd", "K"]),
        dual("clear-object", "Clear object contents", ["Ctrl", "Backspace"], ["Cmd", "Backspace"]),
        dual("move-canvas", "Move items or canvas", ["Arrow keys"], ["Arrow keys"]),
        dual("zoom-in", "Zoom in", ["Ctrl", "+"], ["Cmd", "+"]),
        dual("zoom-out", "Zoom out", ["Ctrl", "-"], ["Cmd", "-"]),
        dual("zoom-100", "Zoom to 100%", ["Ctrl", "0"], ["Cmd", "0"]),
        dual("zoom-fit", "Zoom to fit", ["Alt", "1"], ["Option", "1"]),
        dual("zoom-selected", "Zoom to the selected item", ["Alt", "2"], ["Option", "2"]),
        dual("pan", "Move the canvas", ["Space", "drag"], ["Space", "drag"]),
        dual("search", "Search", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("next-object", "Move forward through objects", ["Tab"], ["Tab"]),
        dual("previous-object", "Move backward through objects", ["Shift", "Tab"], ["Shift", "Tab"]),
        dual("spatial-object", "Move through board objects spatially", ["Ctrl", "Arrow keys"], ["Cmd", "Arrow keys"]),
        dual("container-in", "Move into a container", ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]),
        dual("container-out", "Move out of a container", ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]),
      ],
    },
    {
      id: "text-and-toolbar",
      title: "Text and toolbar navigation",
      intro: "Text shortcuts apply while editing text, while Tab, arrow keys, and Enter provide a keyboard path through Miro toolbars and menus.",
      shortcuts: [
        dual("bold", "Bold", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italic", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("underline", "Underline", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("toolbar-next", "Move between toolbars", ["Tab"], ["Tab"]),
        dual("toolbar-previous", "Move back between toolbars", ["Shift", "Tab"], ["Shift", "Tab"]),
        dual("toolbar-item", "Move between toolbar items", ["Arrow keys"], ["Arrow keys"]),
        dualAlt("activate", "Activate a menu item", ["Enter"], ["Enter"], [["/"], ["Space"]], [["/"], ["Space"]]),
        dual("bulk-sticky", "Create a sticky note in bulk mode", ["Enter"], ["Return"]),
        dual("exit-bulk", "Exit sticky-note bulk mode", ["Esc"], ["Esc"]),
        dual("card-panel", "Open the card panel", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]),
        dual("comments", "Show or hide board comments", ["Shift", "C"], ["Shift", "C"]),
      ],
    },
    {
      id: "desktop-app",
      title: "Desktop app commands",
      intro: "Miro's desktop wrapper adds tab and app controls that do not belong to the board canvas. These commands work in the desktop app.",
      shortcuts: [
        dual("reload", "Reload the tab", ["Ctrl", "R"], ["Cmd", "R"]),
        dual("close-tab", "Close the tab", ["Ctrl", "W"], ["Cmd", "W"]),
        dual("exit-app", "Exit the app", ["Ctrl", "Q"], ["Cmd", "Q"]),
        dual("copy-board-link", "Copy the board link", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
      ],
    },
  ],
};

export default miro;
