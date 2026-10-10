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

export const wix: AppShortcuts = {
  slug: "wix",
  name: "Wix",
  category: "Website builder",
  platforms: [...platforms],
  versionContext:
    "Wix Editor shortcut article checked September 1, 2026. The source lists Windows and Mac combinations and notes that some commands depend on the editor focus.",
  sourceUrl: "https://support.wix.com/en/article/wix-editor-keyboard-shortcuts-in-the-editor",
  sourceLabel: "official Wix Editor keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing elements",
      intro: "Use these commands to edit, move, order, and select elements in the Wix Editor.",
      shortcuts: [
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("duplicate", "Duplicate the selected element", ["Ctrl", "D"], ["Cmd", "D"]),
        shared("delete", "Delete the selected element", ["Delete"], "Backspace also deletes the selected element."),
        dual("move-backward", "Move the selected element backward", ["Ctrl", "Down Arrow"], ["Cmd", "Down Arrow"]),
        dual("move-forward", "Move the selected element forward", ["Ctrl", "Up Arrow"], ["Cmd", "Up Arrow"]),
        dual("send-back", "Send the selected element to the back", ["Ctrl", "Shift", "Down Arrow"], ["Cmd", "Shift", "Down Arrow"]),
        dual("bring-front", "Bring the selected element to the front", ["Ctrl", "Shift", "Up Arrow"], ["Cmd", "Shift", "Up Arrow"]),
        shared("nudge", "Move an element by one pixel", ["Arrow keys"]),
        shared("nudge-ten", "Move an element by ten pixels", ["Shift", "Arrow keys"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Y"], ["Cmd", "Y"]),
        dual("next-element", "Select the next element", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        dual("previous-element", "Select the previous element", ["Ctrl", "M"], ["Cmd", "M"]),
        dual("cancel", "Cancel the current action", ["Escape"], ["Escape"]),
      ],
    },
    {
      id: "editor-controls",
      title: "Editor controls",
      intro: "Open editor panels, save, preview, and move between the desktop and mobile views.",
      shortcuts: [
        dual("save", "Save the site", ["Ctrl", "S"], ["Cmd", "S"]),
        dual("preview", "Preview the site", ["Ctrl", "P"], ["Cmd", "P"]),
        shared("controls", "Show or hide controls", ["Shift", "F"]),
        dual("mobile-desktop", "Switch between mobile and desktop views", ["Ctrl", "J"], ["Cmd", "J"]),
        shared("rulers", "Show or hide rulers", ["Shift", "R"]),
        dual("autosave", "Open autosave settings", ["Ctrl", "Alt", "A"], ["Cmd", "Option", "A"]),
        shared("pages-panel", "Open the Pages panel", ["/"]),
        shared("shortcuts", "Open the shortcut reference", ["?"]),
        dual("blank-page", "Add a blank page", ["Alt", "N"], ["Option", "N"]),
        dual("blank-section", "Add a blank section", ["Alt", "B"], ["Option", "B"]),
        shared("element-panel", "Open the element panel", ["Enter"]),
        shared("panel-one", "Open panel one", ["Shift", "1"]),
        shared("panel-two", "Open panel two", ["Shift", "2"]),
        shared("panel-three", "Open panel three", ["Shift", "3"]),
        shared("toolbar", "Focus the toolbar", ["Shift", "T"]),
      ],
    },
    {
      id: "text",
      title: "Text formatting",
      intro: "These editor commands apply while text is selected or the text editor has focus.",
      shortcuts: [
        dual("bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italicize text", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("underline", "Underline text", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("text-undo", "Undo a text change", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("text-redo", "Redo a text change", ["Ctrl", "Y"], ["Cmd", "Y"]),
      ],
    },
  ],
};

export default wix;
