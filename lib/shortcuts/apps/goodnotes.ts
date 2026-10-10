import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const goodnotes: AppShortcuts = {
  slug: "goodnotes",
  name: "Goodnotes",
  category: "Note-taking",
  platforms: [...platforms],
  versionContext:
    "Goodnotes publishes separate Mac, Windows, iPadOS, and web columns. This record includes the Mac and Windows desktop bindings only. Some tools are available only in a document or text editor, as noted by their group.",
  sourceUrl: "https://support.goodnotes.com/hc/en-us/articles/17220521238159-Keyboard-Shortcuts-in-Goodnotes",
  sourceLabel: "official Goodnotes keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "files-and-tabs",
      title: "Files and tabs",
      intro: "Create notebooks and documents, open tabs, and export or print a Goodnotes file from the keyboard.",
      shortcuts: [
        { id: "new-window", action: "Open a new window", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "new-notebook", action: "Create a new notebook", keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Option", "Cmd", "N"]) },
        { id: "quick-note", action: "Create a QuickNote", keys: combo(platforms, ["Ctrl", "Shift", "Q"], ["Shift", "Cmd", "N"]) },
        { id: "text-document", action: "Create a text document", keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Shift", "Cmd", "T"]) },
        { id: "whiteboard", action: "Create a whiteboard", keys: combo(platforms, ["Ctrl", "Shift", "W"], ["Shift", "Cmd", "W"]) },
        { id: "open", action: "Open a document", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "rename", action: "Rename the current document", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
        { id: "export", action: "Export the document", keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Shift", "Cmd", "E"]) },
        { id: "print", action: "Print the document", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "share", action: "Share or export the document", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Shift", "Cmd", "S"]) },
        { id: "quit", action: "Quit Goodnotes", keys: combo(platforms, ["Ctrl", "Q"], ["Cmd", "Q"]) },
      ],
    },
    {
      id: "editing-and-search",
      title: "Editing and search",
      intro: "Undo edits, move content through the clipboard, search a document, and duplicate selected objects.",
      shortcuts: [
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Shift", "Cmd", "Z"]) },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "delete", action: "Delete the selection", keys: combo(platforms, ["Delete"]) },
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "duplicate", action: "Duplicate the selection", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "find", action: "Find in the document", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "find-next", action: "Find the next match", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "find-previous", action: "Find the previous match", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Shift", "Cmd", "G"]) },
        { id: "dismiss-search", action: "Dismiss search", keys: combo(platforms, ["Esc"]) },
      ],
    },
    {
      id: "tools-and-pages",
      title: "Tools and pages",
      intro: "Choose writing, drawing, selection, and page tools, then move to a page or use Goodnotes assistance.",
      shortcuts: [
        { id: "pen", action: "Choose the pen", keys: combo(platforms, ["P"]) },
        { id: "pencil", action: "Choose the pencil", keys: combo(platforms, ["2"]) },
        { id: "highlighter", action: "Choose the highlighter", keys: combo(platforms, ["H"]) },
        { id: "eraser", action: "Choose the eraser", keys: combo(platforms, ["E"]) },
        { id: "shape", action: "Choose the shape tool", keys: combo(platforms, ["S"]) },
        { id: "lasso", action: "Choose the lasso tool", keys: combo(platforms, ["V"]) },
        { id: "text", action: "Choose the text tool", keys: combo(platforms, ["T"]) },
        { id: "image", action: "Choose the image tool", keys: combo(platforms, ["I"]) },
        { id: "elements", action: "Open Elements", keys: combo(platforms, ["M"]) },
        { id: "tape", action: "Choose the tape tool", keys: combo(platforms, ["A"]) },
        { id: "laser", action: "Choose the laser pointer", keys: combo(platforms, ["L"]) },
        { id: "ruler", action: "Choose the ruler", keys: combo(platforms, ["R"]) },
        { id: "ask-goodnotes", action: "Open Ask Goodnotes", keys: combo(platforms, ["Ctrl", "Alt", "A"], ["Option", "Cmd", "A"]) },
        { id: "jump-page", action: "Jump to a page", keys: combo(platforms, ["Ctrl", "Alt", "G"], ["Option", "Cmd", "G"]) },
        { id: "fullscreen", action: "Toggle fullscreen", keys: combo(platforms, ["Ctrl", "F"], ["Fn", "F"]) },
      ],
    },
    {
      id: "text-formatting",
      title: "Text formatting",
      intro: "Format selected text, align paragraphs, and add links while the Goodnotes text editor has focus.",
      shortcuts: [
        { id: "bold", action: "Bold text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italicize text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "strike", action: "Strike through text", keys: combo(platforms, ["Ctrl", "Shift", "X"], ["Shift", "Cmd", "X"]) },
        { id: "link", action: "Insert a link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "align-left", action: "Align text left", keys: combo(platforms, ["Ctrl", "["] , ["Cmd", "{"]) },
        { id: "align-center", action: "Center text", keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]) },
        { id: "align-right", action: "Align text right", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "}"]) },
        { id: "inline-code", action: "Format inline code", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "highlight", action: "Highlight text", keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Shift", "Cmd", "H"]) },
        { id: "superscript", action: "Apply superscript", keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]) },
        { id: "subscript", action: "Apply subscript", keys: combo(platforms, ["Ctrl", ","], ["Ctrl", ","]) },
      ],
    },
  ],
};

export default goodnotes;
