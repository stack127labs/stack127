import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const joplin: AppShortcuts = {
  slug: "joplin",
  name: "Joplin",
  category: "Notes and writing",
  platforms: [...platforms],
  intro:
    "Joplin's terminal client uses short commands, navigation keys, and typed key sequences to work with notes, todos, notebooks, and the built-in console.",
  versionContext:
    "Default Joplin Terminal keymap from the current official terminal-app guide, checked September 1, 2026. The terminal client is available on macOS, Linux, and Windows through WSL; its keymap uses sequential keys rather than simultaneous modifier chords.",
  sourceUrl: "https://joplinapp.org/help/apps/terminal/",
  sourceLabel: "official Joplin Terminal keymap",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation",
      title: "Navigation and selection",
      intro:
        "Move through the terminal interface with single keys. Delete and Backspace are both documented for deleting the focused item.",
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
        { id: "next-link", action: "Focus the next link", keys: combo(platforms, ["N"]) },
        { id: "previous-link", action: "Focus the previous link", keys: combo(platforms, ["B"]) },
        { id: "open-link", action: "Open the focused link", keys: combo(platforms, ["O"]) },
      ],
    },
    {
      id: "commands-and-search",
      title: "Commands and search",
      intro:
        "Type the documented command sequences one key at a time. The command-line mode lets you pass the focused note or notebook as `$n`.",
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
