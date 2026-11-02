import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const joplin: AppShortcuts = {
  slug: "joplin",
  name: "Joplin",
  category: "Notes and writing",
  platforms: [...platforms],
  versionContext:
    "Joplin's terminal app, on macOS, Linux, and Windows through WSL. Press multi-letter shortcuts one key at a time.",
  sourceUrl: "https://joplinapp.org/help/apps/terminal/",
  sourceLabel: "official Joplin Terminal keymap",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "navigation",
      title: "Navigation and selection",
      intro:
        "Move through the terminal interface with single keys. Delete and Backspace both delete the focused item.",
      shortcuts: [
        { id: "focus-next", action: "Focus the next control", keys: combo(platforms, ["Tab"]) },
        { id: "focus-previous", action: "Focus the previous control", keys: combo(platforms, ["Shift", "Tab"]) },
        { id: "move-up", action: "Move up", keys: combo(platforms, ["Up"]) },
        { id: "move-down", action: "Move down", keys: combo(platforms, ["Down"]) },
        { id: "page-up", action: "Move up one page", keys: combo(platforms, ["Page Up"]) },
        { id: "page-down", action: "Move down one page", keys: combo(platforms, ["Page Down"]) },
        { id: "activate", action: "Activate the focused item", keys: combo(platforms, ["Enter"]) },
        {
          id: "delete",
          action: "Delete the focused item",
          keys: platforms.map((platform) => ({ platform, keys: ["Delete"], alternatives: [["Backspace"]] })),
        },
        { id: "toggle-todo", action: "Toggle the focused todo", keys: combo(platforms, ["Space"]) },
        { id: "next-link", action: "Focus the next link", keys: combo(platforms, ["n"]) },
        { id: "previous-link", action: "Focus the previous link", keys: combo(platforms, ["b"]) },
        { id: "open-link", action: "Open the focused link", keys: combo(platforms, ["o"]) },
      ],
    },
    {
      id: "commands-and-search",
      title: "Commands and search",
      intro:
        "Type these command sequences one key at a time. In command-line mode, $n means the selected note and $b the selected notebook.",
      shortcuts: [
        { id: "command-mode", action: "Enter command-line mode", keys: combo(platforms, [":"]) },
        { id: "search", action: "Search", keys: combo(platforms, ["/"]) },
        { id: "new-note", action: "Create a new note", keys: combo(platforms, ["m", "n"]) },
        { id: "new-todo", action: "Create a new todo", keys: combo(platforms, ["m", "t"]) },
        { id: "new-notebook", action: "Create a new notebook", keys: combo(platforms, ["m", "b"]) },
        { id: "toggle-console", action: "Toggle the console", keys: combo(platforms, ["t", "c"]) },
        { id: "toggle-metadata", action: "Toggle metadata", keys: combo(platforms, ["t", "m"]) },
        { id: "copy-note", action: "Copy the focused note", keys: combo(platforms, ["y", "n"]) },
        { id: "move-note", action: "Move the focused note", keys: combo(platforms, ["d", "n"]) },
      ],
    },
  ],
};

export default joplin;
