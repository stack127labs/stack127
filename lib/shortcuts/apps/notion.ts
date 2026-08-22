import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const notion: AppShortcuts = {
  slug: "notion",
  name: "Notion",
  category: "Notes and docs",
  platforms: [...platforms],
  intro:
    "Notion's fastest path is usually a block action, not a toolbar action. These shortcuts cover block creation, typed markdown-style input, editing, page movement, and search.",
  versionContext:
    "Documented defaults from the Notion Help Center in August 2026. macOS uses Cmd where Windows and Linux use Ctrl.",
  sourceUrl: "https://www.notion.com/help/keyboard-shortcuts",
  sourceLabel: "official Notion keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "blocks",
      title: "Blocks",
      intro: "Create, transform, move, and duplicate blocks while building a page.",
      shortcuts: [
        {
          id: "new-block",
          action: "Create a new block",
          keys: combo(platforms, ["Enter"]),
        },
        {
          id: "duplicate-block",
          action: "Duplicate the current block",
          keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]),
        },
        {
          id: "move-block-up",
          action: "Move the block up",
          keys: combo(platforms, ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]),
          note: "Ctrl+Shift+Down (Cmd+Shift+Down) moves it down.",
        },
        {
          id: "select-multiple-blocks",
          action: "Select multiple blocks with shift and click",
          keys: [],
          note: "Hold Shift while clicking the first and last block of the range.",
        },
        { id: "new-page", action: "Create a new page", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "new-window", action: "Open a new Notion window", keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]) },
        { id: "new-tab", action: "Create a new Notion tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
      ],
    },
    {
      id: "markdown-style",
      title: "Text styling",
      intro: "Typed prefixes convert a line when you press Space afterwards.",
      shortcuts: [
        { id: "bold", action: "Bold", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italic", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        {
          id: "strikethrough",
          action: "Strikethrough",
          keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        },
        { id: "inline-code", action: "Inline code", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "bullet-list", action: "Bullet list", keys: combo(platforms, ["-"]), note: "Then Space." },
        { id: "todo", action: "To-do checkbox", keys: combo(platforms, ["[", "]"]), note: "Then Space." },
        { id: "heading1", action: "Heading 1", keys: combo(platforms, ["#"]), note: "Then Space. ## and ### give smaller headings." },
        { id: "numbered-list", action: "Numbered list", keys: combo(platforms, ["1", "."]), note: "Then Space." },
        { id: "quote", action: "Quote block", keys: combo(platforms, ["\""]), note: "Then Space." },
        { id: "toggle-list", action: "Toggle list", keys: combo(platforms, [">"]), note: "Then Space." },
        { id: "divider", action: "Divider", keys: combo(platforms, ["-", "-", "-"]) },
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Undo, redo, select, comment, and change text or blocks inside the current page.",
      shortcuts: [
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
        {
          id: "comment",
          action: "Comment on the selection",
          keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Option", "M"]),
        },
        {
          id: "link-selection",
          action: "Add a link to the selected text",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
        },
        { id: "select-all", action: "Select all text or blocks", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "shift-enter", action: "Insert a line break within a block", keys: combo(platforms, ["Shift", "Enter"]) },
        { id: "delete-block", action: "Delete the current block", keys: combo(platforms, ["Shift", "Backspace"]) },
      ],
    },
    {
      id: "navigation-and-search",
      title: "Navigation and search",
      intro: "Move around a page, open quick find, search the workspace, and jump to recent pages.",
      shortcuts: [
        {
          id: "search",
          action: "Open search",
          keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]),
        },
        {
          id: "recent-pages",
          action: "Show recently visited pages",
          keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]),
          note: "Ctrl+] (Cmd+]) moves forward through history.",
        },
        {
          id: "sidebar-toggle",
          action: "Toggle the sidebar",
          keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]),
        },
        { id: "search-page", action: "Search inside a page", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "copy-url", action: "Copy the current page URL", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "back-page", action: "Go back a page", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
        { id: "forward-page", action: "Go forward a page", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "toggle-theme", action: "Toggle dark and light mode", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
      ],
    },
  ],
};
