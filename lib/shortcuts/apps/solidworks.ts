import type { AppShortcuts } from "../types.ts";

const key = (keys: string[]) => [{ platform: "windows" as const, keys }];

export const solidworks: AppShortcuts = {
  slug: "solidworks",
  name: "SOLIDWORKS",
  category: "CAD and engineering",
  platforms: ["windows"],
  intro:
    "SOLIDWORKS Design Help publishes selected Windows shortcuts for assemblies, copying, display, selection, sketching, and the shortcut bar. The record focuses on stable key commands rather than mouse gestures.",
  versionContext:
    "SOLIDWORKS 2026 selected keyboard shortcuts checked September 1, 2026. The source calls this a selected list and notes that keyboard assignments can be customized, so this is not a complete custom keymap.",
  sourceUrl: "https://help.solidworks.com/2026/english/SolidWorks/sldworks/c_time_saving_keyboard_shortcuts.htm",
  sourceLabel: "official SOLIDWORKS 2026 selected keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing-and-documents",
      title: "Editing and documents",
      intro: "Editing and document shortcuts cover clipboard work, document switching, rebuilds, redraws, and the shortcut bar used for commands.",
      shortcuts: [
        { id: "copy", action: "Copy", keys: key(["Ctrl", "C"]) },
        { id: "paste", action: "Paste", keys: key(["Ctrl", "V"]) },
        { id: "rebuild", action: "Rebuild the model", keys: key(["Ctrl", "B"]) },
        { id: "redraw", action: "Redraw the screen", keys: key(["Ctrl", "R"]) },
        { id: "switch-document", action: "Move among open documents", keys: key(["Ctrl", "Tab"]) },
        { id: "repeat-command", action: "Repeat the last command", keys: key(["Enter"]) },
        { id: "shortcut-bar", action: "Open the shortcut bar", keys: key(["S"]) },
        { id: "context-menu", action: "Open the shortcut menu and context toolbar", keys: key(["Shift", "F10"]) },
      ],
    },
    {
      id: "display-and-view",
      title: "Display and view",
      intro: "Display shortcuts rotate, zoom, fit, pan, and open the view selector while a model is active in the graphics area.",
      shortcuts: [
        { id: "rotate-view", action: "Rotate the model parallel to the viewing plane", keys: key(["Alt", "Arrow keys"]) },
        { id: "rotate-90", action: "Rotate the model 90 degrees", keys: key(["Shift", "Arrow keys"]) },
        { id: "zoom-in", action: "Zoom in", keys: key(["Shift", "Z"]) },
        { id: "zoom-out", action: "Zoom out", keys: key(["Z"]) },
        { id: "fit", action: "Zoom to fit", keys: key(["F"]) },
        { id: "view-selector", action: "Open the View Selector", keys: key(["Ctrl", "Space"]) },
        { id: "orientation-dialog", action: "Open the View Selector and Orientation dialog", keys: key(["Space"]) },
        { id: "pan", action: "Pan the model", keys: key(["Ctrl", "Arrow keys"]) },
      ],
    },
    {
      id: "selection-and-sketching",
      title: "Selection and sketching",
      intro: "Selection and sketching shortcuts combine entities, control inference and snapping, change planes, and select multiple items.",
      shortcuts: [
        { id: "select-multiple", action: "Select multiple entities", keys: key(["Ctrl", "Click"]) },
        { id: "select-tree-range", action: "Select everything between two FeatureManager items", keys: key(["Shift", "Click"]) },
        { id: "sketch-plane", action: "Change the XYZ plane in a 3D sketch", keys: key(["Tab"]) },
        { id: "suppress-inference", action: "Suppress inference lines while dragging a sketch endpoint", keys: key(["Ctrl", "Drag"]) },
        { id: "disable-relations", action: "Turn off automatic sketch relations", keys: key(["Ctrl"]) },
        { id: "enable-snapping", action: "Turn on snapping", keys: key(["Shift", "Click"]) },
      ],
    },
    {
      id: "assemblies-and-annotations",
      title: "Assemblies and annotations",
      intro: "Assembly and annotation shortcuts expose SmartMate and temporary visibility actions, plus useful placement controls for dimensions and notes.",
      shortcuts: [
        { id: "hide-face", action: "Temporarily hide a face while mating", keys: key(["Alt"]) },
        { id: "smartmate", action: "Create a SmartMate while dragging a component", keys: key(["Alt", "Drag"]) },
        { id: "copy-component", action: "Copy a component while dragging", keys: key(["Ctrl", "Drag"]) },
        { id: "rotate-insert", action: "Rotate an inserted component 90 degrees", keys: key(["Tab"]) },
        { id: "turn-off-alignment", action: "Turn off automatic alignment for dimensions and annotations", keys: key(["Alt", "Click"]) },
        { id: "annotation-plane", action: "Change the annotation view plane", keys: key(["Backquote"]) },
      ],
    },
  ],
};

export default solidworks;
