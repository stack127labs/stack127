import { sameKeys, type AppShortcuts } from "../types.ts";

const platforms = ["windows"] as const;
const win = (keys: string[]) => sameKeys([...platforms], keys);

export const sevenZip: AppShortcuts = {
  slug: "7-zip",
  name: "7-Zip",
  category: "File archiver",
  platforms: [...platforms],
  intro:
    "7-Zip File Manager uses function keys for file work and numeric keypad keys for selection. The official source defines the bindings directly in the File Manager key handler.",
  versionContext:
    "7-Zip 26.02 File Manager defaults checked August 31, 2026. These bindings cover the Windows graphical File Manager, not the 7z command-line program or Explorer context-menu access keys.",
  sourceUrl: "https://github.com/ip7z/7zip/blob/26.02/CPP/7zip/UI/FileManager/PanelKey.cpp",
  sourceLabel: "7-Zip 26.02 File Manager key handler",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "files-and-folders",
      title: "Files and folders",
      intro: "Open, edit, create, copy, move, delete, and refresh items in the graphical File Manager.",
      shortcuts: [
        { id: "rename", action: "Rename the selected item", keys: win(["F2"]) },
        { id: "view", action: "View the selected item", keys: win(["F3"]) },
        { id: "edit", action: "Edit the selected item", keys: win(["F4"]) },
        {
          id: "create-file",
          action: "Create a file",
          keys: [{ platform: "windows", keys: ["Shift", "F4"], alternatives: [["Ctrl", "N"]] }],
        },
        { id: "copy-to", action: "Copy the selected items", keys: win(["F5"]) },
        { id: "copy-in-folder", action: "Copy the focused item within the current folder", keys: win(["Shift", "F5"]) },
        { id: "move-to", action: "Move the selected items", keys: win(["F6"]) },
        { id: "move-in-folder", action: "Move or rename the focused item within the current folder", keys: win(["Shift", "F6"]) },
        { id: "create-folder", action: "Create a folder", keys: win(["F7"]) },
        { id: "delete", action: "Move the selected items to the Recycle Bin", keys: win(["Delete"]) },
        { id: "delete-permanently", action: "Delete the selected items without using the Recycle Bin", keys: win(["Shift", "Delete"]) },
        { id: "parent-folder", action: "Open the parent folder", keys: win(["Backspace"]) },
        { id: "refresh", action: "Refresh the file list", keys: win(["Ctrl", "R"]) },
        { id: "comment", action: "Edit the selected item's comment", keys: win(["Ctrl", "Z"]) },
      ],
    },
    {
      id: "clipboard-and-selection",
      title: "Clipboard and selection",
      intro: "Use Windows clipboard commands or 7-Zip's numeric keypad bindings to build and change a selection.",
      shortcuts: [
        { id: "cut", action: "Cut the selected items", keys: win(["Ctrl", "X"]) },
        {
          id: "copy",
          action: "Copy the selected items to the clipboard",
          keys: [{ platform: "windows", keys: ["Ctrl", "C"], alternatives: [["Ctrl", "Insert"]] }],
        },
        {
          id: "paste",
          action: "Paste items from the clipboard",
          keys: [{ platform: "windows", keys: ["Ctrl", "V"], alternatives: [["Shift", "Insert"]] }],
        },
        { id: "select-all", action: "Select all items", keys: [{ platform: "windows", keys: ["Ctrl", "A"], alternatives: [["Shift", "Numpad +"]] }] },
        { id: "select-mask", action: "Select items by a name mask", keys: win(["Numpad +"]) },
        { id: "deselect-mask", action: "Deselect items by a name mask", keys: win(["Numpad -"]) },
        { id: "select-type", action: "Select items with the focused item's type", keys: win(["Alt", "Numpad +"]) },
        { id: "deselect-type", action: "Deselect items with the focused item's type", keys: win(["Alt", "Numpad -"]) },
        { id: "deselect-all", action: "Deselect all items", keys: win(["Shift", "Numpad -"]) },
        { id: "invert-selection", action: "Invert the selection", keys: win(["Numpad *"]) },
        { id: "extend-selection-down", action: "Extend the selection down", keys: win(["Shift", "Down"]) },
        { id: "extend-selection-up", action: "Extend the selection up", keys: win(["Shift", "Up"]) },
        {
          id: "toggle-selection-and-advance",
          action: "Toggle the focused item's selection and move to the next item",
          keys: win(["Insert"]),
          note: "This binding runs when 7-Zip's alternative selection mode is enabled.",
        },
      ],
    },
    {
      id: "panels-and-view",
      title: "Panels and view",
      intro: "Move between panels, focus a path, change the file-list layout, and sort by a file property.",
      shortcuts: [
        { id: "switch-panel", action: "Move focus to the other panel", keys: win(["Tab"]), note: "This applies when two-panel mode is active." },
        { id: "toggle-one-panel", action: "Toggle one-panel mode", keys: win(["F9"]) },
        { id: "focus-left-path", action: "Focus the left panel path", keys: win(["Alt", "F1"]) },
        { id: "focus-right-path", action: "Focus the right panel path", keys: win(["Alt", "F2"]) },
        { id: "folder-history", action: "Open folder history", keys: win(["Alt", "F12"]) },
        {
          id: "match-other-panel-folder",
          action: "Open the current panel's folder in the other panel",
          keys: win(["Alt", "Up"]),
          note: "This applies when two-panel mode is active.",
        },
        {
          id: "open-folder-in-other-panel",
          action: "Open the focused folder in the other panel",
          keys: [{ platform: "windows", keys: ["Alt", "Left"], alternatives: [["Alt", "Right"]] }],
          note: "This applies when two-panel mode is active and the focused item is a folder.",
        },
        { id: "large-icons", action: "Use large icons", keys: win(["Ctrl", "1"]) },
        { id: "small-icons", action: "Use small icons", keys: win(["Ctrl", "2"]) },
        { id: "list-view", action: "Use list view", keys: win(["Ctrl", "3"]) },
        { id: "details-view", action: "Use details view", keys: win(["Ctrl", "4"]) },
        { id: "sort-name", action: "Sort by name", keys: win(["Ctrl", "F3"]) },
        { id: "sort-extension", action: "Sort by extension", keys: win(["Ctrl", "F4"]) },
        { id: "sort-modified", action: "Sort by modified time", keys: win(["Ctrl", "F5"]) },
        { id: "sort-size", action: "Sort by size", keys: win(["Ctrl", "F6"]) },
        { id: "unsorted", action: "Clear property sorting", keys: win(["Ctrl", "F7"]) },
      ],
    },
    {
      id: "program",
      title: "Program",
      intro: "Close File Manager and save or recall one of its ten numbered folder bookmarks from the keyboard.",
      shortcuts: [
        { id: "close", action: "Close 7-Zip File Manager", keys: win(["Ctrl", "W"]) },
        {
          id: "open-bookmark",
          action: "Open a numbered folder bookmark",
          keys: [{ platform: "windows", keys: ["Alt", "0-9"], alternatives: [["Right Ctrl", "0-9"]] }],
        },
        {
          id: "set-bookmark",
          action: "Set a numbered folder bookmark",
          keys: [{ platform: "windows", keys: ["Alt", "Shift", "0-9"], alternatives: [["Right Ctrl", "Shift", "0-9"]] }],
        },
      ],
    },
  ],
};

export default sevenZip;
