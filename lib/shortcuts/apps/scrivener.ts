import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

export const scrivener: AppShortcuts = {
  slug: "scrivener",
  name: "Scrivener",
  category: "Writing",
  platforms: [...platforms],
  versionContext:
    "Scrivener 3 defaults for Windows and Mac. You can change many of them, and the two versions use different keys.",
  sourceUrl: "https://www.literatureandlatte.com/docs/Scrivener_Manual-Win.pdf",
  sourceLabel: "official Scrivener 3 user manuals",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "project-files",
      title: "Projects and files",
      intro: "Create, open, save, print, compile, and close Scrivener projects.",
      shortcuts: [
        dual("new-project", "Create a new project", ["Ctrl", "Shift", "N"], ["Shift", "Cmd", "N"]),
        dual("open-project", "Open a project", ["Ctrl", "O"], ["Cmd", "O"]),
        dual("close-project", "Close the current project", ["Alt", "F4"], ["Shift", "Cmd", "W"]),
        dual("close-window", "Close the current window", [], ["Cmd", "W"]),
        dual("save", "Save", ["Ctrl", "S"], ["Cmd", "S"]),
        dual("save-as", "Save as", ["Ctrl", "Shift", "S"], ["Shift", "Cmd", "S"]),
        dual("page-setup", "Open page setup", ["Ctrl", "Shift", "P"], ["Shift", "Cmd", "P"]),
        dual("print", "Print the current document", ["Ctrl", "P"], ["Cmd", "P"]),
        dual("compile", "Compile the draft", ["Ctrl", "Shift", "E"], ["Option", "Cmd", "E"]),
        dual("options", "Open application options", ["Ctrl", ","], ["Cmd", ","]),
        dual("exit", "Exit Scrivener", ["Ctrl", "Alt", "F4"], ["Cmd", "Q"]),
      ],
    },
    {
      id: "text-editing",
      title: "Text editing",
      intro: "Edit text, search the active document, and move through matching results with Scrivener's standard editor commands.",
      shortcuts: [
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Y"], ["Shift", "Cmd", "Z"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("paste-match-style", "Paste and match style", ["Ctrl", "Shift", "V"], ["Option", "Shift", "Cmd", "V"]),
        dual("select-all", "Select all text", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("find", "Open Find", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("find-next", "Find the next match", ["F3"], ["Cmd", "G"]),
        dual("find-previous", "Find the previous match", ["Shift", "F3"], ["Shift", "Cmd", "G"]),
        dual("replace", "Open Find and Replace", ["Ctrl", "H"], []),
      ],
    },
    {
      id: "formatting",
      title: "Text formatting",
      intro: "Apply common text formatting and paragraph alignment while the Scrivener editor has focus.",
      shortcuts: [
        dual("bold", "Bold", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italic", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("underline", "Underline", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("align-left", "Align left", ["Win", "{"], ["Cmd", "{"]),
        dual("align-center", "Align center", ["Win", "|"], ["Cmd", "|"]),
        dual("align-right", "Align right", ["Win", "}"], ["Cmd", "}"]),
        dual("align-justified", "Justify text", ["Alt", "|"], ["Shift", "Option", "Cmd", "\\"]),
        dual("increase-font", "Increase font size", ["Ctrl", ">"], ["Cmd", "+"]),
        dual("decrease-font", "Decrease font size", ["Ctrl", "<"], ["Cmd", "-"]),
        dual("annotation", "Insert an inline annotation", ["Alt", "Shift", "F2"], ["Shift", "Cmd", "A"]),
        dual("footnote", "Insert a footnote", ["Shift", "F5"], ["Control", "Cmd", "8"]),
      ],
    },
    {
      id: "documents",
      title: "Documents and binder",
      intro: "Reorder, split, group, merge, duplicate, and snapshot selected Scrivener documents from the binder or editor.",
      shortcuts: [
        dual("move-up", "Move the selected item up", ["Ctrl", "Up Arrow"], ["Control", "Cmd", "Up Arrow"]),
        dual("move-down", "Move the selected item down", ["Ctrl", "Down Arrow"], ["Control", "Cmd", "Down Arrow"]),
        dual("move-left", "Move the selected item left", ["Ctrl", "Left Arrow"], ["Control", "Cmd", "Left Arrow"]),
        dual("move-right", "Move the selected item right", ["Ctrl", "Right Arrow"], ["Control", "Cmd", "Right Arrow"]),
        dual("split-selection", "Split at the selection", ["Ctrl", "Shift", "K"], ["Option", "Cmd", "K"]),
        dual("duplicate", "Duplicate the selected item", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("snapshot", "Take a snapshot", ["Ctrl", "5"], ["Cmd", "5"]),
        dual("group", "Move the selection into a new folder", ["Alt", "Shift", "G"], ["Option", "Cmd", "G"]),
        dual("ungroup", "Ungroup the selection", ["Alt", "Shift", "U"], ["Option", "Cmd", "U"]),
        dual("merge", "Merge documents", ["Ctrl", "Shift", "M"], ["Shift", "Cmd", "M"]),
      ],
    },
    {
      id: "navigation",
      title: "Navigation and views",
      intro: "Reveal the current document, change the editor's scale, and open the manual.",
      shortcuts: [
        dual("reveal-in-binder", "Reveal the current document in the binder", ["Win", "Shift", "R"], ["Option", "Cmd", "R"]),
        dual("zoom-in", "Zoom in", ["Ctrl", "="], ["Cmd", ">"]),
        dual("zoom-out", "Zoom out", ["Ctrl", "-"], ["Cmd", "<"]),
        dual("manual", "Open the Scrivener manual", ["F1"], []),
      ],
    },
  ],
};

export default scrivener;
