import type { AppShortcuts, Shortcut } from "../types.ts";

const windows = (items: Array<[string, string, string[], string?]>): Shortcut[] =>
  items.map(([id, action, combination, note]) => ({
    id,
    action,
    keys: [{ platform: "windows", keys: combination }],
    ...(note ? { note } : {}),
  }));

export const autocad: AppShortcuts = {
  slug: "autocad",
  name: "AutoCAD",
  category: "Computer-aided design",
  platforms: ["windows"],
  intro:
    "AutoCAD's default CUIx keymap controls drawings, palettes, selection and editing, drafting aids, viewports, layouts, and 3D subobject filters. This record follows the Windows shortcut table published for AutoCAD 2026.",
  versionContext:
    "Default AutoCAD 2026 shortcut keys from Autodesk's CUIx reference checked August 31, 2026. AutoCAD can customize these assignments, so edited CUIx files can differ. Entries marked AutoCAD only exclude AutoCAD LT. Autodesk publishes a separate product and keymap for AutoCAD on Mac, which is not mixed into this Windows record.",
  sourceUrl: "https://help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Customization/files/GUID-B6A9C126-230D-47F5-8973-464BC80E3736.htm",
  sourceLabel: "AutoCAD 2026 shortcut keys reference",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "application-drawings",
      title: "Application and drawing files",
      intro:
        "Create, open, save, plot, close, and quit drawings, then move among open file tabs without reaching for the application menu.",
      shortcuts: windows([
        ["close-app", "Close the application window", ["Alt", "F4"]],
        ["close-drawing", "Close the current drawing", ["Ctrl", "F4"]],
        ["new", "Create a new drawing", ["Ctrl", "N"]],
        ["open", "Open an existing drawing", ["Ctrl", "O"]],
        ["plot", "Plot the current drawing", ["Ctrl", "P"]],
        ["quit", "Quit AutoCAD", ["Ctrl", "Q"]],
        ["save", "Save the current drawing", ["Ctrl", "S"]],
        ["save-as", "Open Save As", ["Ctrl", "Shift", "S"]],
        ["next-file-f6", "Move to the next file tab", ["Ctrl", "F6"]],
        ["next-file", "Move to the next file tab", ["Ctrl", "Tab"]],
        ["previous-file", "Move to the previous file tab", ["Ctrl", "Shift", "Tab"]],
        ["start-tab", "Move focus to the Start tab", ["Ctrl", "Home"]],
      ]),
    },
    {
      id: "palettes-interface",
      title: "Palettes and interface",
      intro:
        "Toggle Clean Screen, core palettes, command history, the command line, Quick Properties, and AutoCAD development dialogs.",
      shortcuts: windows([
        ["macros", "Open the Macros dialog", ["Alt", "F8"]],
        ["vba", "Open the Visual Basic Editor", ["Alt", "F11"]],
        ["text-window", "Open the Text window", ["Ctrl", "F2"]],
        ["clean-screen", "Toggle Clean Screen", ["Ctrl", "0"]],
        ["properties", "Toggle the Properties palette", ["Ctrl", "1"]],
        ["design-center", "Toggle DesignCenter", ["Ctrl", "2"]],
        ["tool-palettes", "Toggle Tool Palettes", ["Ctrl", "3"]],
        ["sheet-set", "Toggle Sheet Set Manager", ["Ctrl", "4"]],
        ["dbconnect", "Toggle dbConnect Manager", ["Ctrl", "6"]],
        ["markup-set", "Toggle Markup Set Manager", ["Ctrl", "7"]],
        ["quickcalc", "Toggle the QuickCalc palette", ["Ctrl", "8"]],
        ["command-line", "Toggle the Command Line window", ["Ctrl", "9"]],
        ["hide-palettes", "Hide or show palettes", ["Ctrl", "Shift", "H"]],
        ["quick-properties", "Toggle Quick Properties", ["Ctrl", "Shift", "P"]],
      ]),
    },
    {
      id: "selection-editing",
      title: "Selection and editing",
      intro:
        "Select, group, copy, paste, cut, undo, redo, and repeat commands while retaining AutoCAD-specific base-point and block paste operations.",
      shortcuts: windows([
        ["select-all", "Select all unlocked and unfrozen drawing objects", ["Ctrl", "A"]],
        ["groups", "Toggle Groups", ["Ctrl", "Shift", "A"]],
        ["copy", "Copy objects to the Windows Clipboard", ["Ctrl", "C"]],
        ["copy-base", "Copy objects with a base point", ["Ctrl", "Shift", "C"]],
        ["paste", "Paste data from the Windows Clipboard", ["Ctrl", "V"]],
        ["paste-block", "Paste Clipboard data as a block", ["Ctrl", "Shift", "V"]],
        ["cut", "Cut objects to the Windows Clipboard", ["Ctrl", "X"]],
        ["undo", "Reverse the last action", ["Ctrl", "Z"]],
        ["redo", "Cancel the preceding Undo action", ["Ctrl", "Y"]],
        ["repeat-j", "Repeat the last command", ["Ctrl", "J"]],
        ["repeat-m", "Repeat the last command", ["Ctrl", "M"]],
        ["hyperlink", "Insert a hyperlink", ["Ctrl", "K"]],
        ["previous-selection", "Select the previously selected objects", ["Ctrl", "Shift", "L"]],
        ["cancel-bracket", "Cancel the current command", ["Ctrl", "["]],
        ["cancel-backslash", "Cancel the current command", ["Ctrl", "\\"]],
      ]),
    },
    {
      id: "drafting-display",
      title: "Drafting aids and display modes",
      intro:
        "Toggle snap, grids, object snaps, Ortho, Polar Tracking, Dynamic UCS, inferred constraints, and other drafting state stored in AutoCAD.",
      shortcuts: windows([
        ["snap", "Toggle Snap", ["Ctrl", "B"]],
        ["dynamic-ucs", "Toggle Dynamic UCS", ["Ctrl", "D"]],
        ["isoplanes", "Cycle through isometric planes", ["Ctrl", "E"]],
        ["implied-faces", "Enable implied-face extrusion", ["Ctrl", "Shift", "E"]],
        ["object-snaps", "Toggle running object snaps", ["Ctrl", "F"]],
        ["grid", "Toggle grid display mode", ["Ctrl", "G"]],
        ["pickstyle", "Toggle PICKSTYLE", ["Ctrl", "H"]],
        ["coordinates", "Toggle the Coordinates display", ["Ctrl", "I"]],
        ["infer-constraints", "Toggle Infer Constraints", ["Ctrl", "Shift", "I"]],
        ["ortho", "Toggle Ortho mode", ["Ctrl", "L"]],
        ["tablet", "Toggle Tablet mode", ["Ctrl", "T"]],
        ["polar", "Toggle Polar Tracking", ["Ctrl", "U"]],
        ["selection-cycling", "Toggle selection cycling", ["Ctrl", "W"]],
        ["object-snap-3d", "Toggle 3D Object Snap mode", ["Ctrl", "Shift", "Y"]],
      ]),
    },
    {
      id: "layouts-viewports",
      title: "Layouts and viewports",
      intro:
        "Cycle through model and layout viewports, then move directly between neighboring layout tabs in the current drawing.",
      shortcuts: windows([
        ["cycle-viewports", "Cycle through tiled or floating viewports", ["Ctrl", "R"]],
        ["previous-layout", "Move to the previous layout", ["Ctrl", "Page Up"]],
        ["next-layout", "Move to the next layout", ["Ctrl", "Page Down"]],
      ]),
    },
    {
      id: "function-keys",
      title: "Function keys and 3D selection filters",
      intro:
        "Open help and command history, toggle common drawing modes, and constrain subobject selection to vertices, edges, faces, or solid history.",
      shortcuts: windows([
        ["help", "Open Help for the active context", ["F1"]],
        ["history", "Expand Command Line history or open the Text window", ["F2"]],
        ["osnap", "Toggle OSNAP", ["F3"]],
        ["3dosnap", "Toggle 3DOSNAP", ["F4"]],
        ["isoplane", "Toggle ISOPLANE", ["F5"]],
        ["ucsdetect", "Toggle UCSDETECT", ["F6"]],
        ["gridmode", "Toggle GRIDMODE", ["F7"]],
        ["orthomode", "Toggle ORTHOMODE", ["F8"]],
        ["snapmode", "Toggle SNAPMODE", ["F9"]],
        ["polar-function", "Toggle Polar Tracking", ["F10"]],
        ["object-snap-tracking", "Toggle Object Snap Tracking", ["F11"]],
        ["dynamic-input", "Toggle Dynamic Input", ["F12"]],
        ["subobject-all", "Remove the subobject selection filter", ["Shift", "F1"]],
        ["subobject-vertices", "Limit subobject selection to vertices", ["Shift", "F2"]],
        ["subobject-edges", "Limit subobject selection to edges", ["Shift", "F3"]],
        ["subobject-faces", "Limit subobject selection to faces", ["Shift", "F4"]],
        ["subobject-history", "Limit subobject selection to solid history", ["Shift", "F5"]],
      ]),
    },
  ],
};

export default autocad;
