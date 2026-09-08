import { combo, perPlatform } from "../build.ts";
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
    "The current Figma help page documents canvas navigation, keyboard selection, object creation, and the in-product shortcuts panel. macOS uses Cmd and Option where Windows and Linux use Ctrl and Alt.",
  sourceUrl: "https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard",
  sourceLabel: "official Figma keyboard shortcuts",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "canvas-navigation",
      title: "Canvas navigation",
      intro: "Pan the canvas, change zoom, and open the shortcut panel while keeping the design surface in view.",
      shortcuts: [
        {
          id: "pan-canvas",
          action: "Pan the canvas",
          keys: combo(platforms, ["Arrow"]),
          note: "With nothing selected, use the arrow keys to pan. The same controls work while a tool is active.",
        },
        {
          id: "pan-canvas-fast",
          action: "Pan the canvas faster",
          keys: combo(platforms, ["Shift", "Arrow"]),
          note: "The pan distance changes with the current zoom level.",
        },
        {
          id: "zoom-in",
          action: "Zoom in",
          keys: combo(platforms, ["Ctrl", "+"], ["Cmd", "+"]),
        },
        {
          id: "zoom-out",
          action: "Zoom out",
          keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]),
        },
        {
          id: "shortcut-panel",
          action: "Open the keyboard shortcuts panel",
          keys: combo(platforms, ["Ctrl", "Shift", "?" ]),
          note: "Figma also exposes the panel from Help and resources or the Actions menu.",
        },
      ],
    },
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
        {
          id: "focus-toolbar",
          action: "Focus the toolbar",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "F6"],
            macos: ["F6"],
          }),
          note: "Use the arrow keys to choose a tool after the toolbar is focused. The current help page documents macOS and Windows bindings.",
        },
        {
          id: "place-object",
          action: "Place a new object after choosing a tool",
          keys: combo(platforms, ["Enter"]),
          note: "This does not apply to objects that require multiple clicks, such as lines, vector paths, connectors, and tables.",
        },
      ],
    },
    {
      id: "keyboard-selection",
      title: "Keyboard selection",
      intro: "Select objects and child layers without reaching for a mouse, then return to the canvas when the selection is complete.",
      shortcuts: [
        {
          id: "keyboard-box-selection",
          action: "Activate keyboard box selection",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Space"],
            macos: ["Option", "Space"],
            linux: ["Ctrl", "Space"],
          }),
          note: "Move the pink cursor with the arrow keys and press Enter to select an object.",
        },
        {
          id: "select-child-layer",
          action: "Move to the next child layer",
          keys: combo(platforms, ["Tab"]),
          note: "Shift+Tab moves to the previous child layer when a parent layer is selected.",
        },
        {
          id: "select-object",
          action: "Select the object under the keyboard cursor",
          keys: combo(platforms, ["Enter"]),
        },
        {
          id: "close-keyboard-selection",
          action: "Close keyboard box selection",
          keys: combo(platforms, ["Esc"]),
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

export default figma;
