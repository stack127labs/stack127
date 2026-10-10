import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleSlides: AppShortcuts = {
  slug: "google-slides",
  name: "Google Slides",
  category: "Presentation editor",
  platforms: [...platforms],
  versionContext:
    "Google publishes PC and Mac columns for Slides. Commands such as filmstrip movement and speaker notes require focus in the matching Slides area, while formatting commands apply to selected text or objects.",
  sourceUrl: "https://support.google.com/docs/answer/1696717?hl=en-EN",
  sourceLabel: "official Google Slides keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "slide-editing",
      title: "Slide editing",
      intro: "Create, duplicate, delete, and arrange slides while working in the Slides editor.",
      shortcuts: [
        { id: "new-slide", action: "Create a new slide", keys: combo(platforms, ["Ctrl", "M"], ["Ctrl", "M"]) },
        { id: "duplicate-slide", action: "Duplicate a slide", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "delete", action: "Delete the selected object or slide", keys: combo(platforms, ["Delete"]) },
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Shift", "Z"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "copy-format", action: "Copy formatting", keys: combo(platforms, ["Ctrl", "Alt", "C"], ["Cmd", "Option", "C"]) },
        { id: "paste-format", action: "Paste formatting", keys: combo(platforms, ["Ctrl", "Alt", "V"], ["Cmd", "Option", "V"]) },
        { id: "link", action: "Insert a link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
      ],
    },
    {
      id: "filmstrip-and-presenting",
      title: "Filmstrip and presenting",
      intro: "Move through the slide filmstrip, change zoom, and open presentation or speaker-note controls.",
      shortcuts: [
        { id: "previous-slide", action: "Select the previous slide", keys: combo(platforms, ["Page Up"], ["Up"]) },
        { id: "next-slide", action: "Select the next slide", keys: combo(platforms, ["Page Down"], ["Down"]) },
        { id: "first-slide", action: "Select the first slide", keys: combo(platforms, ["Home"], ["Fn", "Left"]) },
        { id: "last-slide", action: "Select the last slide", keys: combo(platforms, ["End"], ["Fn", "Right"]) },
        { id: "move-slide-up", action: "Move a slide up", keys: combo(platforms, ["Ctrl", "Up"], ["Cmd", "Up"]) },
        { id: "move-slide-down", action: "Move a slide down", keys: combo(platforms, ["Ctrl", "Down"], ["Cmd", "Down"]) },
        { id: "move-slide-first", action: "Move a slide to the beginning", keys: combo(platforms, ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]) },
        { id: "move-slide-last", action: "Move a slide to the end", keys: combo(platforms, ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]) },
        { id: "zoom-in", action: "Zoom in", keys: combo(platforms, ["Ctrl", "="], ["Cmd", "="]) },
        { id: "zoom-out", action: "Zoom out", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "reset-zoom", action: "Reset zoom", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
        { id: "captions", action: "Toggle captions while presenting", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
        { id: "speaker-notes", action: "Open speaker notes", keys: combo(platforms, ["Ctrl", "Alt", "Shift", "S"], ["Cmd", "Option", "Shift", "S"]) },
        { id: "animations", action: "Open the animation panel", keys: combo(platforms, ["Ctrl", "Alt", "Shift", "B"], ["Cmd", "Option", "Shift", "B"]) },
      ],
    },
    {
      id: "text-and-accessibility",
      title: "Text and accessibility",
      intro: "Find text, apply common styles, and add alternative text while editing a slide.",
      shortcuts: [
        { id: "find", action: "Find text", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "replace", action: "Find and replace", keys: combo(platforms, ["Ctrl", "H"], ["Cmd", "Shift", "H"]) },
        { id: "next-match", action: "Find the next match", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "previous-match", action: "Find the previous match", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
        { id: "bold", action: "Bold text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italicize text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "superscript", action: "Apply superscript", keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]) },
        { id: "subscript", action: "Apply subscript", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "tool-finder", action: "Open the tool finder", keys: combo(platforms, ["Alt", "/"], ["Option", "/"]) },
        { id: "help", action: "Show keyboard shortcuts", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "alt-text", action: "Add alternative text", keys: combo(platforms, ["Ctrl", "Alt", "Y"], ["Cmd", "Option", "Y"]) },
      ],
    },
  ],
};

export default googleSlides;
