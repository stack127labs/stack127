import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleDocs: AppShortcuts = {
  slug: "google-docs",
  name: "Google Docs",
  category: "Document editor",
  platforms: [...platforms],
  versionContext:
    "Google publishes separate PC and Mac columns for Docs. These commands apply while a document or its editor has focus. Browser, screen-reader, and Chromebook tables are outside this desktop record.",
  sourceUrl: "https://support.google.com/docs/answer/179738?hl=en-GB",
  sourceLabel: "official Google Docs keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "document-commands",
      title: "Document commands",
      intro: "Open, print, save, find, and inspect a document without leaving the Google Docs editor.",
      shortcuts: [
        { id: "open", action: "Open a document", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "print", action: "Print the document", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "save", action: "Save the document", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "help", action: "Show keyboard shortcuts", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "find", action: "Find text", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "replace", action: "Find and replace", keys: combo(platforms, ["Ctrl", "H"], ["Cmd", "Shift", "H"]) },
        { id: "next-match", action: "Find the next match", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "previous-match", action: "Find the previous match", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
        { id: "tool-finder", action: "Open the tool finder", keys: combo(platforms, ["Alt", "/"], ["Option", "/"]) },
        { id: "compact-menus", action: "Toggle compact menus", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Ctrl", "Shift", "F"]) },
        { id: "page-break", action: "Insert a page break", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
      ],
    },
    {
      id: "editing-and-clipboard",
      title: "Editing and clipboard",
      intro: "Move text through the clipboard, undo edits, and change the current editing mode from the keyboard.",
      shortcuts: [
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "paste-unformatted", action: "Paste without formatting", keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
        { id: "normal-mode", action: "Use Editing mode", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Shift", "Z"], macos: ["Cmd", "Option", "Shift", "Z"] }) },
        { id: "suggesting-mode", action: "Use Suggesting mode", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Shift", "X"], macos: ["Cmd", "Option", "Shift", "X"] }) },
        { id: "viewing-mode", action: "Use Viewing mode", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Shift", "C"], macos: ["Cmd", "Option", "Shift", "C"] }) },
      ],
    },
    {
      id: "formatting",
      title: "Formatting",
      intro: "Apply character and paragraph formatting while selected text or the current paragraph has focus.",
      shortcuts: [
        { id: "bold", action: "Bold text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italicize text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "strike", action: "Strike through text", keys: combo(platforms, ["Alt", "Shift", "5"], ["Cmd", "Shift", "X"]) },
        { id: "superscript", action: "Apply superscript", keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]) },
        { id: "subscript", action: "Apply subscript", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "clear-formatting", action: "Clear text formatting", keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]) },
        { id: "indent", action: "Increase paragraph indent", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "outdent", action: "Decrease paragraph indent", keys: combo(platforms, ["Ctrl", "["] , ["Cmd", "["]) },
        { id: "normal-text", action: "Apply normal text style", keys: combo(platforms, ["Ctrl", "Alt", "0"], ["Cmd", "Option", "0"]) },
        { id: "heading-1", action: "Apply Heading 1", keys: combo(platforms, ["Ctrl", "Alt", "1"], ["Cmd", "Option", "1"]) },
        { id: "heading-2", action: "Apply Heading 2", keys: combo(platforms, ["Ctrl", "Alt", "2"], ["Cmd", "Option", "2"]) },
        { id: "heading-3", action: "Apply Heading 3", keys: combo(platforms, ["Ctrl", "Alt", "3"], ["Cmd", "Option", "3"]) },
        { id: "heading-4", action: "Apply Heading 4", keys: combo(platforms, ["Ctrl", "Alt", "4"], ["Cmd", "Option", "4"]) },
        { id: "heading-5", action: "Apply Heading 5", keys: combo(platforms, ["Ctrl", "Alt", "5"], ["Cmd", "Option", "5"]) },
        { id: "heading-6", action: "Apply Heading 6", keys: combo(platforms, ["Ctrl", "Alt", "6"], ["Cmd", "Option", "6"]) },
        { id: "align-left", action: "Align left", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "align-center", action: "Align center", keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]) },
        { id: "align-right", action: "Align right", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]) },
        { id: "justify", action: "Justify the paragraph", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
        { id: "numbered-list", action: "Apply a numbered list", keys: combo(platforms, ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]) },
        { id: "bulleted-list", action: "Apply a bulleted list", keys: combo(platforms, ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]) },
        { id: "checklist", action: "Apply a checklist", keys: combo(platforms, ["Ctrl", "Shift", "9"], ["Cmd", "Shift", "9"]) },
      ],
    },
    {
      id: "comments-and-links",
      title: "Comments and links",
      intro: "Add comments, open linked content, and navigate comment threads while collaborating in a document.",
      shortcuts: [
        { id: "insert-link", action: "Insert a link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "open-link", action: "Open a selected link", keys: combo(platforms, ["Alt", "Enter"], ["Option", "Enter"]) },
        { id: "add-comment", action: "Add a comment", keys: combo(platforms, ["Ctrl", "Alt", "M"], ["Cmd", "Option", "M"]) },
        { id: "comment-history", action: "Open comment history", keys: combo(platforms, ["Ctrl", "Alt", "Shift", "A"], ["Cmd", "Option", "Shift", "A"]) },
        { id: "next-comment", action: "Move to the next comment", keys: combo(platforms, ["Ctrl", "Alt", "N", "then", "C"], ["Ctrl", "Cmd", "N", "then", "C"]) },
        { id: "previous-comment", action: "Move to the previous comment", keys: combo(platforms, ["Ctrl", "Alt", "P", "then", "C"], ["Ctrl", "Cmd", "P", "then", "C"]) },
      ],
    },
  ],
};

export default googleDocs;
