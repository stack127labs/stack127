import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const dual = (id: string, action: string, windowsLinux: string[], mac: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: windowsLinux, linux: windowsLinux, macos: mac }),
  ...(note ? { note } : {}),
});

export const prezi: AppShortcuts = {
  slug: "prezi",
  name: "Prezi Present",
  category: "Presentation",
  platforms: [...platforms],
  intro:
    "Prezi Present uses familiar editing commands alongside canvas navigation and object transformation controls. This reference covers the first-party shortcuts for selecting, arranging, moving through a presentation, and changing the canvas view.",
  versionContext:
    "Prezi Present keyboard shortcuts from the official Support Center, checked September 1, 2026. The article describes Windows and macOS modifier equivalents; browser focus and presentation mode can change which command receives a key.",
  sourceUrl: "https://support.prezi.com/hc/en-us/articles/360003499013-How-to-use-keyboard-shortcuts-in-Prezi-Present",
  sourceLabel: "official Prezi Present keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing",
      intro: "Select, copy, paste, group, duplicate, and undo changes while editing a Prezi presentation.",
      shortcuts: [
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("group", "Group selected objects", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("duplicate", "Duplicate the selection", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("delete", "Delete the selection", ["Delete"], ["Delete"]),
        dual("escape", "Cancel the current selection or action", ["Escape"], ["Escape"]),
      ],
    },
    {
      id: "canvas-and-tools",
      title: "Canvas and tools",
      intro: "Move around the Prezi canvas and switch between the hand tool and selection work without repeatedly opening the toolbar.",
      shortcuts: [
        dual("hand-tool", "Toggle the hand tool", ["H"], ["H"]),
        dual("pan", "Pan the canvas", ["Space"], ["Space"], "Hold Space while dragging the canvas."),
        dual("zoom", "Zoom the canvas", ["Mouse wheel"], ["Mouse wheel"]),
        dual("left-right", "Move through the presentation path", ["Left", "Right"], ["Left", "Right"]),
        dual("center-selection", "Center the selected object", ["Shift", "1"], ["Shift", "1"]),
      ],
    },
    {
      id: "transform",
      title: "Object transformation",
      intro: "Use modifier keys while dragging handles to change snapping, resize from the center, or keep an object proportional.",
      shortcuts: [
        dual("disable-snapping", "Disable snapping while transforming", ["Alt", "Click-drag"], ["Option", "Click-drag"]),
        dual("resize-center", "Resize from an object's center", ["Ctrl", "Drag corner"], ["Cmd", "Drag corner"]),
        dual("constrain", "Constrain a transformation", ["Shift", "Drag"], ["Shift", "Drag"]),
        dual("move-object", "Move an object", ["Drag"], ["Drag"]),
        dual("rotate-object", "Rotate an object", ["Drag rotation handle"], ["Drag rotation handle"]),
      ],
    },
  ],
};

export default prezi;
