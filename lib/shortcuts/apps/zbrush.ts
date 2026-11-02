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

const pc = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys }),
  ...(note ? { note } : {}),
});

export const zbrush: AppShortcuts = {
  slug: "zbrush",
  name: "ZBrush",
  category: "3D sculpting",
  platforms: [...platforms],
  versionContext:
    "On a Mac, use Cmd for Ctrl and Option for Alt. The F1 to F6 popups work only on PC.",
  sourceUrl: "https://help.maxon.net/zbr/en-us/Content/html/user-guide/keyboard-shortcuts/keyboard-shortcuts.html",
  sourceLabel: "official Maxon ZBrush keyboard shortcuts",
  lastVerified: "2026-11-02",
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
        pc("tools-palette", "Open the Tools popup", ["F1"]),
        pc("brushes-palette", "Open the Brushes popup", ["F2"]),
        pc("strokes-palette", "Open the Strokes popup", ["F3"]),
        pc("alphas-palette", "Open the Alphas popup", ["F4"]),
        pc("textures-palette", "Open the Textures popup", ["F5"]),
        pc("materials-palette", "Open the Materials popup", ["F6"], "The cursor must be off the canvas."),
        shared("quick-menu", "Open the quick menu", ["Space"]),
        shared("floating-palettes", "Show or hide floating palettes", ["Tab"]),
        shared("projection-master", "Open Projection Master", ["G"]),
        shared("lightbox", "Show or hide Lightbox", [","]),
        dual("spotlight", "Turn Spotlight on or off", ["Shift", "Z"], ["Shift", "Z"]),
        shared("spotlight-dial", "Show or hide the Spotlight dial", ["Z"]),
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
        shared("floor", "Toggle the floor grid", ["Shift", "P"]),
        shared("symmetry", "Toggle symmetry", ["X"]),
        shared("polyframe", "Show or hide PolyFrame and polygroups", ["Shift", "F"]),
        shared("subtools", "List all SubTools", ["N"]),
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
      intro: "Manage layers, masks, visibility, subtools, and mesh resolution from the keyboard.",
      shortcuts: [
        dual("fill-layer", "Fill the current layer", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("clear-layer", "Clear the current layer", ["Ctrl", "N"], ["Cmd", "N"]),
        dual("bake-layer", "Bake the current layer", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("remove-marker", "Remove the marker", ["Ctrl", "M"], ["Cmd", "M"]),
        dual("divide", "Divide the mesh", ["Ctrl", "D"], ["Cmd", "D"]),
        shared("lower-resolution", "Lower the subdivision level", ["Shift", "D"]),
        shared("higher-resolution", "Raise the subdivision level", ["D"]),
        dual("edge-loop", "Create an edge loop", ["Ctrl", "E"], ["Cmd", "E"], "The mesh must be partly hidden."),
        dual("mask-view", "Show the mask", ["Ctrl", "H"], ["Cmd", "H"]),
        dual("invert-mask", "Invert the mask", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("mask-all", "Mask all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("grow-visibility", "Grow the visible region", ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        dual("shrink-visibility", "Shrink the visible region", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        dual("group-masked", "Group masked polygons and clear the mask", ["Ctrl", "W"], ["Cmd", "W"]),
        dual("set-pivot", "Set the pivot point", ["Ctrl", "P"], ["Cmd", "P"]),
        shared("draw-size-up", "Increase draw size", ["]"]),
        shared("draw-size-down", "Decrease draw size", ["["]),
      ],
    },
    {
      id: "render-and-output",
      title: "Render and output",
      intro: "Render the scene, manage stencils, and save tool or texture output.",
      shortcuts: [
        shared("bpr-render", "Render with Best Preview Render", ["Shift", "R"]),
        dual("render-all", "Render all", ["Shift", "Ctrl", "R"], ["Shift", "Cmd", "R"]),
        dual("stencil", "Turn the stencil on", ["Alt", "H"], ["Option", "H"]),
        dual("stencil-overlay", "Show or hide the stencil", ["Ctrl", "H"], ["Cmd", "H"]),
        dual("crop-fill", "Crop and fill", ["Shift", "Ctrl", "F"], ["Shift", "Cmd", "F"]),
        dual("grab-texture", "Grab a texture", ["Shift", "Ctrl", "G"], ["Shift", "Cmd", "G"]),
        dual("save-tool", "Save the tool", ["Shift", "Ctrl", "T"], ["Shift", "Cmd", "T"]),
        shared("snapshot", "Snapshot a version to the canvas", ["Shift", "S"]),
      ],
    },
  ],
};

export default zbrush;
