import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, keys: string[], note?: string];

const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, keys, note]) => {
    const macKeys = keys.map((key) => (key === "Alt" ? "Option" : key));
    const commandAlternative = macKeys.includes("Ctrl")
      ? [macKeys.map((key) => (key === "Ctrl" ? "Cmd" : key))]
      : undefined;

    return {
      id,
      action,
      keys: [
        { platform: "windows", keys },
        { platform: "linux", keys },
        {
          platform: "macos",
          keys: macKeys,
          ...(commandAlternative ? { alternatives: commandAlternative } : {}),
        },
      ],
      ...(note ? { note } : {}),
    };
  });

export const blender: AppShortcuts = {
  slug: "blender",
  name: "Blender",
  category: "3D creation suite",
  platforms: ["windows", "macos", "linux"],
  versionContext:
    "Common shortcuts from the Blender 5.2 LTS Manual, checked August 31, 2026. The page is intentionally not comprehensive. It documents the Blender preset, not the Industry Compatible or legacy Blender 27x presets. On macOS, Command can replace Ctrl except where the operating system conflicts; those Command forms appear as alternatives.",
  sourceUrl: "https://docs.blender.org/manual/en/latest/interface/keymap/blender_default.html",
  sourceLabel: "Blender 5.2 LTS Manual default keymap",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "properties",
      title: "Properties under the pointer",
      intro:
        "When the pointer is over an editable field, copy or paste its value, reset it, invert its sign, or activate its current control.",
      shortcuts: rows([
        ["copy-value", "Copy the field's single value", ["Ctrl", "C"]],
        ["paste-value", "Paste a single value into the field", ["Ctrl", "V"]],
        ["copy-vector", "Copy the field's complete vector or color", ["Ctrl", "Alt", "C"]],
        ["paste-vector", "Paste a complete vector or color into the field", ["Ctrl", "Alt", "V"]],
        ["reset-value", "Reset the field to its default value", ["Backspace"]],
        ["invert-sign", "Invert the numeric value's sign", ["Minus"]],
        ["activate-control", "Activate a menu or toggle a checkbox", ["Enter"]],
      ]),
    },
    {
      id: "general",
      title: "Files, history, preferences, and general commands",
      intro:
        "Open and save blend files, undo work, search commands, render, manage workspaces, open Preferences, and control the active area's size or playback direction.",
      shortcuts: [
        ...rows([
        ["open", "Open a file", ["Ctrl", "O"]],
        ["save", "Save the current file", ["Ctrl", "S"]],
        ["new", "Create a new file", ["Ctrl", "N"]],
        ["undo", "Undo the last action", ["Ctrl", "Z"]],
        ["redo", "Redo the last undone action", ["Shift", "Ctrl", "Z"]],
        ["quit", "Quit Blender", ["Ctrl", "Q"]],
        ["help", "Open context-sensitive Help", ["F1"]],
        ["rename", "Rename the active item", ["F2"]],
        ["menu-search", "Open Menu Search", ["F3"]],
        ["file-context", "Open the file context menu", ["F4"]],
        ["adjust-last", "Adjust the last operation", ["F9"]],
        ["render-window", "Show the render window", ["F11"]],
        ["render-frame", "Render the current frame", ["F12"]],
        ["quick-favorites", "Open Quick Favorites", ["Q"]],
        ["maximize-area", "Toggle Maximize Area", ["Ctrl", "Space"]],
        ["next-workspace", "Go to the next workspace", ["Ctrl", "Page Up"]],
        ["previous-workspace", "Go to the previous workspace", ["Ctrl", "Page Down"]],
        ["reverse-playback", "Play the animation in reverse", ["Shift", "Ctrl", "Space"]],
        ]),
        { id: "preferences", action: "Open Preferences", keys: [{ platform: "macos", keys: ["Cmd", ","] }] },
      ],
    },
    {
      id: "editors",
      title: "Selection and editor panels",
      intro:
        "Use the common editing keys shared by the 3D Viewport, UV Editor, Graph Editor, and other Blender editor contexts.",
      shortcuts: [
        ...rows([
          ["delete-confirm", "Delete the selected item with confirmation", ["X"]],
          ["delete-immediate", "Delete the selected item without confirmation", ["Delete"]],
          ["select-all", "Select all items", ["A"]],
          ["invert-selection", "Invert the selection", ["Ctrl", "I"]],
          ["hide-selected", "Hide selected items", ["H"]],
          ["hide-unselected", "Hide unselected items", ["Shift", "H"]],
          ["reveal", "Reveal hidden items", ["Alt", "H"]],
          ["toolbar", "Toggle the Toolbar", ["T"]],
          ["sidebar", "Toggle the Sidebar", ["N"]],
        ]),
        {
          id: "select-none",
          action: "Select no items",
          keys: [
            { platform: "windows", keys: ["Alt", "A"], alternatives: [["A", "then", "A"]] },
            { platform: "linux", keys: ["Alt", "A"], alternatives: [["A", "then", "A"]] },
            { platform: "macos", keys: ["Option", "A"], alternatives: [["A", "then", "A"]] },
          ],
          note: "The alternate form is a double-tap of A.",
        },
      ],
    },
    {
      id: "viewport",
      title: "3D Viewport modes",
      intro:
        "Switch editing modes and component levels, open the navigation pie menu, toggle gizmos, or start fly and walk navigation in the 3D Viewport.",
      shortcuts: rows([
        ["edit-mode", "Toggle Edit Mode", ["Tab"]],
        ["mode-menu", "Toggle Pose Mode or open the mode switching pie menu", ["Ctrl", "Tab"]],
        ["vertex-mode", "Use vertex selection in Edit Mode", ["1"]],
        ["edge-mode", "Use edge selection in Edit Mode", ["2"]],
        ["face-mode", "Use face selection in Edit Mode", ["3"]],
        ["navigation-pie", "Open the 3D Viewport navigation pie menu", ["AccentGrave"]],
        ["gizmos", "Toggle gizmos", ["Ctrl", "AccentGrave"]],
        ["fly-walk", "Start Fly or Walk Navigation", ["Shift", "AccentGrave"]],
      ]),
    },
    {
      id: "animation",
      title: "Animation and drivers",
      intro:
        "Insert or clear keyframes, attach or remove drivers, and manage whether the active property belongs to the current keying set.",
      shortcuts: rows([
        ["insert-keyframe", "Insert a keyframe", ["I"]],
        ["clear-keyframe", "Clear the active keyframe", ["Alt", "I"]],
        ["clear-all-keyframes", "Clear all keyframes", ["Shift", "Alt", "I"]],
        ["assign-driver", "Assign a driver", ["Ctrl", "D"]],
        ["clear-driver", "Clear the driver", ["Ctrl", "Alt", "D"]],
        ["add-keying-set", "Add the property to the current keying set", ["K"]],
        ["remove-keying-set", "Remove the property from the current keying set", ["Alt", "K"]],
      ]),
    },
    {
      id: "python",
      title: "Python scripting helpers",
      intro:
        "Copy an operator's Python command or a field's relative or complete data path for use in Blender scripts, drivers, and the console.",
      shortcuts: rows([
        ["copy-python-command", "Copy the hovered operator's Python command", ["Ctrl", "C"]],
        ["copy-relative-path", "Copy the hovered field's relative data path", ["Shift", "Ctrl", "C"]],
        ["copy-full-path", "Copy the hovered field's full data path", ["Shift", "Ctrl", "Alt", "C"]],
      ]),
    },
  ],
};

export default blender;
