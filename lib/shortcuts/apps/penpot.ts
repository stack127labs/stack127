import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const dual = (id: string, action: string, windowsLinux: string[], mac: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: windowsLinux, linux: windowsLinux, macos: mac }),
  ...(note ? { note } : {}),
});

export const penpot: AppShortcuts = {
  slug: "penpot",
  name: "Penpot",
  category: "Design tool",
  platforms: [...platforms],
  versionContext:
    "Penpot workspace shortcuts from the official user guide, checked September 1, 2026. Penpot also publishes the current keymap in its source repository, and many bindings are available only when the workspace has focus.",
  sourceUrl: "https://help.penpot.dev/user-guide/first-steps/shortcuts/",
  sourceLabel: "official Penpot shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "alignment",
      title: "Alignment",
      intro: "Align and distribute selected objects in the Penpot workspace with these commands.",
      shortcuts: [
        dual("align-bottom", "Align bottom", ["Alt", "S"], ["Option", "S"]),
        dual("align-center-horizontal", "Align center horizontally", ["Alt", "H"], ["Option", "H"]),
        dual("align-center-vertical", "Align center vertically", ["Alt", "V"], ["Option", "V"]),
        dual("align-left", "Align left", ["Alt", "A"], ["Option", "A"]),
        dual("align-right", "Align right", ["Alt", "D"], ["Option", "D"]),
        dual("align-top", "Align top", ["Alt", "W"], ["Option", "W"]),
        dual("distribute-horizontal", "Distribute horizontally", ["Ctrl", "Shift", "Alt", "H"], ["Cmd", "Shift", "Option", "H"]),
        dual("distribute-vertical", "Distribute vertically", ["Ctrl", "Shift", "Alt", "V"], ["Cmd", "Shift", "Option", "V"]),
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Copy, paste, duplicate, find, and manage undo history for selected Penpot workspace content.",
      shortcuts: [
        dual("cancel", "Cancel the current action", ["Escape"], ["Escape"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("paste-replace", "Paste to replace", ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
        dual("duplicate", "Duplicate", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("find", "Find", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("find-replace", "Find and replace", ["Ctrl", "H"], ["Cmd", "H"]),
        dual("redo", "Redo", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("copy-link", "Copy a link to the board", ["Shift", "Alt", "C"], ["Shift", "Option", "C"]),
        dual("copy-properties", "Copy properties", ["Ctrl", "Alt", "C"], ["Cmd", "Option", "C"]),
        dual("paste-properties", "Paste properties", ["Ctrl", "Alt", "V"], ["Cmd", "Option", "V"]),
      ],
    },
    {
      id: "objects-and-layers",
      title: "Objects and layers",
      intro: "Select, group, lock, move, and change the layer order of objects in a Penpot design.",
      shortcuts: [
        dual("start-editing", "Start editing", ["Enter"], ["Enter"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("delete", "Delete selected objects", ["Delete"], ["Backspace"]),
        dual("group", "Group selected objects", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("ungroup", "Ungroup selected objects", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        dual("bring-front", "Bring to front", ["Ctrl", "Shift", "]"], ["Cmd", "Shift", "]"]),
        dual("send-back", "Send to back", ["Ctrl", "Shift", "["], ["Cmd", "Shift", "["]),
        dual("lock", "Lock selected objects", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        dual("nudge", "Nudge an object", ["Arrow keys"], ["Arrow keys"]),
        dual("nudge-more", "Move an object farther", ["Shift", "Arrow keys"], ["Shift", "Arrow keys"]),
      ],
    },
    {
      id: "view",
      title: "View and tools",
      intro: "Change the Penpot workspace view, zoom, measurement mode, and active drawing or selection tools.",
      shortcuts: [
        dual("zoom-in", "Zoom in", ["+"], ["+"]),
        dual("zoom-out", "Zoom out", ["-"], ["-"]),
        dual("zoom-fit", "Fit the design in view", ["Shift", "1"], ["Shift", "1"]),
        dual("zoom-selection", "Zoom to selection", ["Shift", "2"], ["Shift", "2"]),
        dual("measure", "Start or stop measurement", ["Alt"], ["Option"]),
        dual("hand-tool", "Use the hand tool", ["H"], ["H"]),
        dual("selection-tool", "Use the selection tool", ["V"], ["V"]),
        dual("rectangle-tool", "Use the rectangle tool", ["R"], ["R"]),
        dual("text-tool", "Use the text tool", ["T"], ["T"]),
      ],
    },
  ],
};

export default penpot;
