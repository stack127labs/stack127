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

export const zbrush: AppShortcuts = {
  slug: "zbrush",
  name: "ZBrush",
  category: "3D sculpting",
  platforms: [...platforms],
  intro:
    "Maxon publishes ZBrush's default keyboard shortcuts by category, including project files, palettes, sculpting controls, masking, subtools, and rendering.",
  versionContext:
    "Maxon ZBrush keyboard shortcut guide and default hotkeys reference checked September 1, 2026. Maxon documents Ctrl to Cmd and Alt to Option equivalents for Mac, while some popup selections are PC-only.",
  sourceUrl: "https://help.maxon.net/zbr/en-us/Content/html/user-guide/keyboard-shortcuts/keyboard-shortcuts.html",
  sourceLabel: "official Maxon ZBrush keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "project-and-interface",
      title: "Projects and interface",
      intro: "Open and save projects, switch palettes, and open ZBrush's quick menus.",
      shortcuts: [
        dual("open-project", "Open a project", ["Ctrl", "O"], ["Cmd", "O"]),
        dual("save-project", "Save the project", ["Ctrl", "S"], ["Cmd", "S"]),
        shared("quick-save", "Quick-save the project", ["9"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Shift", "Ctrl", "Z"], ["Shift", "Cmd", "Z"]),
        shared("tools-palette", "Open the Tools palette", ["F1"]),
        shared("brushes-palette", "Open the Brushes palette", ["F2"]),
        shared("strokes-palette", "Open the Strokes palette", ["F3"]),
        shared("alphas-palette", "Open the Alphas palette", ["F4"]),
        shared("textures-palette", "Open the Textures palette", ["F5"]),
        shared("materials-palette", "Open the Materials palette", ["F6"], "The cursor must be off the canvas for these palette function keys."),
        shared("quick-menu", "Open the quick menu", ["Space"]),
        shared("floating-palettes", "Show or hide floating palettes", ["Tab"]),
        shared("projection-master", "Open Projection Master", ["G"]),
        shared("lightbox", "Open Lightbox", [","]),
        dual("spotlight", "Open Spotlight", ["Shift", "Z"], ["Shift", "Z"]),
        shared("spotlight-dial", "Open the Spotlight dial", ["Z"]),
      ],
    },
    {
      id: "canvas-and-tools",
      title: "Canvas and tools",
      intro: "Switch common sculpting tools, symmetry, perspective, and brush controls.",
      shortcuts: [
        shared("color-picker", "Pick a color under the cursor", ["C"]),
        shared("switch-color", "Switch the primary and secondary colors", ["V"]),
        shared("lazy-mouse", "Toggle Lazy Mouse", ["L"]),
        shared("fit-mesh", "Fit the mesh to the canvas", ["F"]),
        shared("perspective", "Toggle perspective", ["P"]),
        shared("floor", "Toggle the floor", ["Shift", "P"]),
        shared("symmetry", "Toggle symmetry", ["X"]),
        shared("polyframe", "Toggle PolyFrame", ["Shift", "F"]),
        shared("subtools", "Open the SubTools list", ["N"]),
        shared("draw-size", "Adjust draw size", ["S"]),
        shared("focal-shift", "Adjust focal shift", ["O"]),
        shared("rgb-intensity", "Adjust RGB intensity", ["I"]),
        shared("z-intensity", "Adjust Z intensity", ["U"]),
        shared("draw", "Choose Draw mode", ["Q"]),
        shared("move", "Choose Move mode", ["W"]),
        shared("scale", "Choose Scale mode", ["E"]),
        shared("rotate", "Choose Rotate mode", ["R"]),
        shared("edit", "Toggle Edit mode", ["T"]),
      ],
    },
    {
      id: "sculpting-and-geometry",
      title: "Sculpting and geometry",
      intro: "Manage layers, masks, visibility, subtools, and mesh resolution with the documented keyboard commands.",
      shortcuts: [
        dual("fill-layer", "Fill the current layer", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("clear-layer", "Clear the current layer", ["Ctrl", "N"], ["Cmd", "N"]),
        dual("bake-layer", "Bake the current layer", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("remove-marker", "Remove the marker", ["Ctrl", "M"], ["Cmd", "M"]),
        dual("divide", "Divide the mesh", ["Ctrl", "D"], ["Cmd", "D"]),
        shared("lower-resolution", "Lower the subdivision level", ["Shift", "D"]),
        shared("higher-resolution", "Raise the subdivision level", ["D"]),
        dual("edge-loop", "Create an edge loop", ["Ctrl", "E"], ["Cmd", "E"]),
        dual("mask-view", "Show the mask", ["Ctrl", "H"], ["Cmd", "H"]),
        dual("invert-mask", "Invert the mask", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("mask-all", "Mask all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("grow-visibility", "Grow the visible region", ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        dual("shrink-visibility", "Shrink the visible region", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        dual("group-masked", "Group masked polygons", ["Ctrl", "W"], ["Cmd", "W"]),
        dual("set-pivot", "Set the pivot point", ["Ctrl", "P"], ["Cmd", "P"]),
        shared("draw-size-up", "Increase draw size", ["]"]),
        shared("draw-size-down", "Decrease draw size", ["["]),
      ],
    },
    {
      id: "render-and-output",
      title: "Render and output",
      intro: "Render the scene, manage Spotlight and stencils, and save tool or texture output.",
      shortcuts: [
        shared("bpr-render", "Render with Best Preview Render", ["Shift", "R"]),
        dual("render-all", "Render all subtools", ["Shift", "Ctrl", "R"], ["Shift", "Cmd", "R"]),
        dual("stencil", "Show or hide the stencil", ["Alt", "H"], ["Option", "H"]),
        dual("stencil-overlay", "Show or hide the stencil overlay", ["Ctrl", "H"], ["Cmd", "H"]),
        dual("crop-fill", "Crop and fill", ["Shift", "Ctrl", "F"], ["Shift", "Cmd", "F"]),
        dual("grab-texture", "Grab a texture", ["Shift", "Ctrl", "G"], ["Shift", "Cmd", "G"]),
        dual("save-tool", "Save the tool", ["Shift", "Ctrl", "T"], ["Shift", "Cmd", "T"]),
        shared("snapshot", "Take a canvas snapshot", ["Shift", "S"]),
      ],
    },
  ],
};

export default zbrush;
