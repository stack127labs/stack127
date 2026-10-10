import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleForms: AppShortcuts = {
  slug: "google-forms",
  name: "Google Forms",
  category: "Form builder",
  platforms: [...platforms],
  versionContext:
    "Google documents shortcuts for the form editor on PC and Mac. Commands that insert an item use a sequential Ctrl or Command sequence, represented with a visible then token here.",
  sourceUrl: "https://support.google.com/docs/answer/6026976?hl=en",
  sourceLabel: "official Google Forms keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation-and-document",
      title: "Navigation and document",
      intro: "Move through a form, preview it, open help, and print or find content without leaving the editor.",
      shortcuts: [
        { id: "previous-item", action: "Move to the previous item", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "next-item", action: "Move to the next item", keys: combo(platforms, ["Ctrl", "J"], ["Cmd", "J"]) },
        { id: "help", action: "Show keyboard shortcuts", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "print", action: "Print the form", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "find", action: "Find text", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "preview", action: "Preview the form", keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]) },
        { id: "settings", action: "Open form settings", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "send", action: "Send the form", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Shift", "Z"]) },
      ],
    },
    {
      id: "insert-and-reorder",
      title: "Insert and reorder",
      intro: "Insert questions, titles, descriptions, images, videos, and sections, then move or duplicate an item.",
      shortcuts: [
        { id: "insert-question", action: "Insert a question", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]) },
        { id: "insert-title", action: "Insert a title and description", keys: perPlatform(platforms, { windows: ["Ctrl", "I", "then", "I"], macos: ["Cmd", "I", "then", "I"] }) },
        { id: "insert-image", action: "Insert an image", keys: perPlatform(platforms, { windows: ["Ctrl", "I", "then", "P"], macos: ["Cmd", "I", "then", "P"] }) },
        { id: "insert-video", action: "Insert a video", keys: perPlatform(platforms, { windows: ["Ctrl", "I", "then", "V"], macos: ["Cmd", "I", "then", "V"] }) },
        { id: "insert-section", action: "Insert a section", keys: perPlatform(platforms, { windows: ["Ctrl", "I", "then", "B"], macos: ["Cmd", "I", "then", "B"] }) },
        { id: "move-up", action: "Move the item up", keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]) },
        { id: "move-down", action: "Move the item down", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
        { id: "duplicate", action: "Duplicate the item", keys: combo(platforms, ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]) },
        { id: "delete", action: "Delete the item", keys: combo(platforms, ["Alt", "Shift", "D"], ["Option", "Shift", "D"]) },
      ],
    },
    {
      id: "text-formatting",
      title: "Text formatting",
      intro: "Change alignment and common text styles while a form title, description, or question field has focus.",
      shortcuts: [
        { id: "align-left", action: "Align text left", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "align-center", action: "Align text center", keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]) },
        { id: "align-right", action: "Align text right", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]) },
        { id: "bold", action: "Bold text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italicize text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
      ],
    },
    {
      id: "grading",
      title: "Grading",
      intro: "Use the grading shortcuts when a question or answer key is selected in the form editor.",
      shortcuts: [
        { id: "copy-grade", action: "Copy a grade", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
        { id: "insert-grade", action: "Insert a grade", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"]) },
        { id: "next-grade", action: "Move to the next grading field", keys: combo(platforms, ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]) },
        { id: "previous-grade", action: "Move to the previous grading field", keys: combo(platforms, ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]) },
      ],
    },
  ],
};

export default googleForms;
