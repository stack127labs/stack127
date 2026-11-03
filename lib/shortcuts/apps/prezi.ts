import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;
const dual = (id: string, action: string, windows: string[], mac: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos: mac }),
  ...(note ? { note } : {}),
});

export const prezi: AppShortcuts = {
  slug: "prezi",
  name: "Prezi Present",
  category: "Presentation",
  platforms: [...platforms],
  versionContext:
    "Prezi Present editor on Windows and Mac. Some modifier keys differ between the two, so check the row for your platform.",
  sourceUrl: "https://support.prezi.com/hc/en-us/articles/360003499013-How-to-use-keyboard-shortcuts-in-Prezi-Present",
  sourceLabel: "Prezi Present keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing",
      intro: "Select, copy, paste, group, duplicate, find, and undo changes while editing a Prezi presentation.",
      shortcuts: [
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("group", "Group selected objects", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("ungroup", "Ungroup selected objects", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        dual("duplicate", "Duplicate the selection", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("find-replace", "Find and replace text", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("delete", "Delete the selection", ["Backspace"], ["Backspace"]),
      ],
    },
    {
      id: "canvas-and-tools",
      title: "Canvas and tools",
      intro: "Move around the Prezi canvas and switch to the hand tool without repeatedly opening the toolbar.",
      shortcuts: [
        dual("hand-tool", "Toggle the hand tool", ["H"], ["H"]),
        dual("pan", "Pan the canvas", ["Space"], ["Space"], "Hold Space while dragging the canvas."),
        dual("zoom", "Zoom the canvas", ["Mouse wheel"], ["Mouse wheel"]),
        {
          id: "left-right",
          action: "Move through the presentation path",
          keys: perPlatform(platforms, { windows: ["Left"], macos: ["Left"] }).map((entry) => ({ ...entry, alternatives: [["Right"]] })),
        },
      ],
    },
    {
      id: "transform",
      title: "Object transformation",
      intro: "Use modifier keys while dragging to change snapping, resize from the center, rotate, or select several objects.",
      shortcuts: [
        dual("disable-snapping", "Disable snapping while dragging transformation handles", ["Alt", "Drag"], ["Cmd", "Drag"]),
        dual("resize-center", "Resize from an object's center", ["Ctrl", "Drag corner"], ["Option", "Drag corner"]),
        dual("select-rectangle", "Draw a rectangle to select multiple objects", ["Shift", "Drag"], ["Shift", "Drag"]),
        dual("rotate-object", "Rotate a selected object", ["Ctrl", "Alt", "Click"], ["Cmd", "Click"], "On Mac, click the object's corner."),
      ],
    },
  ],
};

export default prezi;
