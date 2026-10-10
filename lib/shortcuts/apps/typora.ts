import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const cross = (id: string, action: string, windowsLinux: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: windowsLinux, linux: windowsLinux, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

export const typora: AppShortcuts = {
  slug: "typora",
  name: "Typora",
  category: "Writing tool",
  platforms: [...platforms],
  versionContext:
    "Typora's Shortcut Keys reference updated July 19, 2026 and checked September 1, 2026. Typora allows menu bindings to be changed in macOS App Shortcuts or Windows/Linux advanced settings, so this record describes the published defaults.",
  sourceUrl: "https://support.typora.io/Shortcut-Keys/",
  sourceLabel: "official Typora shortcut keys",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "files",
      title: "Files and windows",
      intro: "Create, open, save, reopen, and close Typora documents and windows with the file commands from the official table.",
      shortcuts: [
        cross("new", "Create a new document", ["Ctrl", "N"], ["Cmd", "N"]),
        cross("new-window", "Create a new window", ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]),
        cross("new-tab", "Create a new tab", [], ["Cmd", "T"], "Typora does not assign this default on Windows or Linux."),
        cross("open", "Open a document", ["Ctrl", "O"], ["Cmd", "O"]),
        cross("open-quickly", "Open a document quickly", ["Ctrl", "P"], ["Cmd", "Shift", "O"]),
        cross("reopen", "Reopen the last closed file", ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
        cross("save", "Save", ["Ctrl", "S"], ["Cmd", "S"]),
        cross("save-as", "Save as or duplicate", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        cross("preferences", "Open Preferences", ["Ctrl", ","], ["Cmd", ","]),
        cross("close", "Close the current document", ["Ctrl", "W"], ["Cmd", "W"]),
      ],
    },
    {
      id: "editing",
      title: "Editing and search",
      intro: "Insert paragraphs, move and select text, use the clipboard, and find or replace content in a Typora document.",
      shortcuts: [
        shared("new-paragraph", "Insert a new paragraph", ["Enter"]),
        shared("new-line", "Insert a line break", ["Shift", "Enter"]),
        cross("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        cross("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        cross("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        cross("copy-markdown", "Copy as Markdown", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]),
        cross("paste-plain", "Paste as plain text", ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
        cross("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        cross("select-row", "Select a line or table row", ["Ctrl", "L"], ["Cmd", "L"]),
        cross("delete-row", "Delete a table row", ["Ctrl", "Shift", "Backspace"], ["Cmd", "Shift", "Backspace"]),
        cross("select-cell", "Select a table cell", ["Ctrl", "E"], ["Cmd", "E"]),
        cross("select-word", "Select a word", ["Ctrl", "D"], ["Cmd", "D"]),
        cross("delete-word", "Delete a word", ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]),
        cross("jump-top", "Jump to the top", ["Ctrl", "Home"], ["Cmd", "Up"]),
        cross("jump-selection", "Jump to the selection", ["Ctrl", "J"], ["Cmd", "J"]),
        cross("jump-bottom", "Jump to the bottom", ["Ctrl", "End"], ["Cmd", "Down"]),
        cross("find", "Find", ["Ctrl", "F"], ["Cmd", "F"]),
        cross("find-next", "Find the next match", ["F3"], ["Cmd", "G"], "Enter is an additional documented next-match key."),
        cross("find-previous", "Find the previous match", ["Shift", "F3"], ["Cmd", "Shift", "G"], "Shift+Enter is an additional documented previous-match key."),
        cross("replace", "Replace", ["Ctrl", "H"], ["Cmd", "H"]),
      ],
    },
    {
      id: "paragraph-and-format",
      title: "Paragraphs and formatting",
      intro: "Apply headings, lists, quotes, code, math, links, images, and text formatting without opening the Typora toolbar.",
      shortcuts: [
        cross("heading", "Apply a heading level", ["Ctrl", "1"], ["Cmd", "1"], "Use 1 through 6 for heading levels 1 through 6."),
        cross("paragraph", "Apply paragraph style", ["Ctrl", "0"], ["Cmd", "0"]),
        cross("heading-increase", "Increase the heading level", ["Ctrl", "="], ["Cmd", "="]),
        cross("heading-decrease", "Decrease the heading level", ["Ctrl", "-"], ["Cmd", "-"]),
        cross("table", "Insert a table", ["Ctrl", "T"], ["Cmd", "Option", "T"]),
        cross("code-fence", "Insert a code fence", ["Ctrl", "Shift", "K"], ["Cmd", "Option", "C"]),
        cross("math-block", "Insert a math block", ["Ctrl", "Shift", "M"], ["Cmd", "Option", "B"]),
        cross("quote", "Apply a quote", ["Ctrl", "Shift", "Q"], ["Cmd", "Option", "Q"]),
        cross("ordered-list", "Apply an ordered list", ["Ctrl", "Shift", "["], ["Cmd", "Option", "O"]),
        cross("unordered-list", "Apply an unordered list", ["Ctrl", "Shift", "]"], ["Cmd", "Option", "U"]),
        cross("indent", "Indent", ["Ctrl", "["], ["Cmd", "["] , "Tab is also documented for indentation."),
        cross("outdent", "Outdent", ["Ctrl", "]"], ["Cmd", "]"], "Shift+Tab is also documented for outdent."),
        cross("strong", "Apply strong emphasis", ["Ctrl", "B"], ["Cmd", "B"]),
        cross("emphasis", "Apply emphasis", ["Ctrl", "I"], ["Cmd", "I"]),
        cross("underline", "Underline text", ["Ctrl", "U"], ["Cmd", "U"]),
        cross("inline-code", "Apply inline code", ["Ctrl", "Shift", "`"], ["Cmd", "Shift", "`"]),
        cross("strike", "Apply strikethrough", ["Alt", "Shift", "5"], ["Ctrl", "Shift", "`"]),
        cross("hyperlink", "Insert a hyperlink", ["Ctrl", "K"], ["Cmd", "K"]),
        cross("image", "Insert an image", ["Ctrl", "Shift", "I"], ["Cmd", "Ctrl", "I"]),
        cross("clear-format", "Clear formatting", ["Ctrl", "\\"], ["Cmd", "\\"]),
      ],
    },
    {
      id: "view",
      title: "View and focus",
      intro: "Show or hide Typora sidebars, switch modes, change zoom, move between documents, and open developer tools.",
      shortcuts: [
        cross("sidebar", "Toggle the sidebar", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        cross("outline", "Show the outline", ["Ctrl", "Shift", "1"], ["Cmd", "Ctrl", "1"]),
        cross("articles", "Show articles", ["Ctrl", "Shift", "2"], ["Cmd", "Ctrl", "2"]),
        cross("file-tree", "Show the file tree", ["Ctrl", "Shift", "3"], ["Cmd", "Ctrl", "3"]),
        cross("source-mode", "Toggle source code mode", ["Ctrl", "/"], ["Cmd", "/"]),
        shared("focus-mode", "Toggle Focus Mode", ["F8"]),
        shared("typewriter-mode", "Toggle Typewriter Mode", ["F9"]),
        cross("fullscreen", "Toggle fullscreen", ["F11"], ["Cmd", "Option", "F"]),
        cross("actual-size", "Reset to actual size", ["Ctrl", "Shift", "0"], [], "Typora does not assign this default on macOS."),
        cross("zoom-in", "Zoom in", ["Ctrl", "Shift", "="], [], "Typora does not assign this default on macOS."),
        cross("zoom-out", "Zoom out", ["Ctrl", "Shift", "-"], [], "Typora does not assign this default on macOS."),
        cross("switch-document", "Switch between open documents", ["Ctrl", "Tab"], ["Cmd", "`"]),
        cross("devtools", "Toggle developer tools", ["Shift", "F12"], [], "Typora does not assign this default on macOS."),
      ],
    },
  ],
};

export default typora;
