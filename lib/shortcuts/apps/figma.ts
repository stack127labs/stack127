import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const figma: AppShortcuts = {
  slug: "figma",
  name: "Figma",
  category: "Design tool",
  platforms: [...platforms],
  intro:
    "Figma work is mostly selection and repetition. These shortcuts get you from tool choice to shape editing to layer and canvas control without breaking the design flow.",
  versionContext:
    "Documented defaults from Figma's official shortcut resource in August 2026. macOS uses Cmd and Option where Windows and Linux use Ctrl and Alt.",
  sourceUrl: "https://help.figma.com/hc/en-us/articles/360040328633-Use-keyboard-shortcuts-in-Figma",
  sourceLabel: "official Figma keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "tools",
      title: "Tools",
      intro: "Switch between the pointer, frame, pen, text, hand, and zoom tools that shape the canvas.",
      shortcuts: [
        { id: "move-tool", action: "Move tool", keys: combo(platforms, ["V"]) },
        { id: "frame-tool", action: "Frame tool", keys: combo(platforms, ["F"]) },
        { id: "rectangle", action: "Rectangle", keys: combo(platforms, ["R"]) },
        { id: "ellipse", action: "Ellipse", keys: combo(platforms, ["O"]) },
        { id: "pen", action: "Pen", keys: combo(platforms, ["P"]) },
        { id: "text", action: "Text", keys: combo(platforms, ["T"]) },
        { id: "comment", action: "Comment", keys: combo(platforms, ["C"]) },
        {
          id: "eyedropper",
          action: "Pick a color from anywhere",
          keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]),
          note: "Hold it to sample while dragging; works outside the canvas too.",
        },
      ],
    },
    {
      id: "shapes-and-editing",
      title: "Shapes and editing",
      intro: "Create shapes, duplicate objects, edit text, and make repeated changes without opening menus.",
      shortcuts: [
        {
          id: "duplicate",
          action: "Duplicate the selection",
          keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]),
          note: "Holding Alt (Option) while dragging also duplicates.",
        },
        {
          id: "group",
          action: "Group the selection",
          keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]),
        },
        {
          id: "boolean-union",
          action: "Boolean union of the selection",
          keys: combo(platforms, ["Ctrl", "Alt", "U"], ["Cmd", "Option", "U"]),
        },
        {
          id: "flip-horizontal",
          action: "Flip horizontally",
          keys: combo(platforms, ["Shift", "H"]),
          note: "Shift+V flips vertically.",
        },
        {
          id: "constrain-proportions",
          action: "Resize keeping proportions",
          keys: [],
          note: "Hold Shift while resizing a corner handle.",
        },
      ],
    },
    {
      id: "layers-and-view",
      title: "Layers and view",
      intro: "Select through layers, move objects, change the canvas view, and keep the right panels in reach.",
      shortcuts: [
        {
          id: "show-layers",
          action: "Show or hide the layers panel",
          keys: combo(platforms, ["Shift", "A"]),
        },
        {
          id: "zoom-to-fit",
          action: "Zoom to fit everything",
          keys: combo(platforms, ["Shift", "1"]),
          note: "Shift+2 zooms to fit the selection.",
        },
        {
          id: "zoom-in",
          action: "Zoom in",
          keys: combo(platforms, ["+"], ["Cmd", "+"]),
        },
        {
          id: "toggle-ui",
          action: "Show or hide the UI",
          keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]),
        },
        {
          id: "rulers",
          action: "Show or hide rulers",
          keys: combo(platforms, ["Shift", "R"]),
        },
      ],
    },
  ],
};
