import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const pair = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  windowsAlternatives?: string[][],
  macosAlternatives?: string[][],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: [
    { platform: "windows", keys: windows, ...(windowsAlternatives ? { alternatives: windowsAlternatives } : {}) },
    { platform: "macos", keys: macos, ...(macosAlternatives ? { alternatives: macosAlternatives } : {}) },
  ],
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys, ...(alternatives ? { alternatives } : {}) })),
  ...(note ? { note } : {}),
});

export const figjam: AppShortcuts = {
  slug: "figjam",
  name: "FigJam",
  category: "Whiteboards and collaboration",
  platforms: [...platforms],
  intro:
    "FigJam's official help pages document shortcuts for selection and ordering, text, connectors, drawing, comments, tables, and board tools.",
  versionContext:
    "Current Figma Help Center FigJam pages checked September 1, 2026. The shortcuts apply to the FigJam board and may require a board, text object, table, or selection to have focus.",
  sourceUrl: "https://help.figma.com/hc/en-us/articles/1500004292221-Select-move-and-order-objects-in-FigJam",
  sourceLabel: "Figma Help Center FigJam shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "selection-and-order",
      title: "Selection and order",
      intro: "Select objects, change their stack order, and group or lock a selection.",
      shortcuts: [
        shared("select-tool", "Activate the select tool", ["V"]),
        pair("select-all", "Select all objects", ["Ctrl", "A"], ["Cmd", "A"]),
        shared("deselect", "Deselect objects", ["Esc"]),
        pair("bring-forward", "Bring the selection forward", ["Ctrl", "]"], ["Cmd", "]"]),
        shared("bring-front", "Bring the selection to the front", ["]"]),
        pair("send-backward", "Send the selection backward", ["Ctrl", "["], ["Cmd", "["]),
        shared("send-back", "Send the selection to the back", ["["]),
        pair("group", "Group selected objects", ["Ctrl", "G"], ["Cmd", "G"]),
        pair("ungroup", "Ungroup selected objects", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"], [["Ctrl", "Backspace"]], [["Cmd", "Delete"]]),
        pair("duplicate", "Duplicate the selection", ["Ctrl", "D"], ["Cmd", "D"]),
        pair("lock", "Lock or unlock selected objects", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        pair("shortcut-panel", "Show the keyboard shortcuts panel", ["Alt", "Shift", "?"], ["Ctrl", "Shift", "?"]),
      ],
    },
    {
      id: "text",
      title: "Text",
      intro: "Text-formatting commands apply while editing text in a sticky, shape, connector, or table cell.",
      shortcuts: [
        pair("bold", "Bold", ["Ctrl", "B"], ["Cmd", "B"]),
        pair("strikethrough", "Strikethrough", ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        pair("bulleted-list", "Create a bulleted list", ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]),
        pair("numbered-list", "Create a numbered list", ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]),
        shared("indent", "Increase list indent", ["Tab"]),
        shared("outdent", "Decrease list indent", ["Shift", "Tab"]),
        pair("align-left", "Align text left", ["Alt", "Ctrl", "L"], ["Option", "Cmd", "L"]),
        pair("align-center", "Align text center", ["Alt", "Ctrl", "T"], ["Option", "Cmd", "T"]),
        pair("align-right", "Align text right", ["Alt", "Ctrl", "R"], ["Option", "Cmd", "R"]),
        pair("add-link", "Add a link to selected text", ["Shift", "Ctrl", "U"], ["Shift", "Cmd", "U"]),
        pair("paste-link", "Paste a link from the clipboard", ["Ctrl", "V"], ["Cmd", "V"]),
        pair("paste-url", "Paste a URL as plain text", ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
      ],
    },
    {
      id: "board-tools",
      title: "Board tools",
      intro: "Create sections, stickies, connectors, drawings, text, stamps, and comments from the board.",
      shortcuts: [
        shared("section", "Create a section", ["Shift", "S"]),
        shared("sticky", "Create a sticky note", ["S"]),
        shared("straight-connector", "Create a straight connector", ["L"]),
        shared("elbow-connector", "Create an elbow connector", ["X"], [["Shift", "L"]]),
        shared("marker", "Activate the marker", ["M"]),
        shared("highlighter", "Activate the highlighter", ["Shift", "M"]),
        shared("washi-tape", "Activate washi tape", ["W"]),
        shared("text", "Create a text object", ["T"]),
        shared("stamp", "Open the stamp wheel", ["E"]),
        shared("comment", "Add a comment", ["C"]),
        pair("libraries", "Open libraries", ["Alt", "2"], ["Option", "2"]),
        pair("quick-actions", "Open quick actions", ["Ctrl", "/"], ["Cmd", "/"], [["Ctrl", "P"]], [["Cmd", "P"]]),
      ],
    },
    {
      id: "tables",
      title: "Tables",
      intro: "Create a table from the board, then use the table toolbar and cell controls for further edits.",
      shortcuts: [
        shared("table", "Create a table", ["Shift", "T"]),
        pair("table-duplicate", "Duplicate selected table rows", ["Ctrl", "D"], ["Cmd", "D"]),
        pair("table-copy", "Copy selected table content", ["Ctrl", "C"], ["Cmd", "C"]),
      ],
    },
  ],
};

export default figjam;
