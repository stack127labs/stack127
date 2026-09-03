import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const key = (platform: "windows" | "macos", keys: string[], alternatives?: string[][]): ShortcutKey => ({ platform, keys, ...(alternatives ? { alternatives } : {}) });
const pair = (id: string, action: string, win: string[], mac: string[], winAlt?: string[][], macAlt?: string[][]): Shortcut => ({
  id,
  action,
  keys: [key("windows", win, winAlt), key("macos", mac, macAlt)],
});
const shared = (id: string, action: string, keys: string[], alternatives?: string[][]): Shortcut => pair(id, action, keys, keys, alternatives, alternatives);
const mod = (id: string, action: string, keys: string[], alternatives?: string[][]): Shortcut => {
  const mac = keys.map((value) => (value === "Ctrl" ? "Cmd" : value === "Alt" ? "Option" : value));
  const macAlt = alternatives?.map((alt) => alt.map((value) => (value === "Ctrl" ? "Cmd" : value === "Alt" ? "Option" : value)));
  return pair(id, action, keys, mac, alternatives, macAlt);
};

export const clipStudioPaint: AppShortcuts = {
  slug: "clip-studio-paint",
  name: "Clip Studio Paint",
  category: "Digital illustration",
  platforms: ["windows", "macos"],
  intro:
    "Clip Studio Paint assigns defaults to file, edit, layer, selection, canvas, and ruler commands. The defaults can be customized, so this reference describes the initial shortcut set rather than a user's edited configuration.",
  versionContext:
    "Clip Studio Paint 5.0 default menu shortcuts at initial startup, checked August 31, 2026. The official guide describes Windows notation and directs macOS users to replace Control with Command and Alt with Option. Canvas switching retains the separately published Control-based Mac chords.",
  sourceUrl: "https://help.clip-studio.com/en-us/manual_en/780_shortcuts/Menu_Shortcuts.htm",
  sourceLabel: "Clip Studio Paint 5.0 menu shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "files-and-settings",
      title: "Files and settings",
      intro: "Save As has three factory alternatives. Preferences and shortcut editors use the same documented modifier substitution on Windows and Mac.",
      shortcuts: [
        mod("new", "Create a new file", ["Ctrl", "N"]),
        mod("open", "Open a file", ["Ctrl", "O"]),
        mod("close", "Close the current file", ["Ctrl", "W"]),
        mod("save", "Save the current file", ["Ctrl", "S"]),
        mod("save-as", "Save the current file as", ["Shift", "Alt", "S"], [["Ctrl", "Shift", "S"], ["Ctrl", "Alt", "S"]]),
        mod("print", "Print", ["Ctrl", "P"]),
        mod("preferences", "Open Preferences", ["Ctrl", "K"]),
        mod("shortcut-settings", "Open Shortcut Settings", ["Ctrl", "Shift", "Alt", "K"]),
        mod("modifier-settings", "Open Modifier Key Settings", ["Ctrl", "Shift", "Alt", "Y"]),
        mod("quit", "Quit Clip Studio Paint", ["Ctrl", "Q"]),
      ],
    },
    {
      id: "edit-and-transform",
      title: "Edit and transform",
      intro: "Clipboard and erase actions retain all factory alternatives. Transform commands act on the active selection or layer content.",
      shortcuts: [
        mod("undo", "Undo", ["Ctrl", "Z"]),
        mod("redo", "Redo", ["Ctrl", "Y"], [["Ctrl", "Shift", "Z"]]),
        mod("cut", "Cut", ["Ctrl", "X"], [["F2"]]),
        mod("copy", "Copy", ["Ctrl", "C"], [["F3"]]),
        mod("paste", "Paste", ["Ctrl", "V"], [["F4"]]),
        mod("paste-position", "Paste at the shown position", ["Ctrl", "Shift", "V"]),
        mod("erase", "Erase", ["Delete"], [["Backspace"], ["Ctrl", "Delete"], ["Ctrl", "Backspace"]]),
        shared("delete-outside", "Delete outside the selection", ["Shift", "Delete"], [["Shift", "Backspace"]]),
        mod("fill", "Fill", ["Alt", "Delete"], [["Alt", "Backspace"]]),
        mod("hsl", "Open Hue, Saturation, and Luminosity correction", ["Ctrl", "U"]),
        mod("reverse-gradient", "Reverse the gradient", ["Ctrl", "I"]),
        mod("scale-rotate", "Scale or rotate the selection", ["Ctrl", "T"]),
        mod("free-transform", "Use Free Transform", ["Ctrl", "Shift", "T"]),
      ],
    },
    {
      id: "layers",
      title: "Layers",
      intro: "Layer commands create, group, clip, merge, or change the active layer. Bracket shortcuts move selection one layer at a time.",
      shortcuts: [
        mod("new-raster", "Create a new raster layer", ["Ctrl", "Shift", "N"]),
        mod("folder", "Create a folder and insert the selected layer", ["Ctrl", "G"]),
        mod("ungroup", "Ungroup the layer folder", ["Ctrl", "Shift", "G"]),
        mod("clip-below", "Clip to the layer below", ["Ctrl", "Alt", "G"]),
        mod("merge-below", "Merge with the layer below", ["Ctrl", "E"]),
        mod("merge-selected", "Merge selected layers", ["Shift", "Alt", "E"]),
        mod("merge-visible", "Merge visible layers", ["Ctrl", "Shift", "E"]),
        mod("layer-above", "Select the layer above", ["Alt", "]"]),
        mod("layer-below", "Select the layer below", ["Alt", "["]),
      ],
    },
    {
      id: "selection",
      title: "Selection",
      intro: "These commands create, clear, restore, or invert the active selected area.",
      shortcuts: [
        mod("select-all", "Select all", ["Ctrl", "A"]),
        mod("deselect", "Deselect", ["Ctrl", "D"]),
        mod("reselect", "Reselect the previous area", ["Ctrl", "Shift", "D"]),
        mod("invert-selection", "Invert the selected area", ["Ctrl", "Shift", "I"], [["Shift", "F7"]]),
      ],
    },
    {
      id: "canvas-view",
      title: "Canvas view and rulers",
      intro: "Zoom, rotation, and snapping shortcuts change the canvas display. Plus and minus on the numeric keypad remain distinct from punctuation alternatives.",
      shortcuts: [
        shared("rotate-left", "Rotate the canvas left", ["-"]),
        shared("rotate-right", "Rotate the canvas right", ["^"]),
        mod("zoom-in", "Zoom in", ["Ctrl", "Num +"], [["Ctrl", ";"]]),
        mod("zoom-out", "Zoom out", ["Ctrl", "Num -"], [["Ctrl", "-"]]),
        mod("zoom-100", "View at 100%", ["Ctrl", "Alt", "0"]),
        mod("fit", "Fit the canvas to the screen", ["Ctrl", "0"]),
        mod("reset-display", "Reset the canvas display", ["Ctrl", "@"]),
        mod("ruler", "Show or hide rulers", ["Ctrl", "R"]),
        mod("snap-ruler", "Snap to ruler", ["Ctrl", "1"]),
        mod("snap-special", "Snap to special ruler", ["Ctrl", "2"]),
        mod("snap-grid", "Snap to grid", ["Ctrl", "3"]),
        mod("toggle-special", "Toggle special-ruler snapping", ["Ctrl", "4"]),
      ],
    },
    {
      id: "windows-and-palettes",
      title: "Canvases and palettes",
      intro: "Mac canvas switching deliberately uses Control rather than Command. Palette visibility shortcuts are shared by both desktop platforms.",
      shortcuts: [
        pair("next-canvas", "Go to the next canvas", ["Ctrl", "Tab"], ["Ctrl", "Tab"]),
        pair("previous-canvas", "Go to the previous canvas", ["Ctrl", "Shift", "Tab"], ["Shift", "Ctrl", "Tab"]),
        shared("palettes", "Show or hide all palettes", ["Tab"]),
        shared("title-menu", "Hide the title bar or menu bar", ["Shift", "Tab"]),
        shared("tutorials", "Open training and tutorials", ["F1"]),
      ],
    },
  ],
};

export default clipStudioPaint;
