import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

const dualWithAlternatives = (
  id: string,
  action: string,
  windows: string[],
  windowsAlternative: string[],
  macos: string[],
  macosAlternative: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: [
    { platform: "windows", keys: windows, alternatives: [windowsAlternative] },
    { platform: "macos", keys: macos, alternatives: [macosAlternative] },
  ],
  ...(note ? { note } : {}),
});

export const whimsical: AppShortcuts = {
  slug: "whimsical",
  name: "Whimsical",
  category: "Visual collaboration",
  platforms: [...platforms],
  versionContext:
    "Whimsical shortcut tables checked November 1, 2026. The source lists the Windows and Mac modifiers separately, and some shortcuts depend on the active board or editor.",
  sourceUrl: "https://whimsical.com/learn/shortcuts",
  sourceLabel: "official Whimsical keyboard shortcuts",
  lastVerified: "2026-11-01",
  groups: [
    {
      id: "workspace",
      title: "Files and workspace",
      intro: "Use these commands to search, switch views, and manage files in the Whimsical workspace.",
      shortcuts: [
        dual("command-menu", "Open the command menu", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        shared("deselect", "Deselect", ["Escape"]),
        dual("file-search", "Search files", ["Ctrl", "F"], ["Cmd", "F"]),
        dualWithAlternatives("workspace-search", "Search the workspace", ["Ctrl", "J"], ["Ctrl", "Shift", "F"], ["Cmd", "J"], ["Cmd", "Shift", "F"]),
        dual("toggle-sidebar", "Show or hide the sidebar", ["Ctrl", "E"], ["Cmd", "E"]),
        dualWithAlternatives("share", "Share the current file", ["Ctrl", "Shift", "S"], ["Ctrl", "Alt", "S"], ["Cmd", "Shift", "S"], ["Cmd", "Option", "S"]),
        dual("export", "Export the current file", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        dual("print", "Print the current file", ["Ctrl", "P"], ["Cmd", "P"]),
        dual("new-file", "Create a new file or folder", ["Ctrl", "Alt", "N"], ["Cmd", "Option", "N"]),
        shared("list-view", "Switch to list view", ["L"]),
        shared("grid-view", "Switch to grid view", ["G"]),
        {
          id: "delete-file",
          action: "Delete the selected file or folder",
          keys: [
            { platform: "windows", keys: ["Delete"], alternatives: [["Backspace"]] },
            { platform: "macos", keys: ["Delete"], alternatives: [["Backspace"]] },
          ],
        },
      ],
    },
    {
      id: "board",
      title: "Boards",
      intro: "These commands control zoom, editing, selection, and object order on a Whimsical board.",
      shortcuts: [
        shared("zoom-in", "Zoom in", ["="]),
        shared("zoom-out", "Zoom out", ["-"]),
        shared("zoom-100", "Set zoom to 100 percent", ["0"]),
        shared("zoom-content", "Fit the board content", ["1"]),
        shared("zoom-selection", "Fit the selected objects", ["2"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("duplicate", "Duplicate the selection", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("edit-object", "Edit the selected object", ["Enter"], ["Enter"]),
        dual("group", "Group selected objects", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("ungroup", "Ungroup selected objects", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        dual("bring-forward", "Bring the selection forward", ["Ctrl", "]"], ["Cmd", "]"]),
        dual("send-backward", "Send the selection backward", ["Ctrl", "["], ["Cmd", "["]),
        dual("lock", "Lock the selection", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        dual("wireframe-mode", "Toggle wireframe mode", ["W"], ["W"]),
      ],
    },
    {
      id: "diagram",
      title: "Diagram tools",
      intro: "Whimsical assigns single-key commands to common diagram shapes, connectors, text, and sections.",
      shortcuts: [
        shared("rectangle", "Add a rectangle", ["R"]),
        shared("pill", "Add a pill", ["U"]),
        shared("oval", "Add an oval", ["O"]),
        shared("diamond", "Add a diamond", ["D"]),
        shared("trapezoid", "Add a trapezoid", ["A"]),
        shared("triangle", "Add a triangle", ["G"]),
        shared("hexagon", "Add a hexagon", ["H"]),
        shared("cylinder", "Add a cylinder", ["Y"]),
        shared("line", "Add a line", ["L"]),
        shared("bracket", "Add a bracket", ["B"]),
        shared("star", "Add a star", ["V"]),
        shared("cloud", "Add a cloud", ["J"]),
        shared("table", "Add a table", ["E"]),
        shared("image", "Add an image", ["I"]),
        shared("link", "Add a link", ["K"]),
        shared("connector", "Add a connector", ["C"]),
        shared("text", "Add text", ["T"]),
        shared("icon", "Add an icon", ["X"]),
        shared("section", "Add a section", ["."]),
      ],
    },
    {
      id: "mind-map",
      title: "Mind maps",
      intro: "Use these keys while a mind map node has focus to add related nodes and change the map structure.",
      shortcuts: [
        shared("mind-map-root", "Add a root node", ["M"]),
        shared("mind-map-child", "Add a child node", ["Tab"]),
        shared("mind-map-sibling", "Add a sibling node", ["Enter"]),
        dual("mind-map-sibling-above", "Add a sibling above", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        dual("mind-map-parent", "Add a parent node", ["Alt", "Enter"], ["Option", "Enter"]),
        dual("mind-map-collapse", "Collapse or expand a node", ["Ctrl", "/"], ["Cmd", "/"]),
        dual("mind-map-line-break", "Insert a line break in a node", ["Shift", "Enter"], ["Shift", "Enter"]),
        dual("mind-map-indent", "Decrease text indent", ["Ctrl", "Alt", "["], ["Cmd", "Ctrl", "["]),
        dual("mind-map-outdent", "Increase text indent", ["Ctrl", "Alt", "]"], ["Cmd", "Ctrl", "]"]),
      ],
    },
    {
      id: "sticky-notes",
      title: "Sticky notes",
      intro: "These shortcuts apply while editing a sticky note and changing its text or position.",
      shortcuts: [
        shared("new-sticky-note", "Add a sticky note", ["N"]),
        dual("sticky-size-up", "Increase sticky-note size", ["Ctrl", "Alt", "="], ["Cmd", "Option", "="]),
        dual("sticky-size-down", "Decrease sticky-note size", ["Ctrl", "Alt", "-"], ["Cmd", "Option", "-"]),
        dual("paragraph", "Change paragraph alignment", ["Ctrl", "\\"], ["Cmd", "\\"]),
        dualWithAlternatives("bulleted-list", "Start or toggle a bulleted list", ["*"], ["Ctrl", "Shift", "8"], ["*"], ["Cmd", "Shift", "8"], "Type * then Space, or - then Space, to start a bulleted list."),
        dualWithAlternatives("numbered-list", "Start or toggle a numbered list", ["1"], ["Ctrl", "Shift", "7"], ["1"], ["Cmd", "Shift", "7"], "Type 1. then Space to start a numbered list."),
        dual("external-link", "Insert an external link", ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]),
      ],
    },
  ],
};

export default whimsical;
