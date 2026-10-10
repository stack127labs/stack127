import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const fusion360: AppShortcuts = {
  slug: "fusion-360",
  name: "Autodesk Fusion",
  category: "CAD and engineering",
  platforms: [...platforms],
  versionContext:
    "Autodesk's current Fusion keyboard reference labels Windows and macOS separately. Command replaces Control on macOS for the shared document and modeling commands, while Autodesk-specific Option and Command combinations remain platform-specific.",
  sourceUrl: "https://help.autodesk.com/view/fusion360/ENU/?guid=GUID-F0491540-0324-470A-B651-2238D0EFAC30",
  sourceLabel: "official Autodesk Fusion keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "documents-and-layout",
      title: "Documents and layout",
      intro: "Create, open, save, and cycle through Fusion documents while keeping the main interface under keyboard control.",
      shortcuts: [
        { id: "new-document", action: "Create a new document", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "open-document", action: "Open a document", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "save-document", action: "Save the document", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "recovery-save", action: "Save a recovery copy", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "cycle-tabs", action: "Cycle document tabs", keys: combo(platforms, ["Ctrl", "Tab"]) },
        { id: "compute-all", action: "Compute all", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "reset-layout", action: "Reset the layout", keys: combo(platforms, ["Ctrl", "Alt", "R"], ["Option", "Cmd", "R"]) },
        { id: "browser-panel", action: "Show or hide the Browser", keys: combo(platforms, ["Ctrl", "Alt", "B"], ["Option", "Cmd", "B"]) },
        { id: "data-panel", action: "Show or hide the Data Panel", keys: combo(platforms, ["Ctrl", "Alt", "P"], ["Option", "Cmd", "P"]) },
        { id: "comments-panel", action: "Show or hide comments", keys: combo(platforms, ["Ctrl", "Alt", "A"], ["Option", "Cmd", "A"]) },
        { id: "text-commands", action: "Open text commands", keys: combo(platforms, ["Ctrl", "Alt", "C"], ["Option", "Cmd", "C"]) },
        { id: "navigation-bar", action: "Show or hide the navigation bar", keys: combo(platforms, ["Ctrl", "Alt", "N"], ["Option", "Cmd", "N"]) },
      ],
    },
    {
      id: "modeling",
      title: "Modeling tools",
      intro: "Choose the most common solid, feature, visibility, and assembly commands without opening the toolbar.",
      shortcuts: [
        { id: "extrude", action: "Extrude", keys: combo(platforms, ["E"]) },
        { id: "hole", action: "Create a hole", keys: combo(platforms, ["H"]) },
        { id: "press-pull", action: "Press Pull", keys: combo(platforms, ["Q"]) },
        { id: "fillet", action: "Fillet", keys: combo(platforms, ["F"]) },
        { id: "move", action: "Move", keys: combo(platforms, ["M"]) },
        { id: "visibility", action: "Toggle visibility", keys: combo(platforms, ["V"]) },
        { id: "component-colors", action: "Toggle component colors", keys: combo(platforms, ["Shift", "N"]) },
        { id: "model-toolbox", action: "Open the Model Toolbox", keys: combo(platforms, ["S"]) },
        { id: "appearance", action: "Open Appearance", keys: combo(platforms, ["A"]) },
        { id: "joint", action: "Create a joint", keys: combo(platforms, ["J"]) },
        { id: "as-built-joint", action: "Create an as-built joint", keys: combo(platforms, ["Shift", "J"]) },
        { id: "delete", action: "Delete the selection", keys: combo(platforms, ["Delete"]) },
      ],
    },
    {
      id: "sketching",
      title: "Sketching and construction",
      intro: "Start lines, rectangles, circles, constraints, and measurement tools while editing a Fusion sketch.",
      shortcuts: [
        { id: "line", action: "Line", keys: combo(platforms, ["L"]) },
        { id: "rectangle", action: "Two-point rectangle", keys: combo(platforms, ["R"]) },
        { id: "circle", action: "Center-diameter circle", keys: combo(platforms, ["C"]) },
        { id: "trim", action: "Trim", keys: combo(platforms, ["T"]) },
        { id: "offset", action: "Offset", keys: combo(platforms, ["O"]) },
        { id: "measure", action: "Measure", keys: combo(platforms, ["I"]) },
        { id: "project", action: "Project", keys: combo(platforms, ["P"]) },
        { id: "construction", action: "Toggle construction geometry", keys: combo(platforms, ["X"]) },
        { id: "sketch-dimension", action: "Add a sketch dimension", keys: combo(platforms, ["D"]) },
        { id: "midpoint-constraint", action: "Add a midpoint constraint", keys: combo(platforms, ["Shift"]) },
        { id: "scripts-addins", action: "Open Scripts and Add-Ins", keys: combo(platforms, ["Shift", "S"]) },
      ],
    },
    {
      id: "selection-and-view",
      title: "Selection and view",
      intro: "Change selection modes and return to a predictable canvas view while a tool or workspace is active.",
      shortcuts: [
        { id: "window-selection", action: "Use window selection", keys: combo(platforms, ["1"]) },
        { id: "freeform-selection", action: "Use freeform selection", keys: combo(platforms, ["2"]) },
        { id: "paint-selection", action: "Use paint selection", keys: combo(platforms, ["3"]) },
        { id: "viewcube", action: "Show or hide the ViewCube", keys: combo(platforms, ["Ctrl", "Alt", "V"], ["Option", "Cmd", "V"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Shift", "Z"]) },
        { id: "manufacture-workspace", action: "Cycle to the Manufacture workspace", keys: combo(platforms, ["Ctrl", "G"]) },
      ],
    },
  ],
};

export default fusion360;
