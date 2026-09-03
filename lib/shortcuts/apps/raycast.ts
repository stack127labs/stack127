import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["macos", "windows"] as const;

const dual = (id: string, action: string, macos: string[], windows: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { macos, windows }),
  ...(note ? { note } : {}),
});

export const raycast: AppShortcuts = {
  slug: "raycast",
  name: "Raycast",
  category: "Launcher",
  platforms: [...platforms],
  intro:
    "Raycast is a keyboard-first launcher with search, action panels, forms, AI chat, and configurable hotkeys. This reference separates built-in commands from settings and text editing so configurable global shortcuts are not mistaken for fixed app bindings.",
  versionContext:
    "Current Raycast Manual keyboard shortcuts checked September 1, 2026. Raycast supports macOS and Windows, and users can change page navigation, Emacs, Vim, and global hotkeys in settings.",
  sourceUrl: "https://manual.raycast.com/keyboard-shortcuts",
  sourceLabel: "official Raycast keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "global-and-general",
      title: "Global and general navigation",
      intro: "Global and general commands open Raycast, return to the root, close its window, and reach settings or the user guide.",
      shortcuts: [
        dual("open-raycast", "Open or close Raycast", ["Cmd", "Space"], ["Alt", "Space"], "The default global hotkey can be customized in Raycast settings."),
        dual("back", "Go back", ["Esc"], ["Esc"]),
        dual("root", "Pop to Root", ["Cmd", "Esc"], ["Shift", "Esc"]),
        dual("close-window", "Close the Raycast window", ["Cmd", "W"], ["Ctrl", "W"]),
        dual("settings", "Open Settings", ["Cmd", ","], ["Ctrl", ","]),
        dual("user-guide", "Open the User Guide", ["Shift", "Cmd", "/"], ["Ctrl", "Shift", "/"]),
      ],
    },
    {
      id: "search-and-action-panel",
      title: "Search and action panel",
      intro: "Search and action-panel bindings run the selected result, reveal secondary actions, and move through long result lists.",
      shortcuts: [
        dual("move-list", "Move up or down through results", ["Up", "/", "Down"], ["Up", "/", "Down"]),
        dual("page-results", "Jump to the previous or next page", ["Option", "Up", "/", "Option", "Down"], ["Alt", "Up", "/", "Alt", "Down"]),
        dual("section-results", "Jump to the previous or next section", ["Cmd", "Up", "/", "Cmd", "Down"], ["Ctrl", "Up", "/", "Ctrl", "Down"]),
        dual("run-primary", "Run the primary action", ["Return"], ["Enter"]),
        dual("action-panel", "Open or close the Action Panel", ["Cmd", "K"], ["Ctrl", "K"]),
        dual("run-secondary", "Run the secondary action", ["Cmd", "Return"], ["Ctrl", "Enter"]),
        dual("run-tertiary", "Run the tertiary action", ["Shift", "Cmd", "Return"], ["Ctrl", "Shift", "Enter"]),
        dual("parent-directory", "Navigate to the parent directory", ["Shift", "Tab"], ["Shift", "Tab"]),
        dual("favorite", "Add the selected item to Favorites", ["Cmd", "F"], ["Ctrl", "F"]),
        dual("configure-command", "Configure a command", ["Cmd", ","], ["Ctrl", ","]),
        dual("configure-extension", "Configure an extension", ["Shift", "Cmd", ","], ["Ctrl", "Shift", ","]),
        dual("disable-command", "Disable a command", ["Shift", "Cmd", "D"], ["Ctrl", "Shift", "D"]),
      ],
    },
    {
      id: "item-actions",
      title: "Item actions",
      intro: "Item actions apply to the selected application, file, command, or event when its result is focused in Raycast.",
      shortcuts: [
        dual("open-item", "Open item", ["Cmd", "O"], ["Ctrl", "O"]),
        dual("reveal-item", "Reveal in Finder or File Explorer", ["Shift", "Cmd", "O"], ["Ctrl", "Shift", "O"]),
        dual("open-with", "Open With", ["Option", "Cmd", "O"], ["Ctrl", "Alt", "O"]),
        dual("quick-look", "Toggle Quick Look preview", ["Cmd", "Y"], ["Ctrl", "Y"]),
        dual("edit-item", "Edit item", ["Cmd", "E"], ["Ctrl", "E"]),
        dual("item-info", "Show item information", ["Cmd", "I"], ["Ctrl", "I"]),
        dual("duplicate-item", "Duplicate item", ["Cmd", "D"], ["Ctrl", "D"]),
        dual("pin-item", "Pin or unpin item", ["Cmd", "."], ["Ctrl", "."]),
        dual("hidden-items", "Show hidden items", ["Shift", "Cmd", "."], ["Ctrl", "Shift", "."]),
        dual("copy", "Copy", ["Cmd", "C"], ["Ctrl", "C"]),
        dual("copy-secondary", "Copy a secondary value such as a deeplink", ["Shift", "Cmd", "C"], ["Ctrl", "Shift", "C"]),
        dual("paste", "Paste", ["Cmd", "V"], ["Ctrl", "V"]),
        dual("delete", "Delete selected item", ["Ctrl", "X"], ["Ctrl", "X"]),
      ],
    },
    {
      id: "ai-chat-and-forms",
      title: "AI chat and forms",
      intro: "Raycast's AI chat, form, and text-editing bindings work inside those views and do not replace the global launcher shortcut.",
      shortcuts: [
        dual("chat-history", "Toggle chat history sidebar", ["Shift", "Cmd", "S"], ["Ctrl", "Shift", "S"]),
        dual("search-chats", "Search chats", ["Shift", "Cmd", "F"], ["Ctrl", "Shift", "F"]),
        dual("send-to-chat", "Send selected item to AI Chat", ["Cmd", "J"], ["Ctrl", "J"]),
        dual("attachment", "Add an attachment to the composer", ["Shift", "Cmd", "A"], ["Ctrl", "Shift", "A"]),
        dual("branch-chat", "Branch chat from a message", ["Shift", "Cmd", "B"], ["Ctrl", "Shift", "B"]),
        dual("change-model", "Change AI model", ["Shift", "Cmd", "M"], ["Ctrl", "Shift", "M"]),
        dual("submit-form", "Submit a form", ["Cmd", "Return"], ["Ctrl", "Enter"]),
        dual("next-field", "Move to the next form field", ["Tab"], ["Tab"]),
        dual("previous-field", "Move to the previous form field", ["Shift", "Tab"], ["Shift", "Tab"]),
        dual("select-all", "Select all text", ["Cmd", "A"], ["Ctrl", "A"]),
        dual("cut", "Cut text", ["Cmd", "X"], ["Ctrl", "X"]),
        dual("undo", "Undo text edit", ["Cmd", "Z"], ["Ctrl", "Z"]),
        dual("redo", "Redo text edit", ["Shift", "Cmd", "Z"], ["Ctrl", "Shift", "Z"]),
      ],
    },
  ],
};

export default raycast;
