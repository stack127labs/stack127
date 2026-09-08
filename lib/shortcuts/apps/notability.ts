import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["macos"] as const;

const mac = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { macos: keys }),
  ...(note ? { note } : {}),
});

export const notability: AppShortcuts = {
  slug: "notability",
  name: "Notability",
  category: "Notes and docs",
  platforms: [...platforms],
  intro:
    "Notability's Mac shortcuts cover note creation, page movement, audio playback, search, formatting, recording, and the library. Toolbox and color shortcuts use the current positions in Notability's configurable controls.",
  versionContext:
    "Notability keyboard shortcuts checked September 1, 2026. This record uses the official Mac table and the toolbox, color, size, and content manager rows. The separate iPad table is outside this catalog's Windows, macOS, and Linux platform model.",
  sourceUrl: "https://support.gingerlabs.com/hc/en-us/articles/360021489291-Keyboard-shortcuts",
  sourceLabel: "official Notability keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "notes-and-navigation",
      title: "Notes and navigation",
      intro: "Create notes, move through pages, open the library, and control the Notability window with these Mac commands.",
      shortcuts: [
        mac("close-window", "Close window", ["Cmd", "W"]),
        mac("new-note", "Create a new note", ["Cmd", "N"]),
        mac("new-note-template", "Create a new note from a template", ["Option", "Cmd", "N"]),
        mac("next-page", "Go to the next page", ["Option", "Down Arrow"]),
        mac("previous-page", "Go to the previous page", ["Option", "Up Arrow"]),
        mac("new-window", "Open a new window", ["Shift", "Cmd", "N"]),
        mac("settings", "Open settings", ["Cmd", ","]),
        mac("print", "Print", ["Cmd", "P"]),
        mac("show-library", "Show or hide the library", ["Cmd", "L"]),
        mac("help", "Open help", ["Cmd", "/"]),
        mac("focus-mode", "Toggle Focus Mode", ["Cmd", "Shift", "F"]),
        mac("start-recording", "Start recording", ["Cmd", "R"]),
      ],
    },
    {
      id: "editing-and-search",
      title: "Editing and search",
      intro: "Format note text, insert common content, search within notes, and move through the search results.",
      shortcuts: [
        mac("insert-text-box", "Insert a text box", ["Shift", "Cmd", "T"]),
        mac("insert-photo", "Insert a photo", ["Shift", "Cmd", "I"]),
        mac("insert-math", "Insert math", ["Shift", "Cmd", "M"]),
        mac("bold", "Bold", ["Cmd", "B"]),
        mac("italic", "Italic", ["Cmd", "I"]),
        mac("night-mode", "Toggle Night Mode", ["Cmd", "I"], "The official Mac table lists this same binding for Night Mode."),
        mac("underline", "Underline", ["Cmd", "U"]),
        mac("undo", "Undo", ["Cmd", "Z"]),
        mac("redo", "Redo", ["Shift", "Cmd", "Z"]),
        mac("search", "Search", ["Cmd", "F"]),
        mac("search-next", "Go to the next search result", ["Cmd", "G"]),
        mac("search-previous", "Go to the previous search result", ["Cmd", "Shift", "G"]),
        mac("fast-forward-audio", "Fast forward audio", ["Cmd", "Shift", "Right Arrow"]),
        mac("rewind-audio", "Rewind audio", ["Cmd", "Shift", "Left Arrow"]),
      ],
    },
    {
      id: "toolbox",
      title: "Toolbox and options",
      intro: "The toolbox keys select a tool by its current position, so changing the toolbox order changes which tool each number opens.",
      shortcuts: [
        mac("select-tool-1", "Select toolbox tool 1", ["Cmd", "1"]),
        mac("select-tool-2", "Select toolbox tool 2", ["Cmd", "2"]),
        mac("select-tool-3", "Select toolbox tool 3", ["Cmd", "3"]),
        mac("select-tool-4", "Select toolbox tool 4", ["Cmd", "4"]),
        mac("select-tool-5", "Select toolbox tool 5", ["Cmd", "5"]),
        mac("select-tool-6", "Select toolbox tool 6", ["Cmd", "6"]),
        mac("select-tool-7", "Select toolbox tool 7", ["Cmd", "7"]),
        mac("select-tool-8", "Select toolbox tool 8", ["Cmd", "8"]),
        mac("select-tool-9", "Select toolbox tool 9", ["Cmd", "9"]),
        mac("start-recording-toolbox", "Start recording from the toolbox", ["Cmd", "R"]),
      ],
    },
    {
      id: "colors-and-sizes",
      title: "Colors and sizes",
      intro: "Choose a color or size by its current toolbar position while a compatible Notability tool is selected.",
      shortcuts: [
        mac("color-1", "Select color 1", ["Option", "Cmd", "1"]),
        mac("color-2", "Select color 2", ["Option", "Cmd", "2"]),
        mac("color-3", "Select color 3", ["Option", "Cmd", "3"]),
        mac("color-4", "Select color 4", ["Option", "Cmd", "4"]),
        mac("color-5", "Select color 5", ["Option", "Cmd", "5"]),
        mac("color-6", "Select color 6", ["Option", "Cmd", "6"]),
        mac("color-7", "Select color 7", ["Option", "Cmd", "7"]),
        mac("color-8", "Select color 8", ["Option", "Cmd", "8"]),
        mac("previous-color", "Select the previous color", ["Option", "Cmd", "9"]),
        mac("next-color", "Select the next color", ["Option", "Cmd", "0"]),
        mac("size-1", "Select size 1", ["Control", "Option", "1"]),
        mac("size-2", "Select size 2", ["Control", "Option", "2"]),
        mac("size-3", "Select size 3", ["Control", "Option", "3"]),
      ],
    },
    {
      id: "content-manager",
      title: "Content manager",
      intro: "Use these commands in Notability's content manager to copy, cut, paste, and delete selected items.",
      shortcuts: [
        mac("copy", "Copy", ["Cmd", "C"]),
        mac("cut", "Cut", ["Cmd", "X"]),
        mac("delete", "Delete", ["Delete"]),
        mac("paste", "Paste", ["Cmd", "V"]),
      ],
    },
  ],
};

export default notability;
