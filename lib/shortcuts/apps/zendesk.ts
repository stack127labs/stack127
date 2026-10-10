import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

export const zendesk: AppShortcuts = {
  slug: "zendesk",
  name: "Zendesk",
  category: "Customer support",
  platforms: [...platforms],
  versionContext:
    "Zendesk Agent Workspace keyboard shortcut cheat sheet and dashboard shortcut article checked September 1, 2026. The cheat sheet uses Ctrl or Cmd notation, and some commands depend on the active ticket or editor.",
  sourceUrl: "https://static.zdassets.com/agent/assets/keyboard-shortcut-cheatsheet-9bad3e7d4d6f5c2affb9d23e2f23ce22.pdf",
  sourceLabel: "official Zendesk Agent Workspace shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation",
      title: "Agent Workspace navigation",
      intro: "Move between Zendesk areas, ticket tabs, and the controls in the active ticket.",
      shortcuts: [
        dual("home", "Open Home", ["Ctrl", "Alt", "H"], ["Cmd", "Option", "H"]),
        dual("views", "Open Views", ["Ctrl", "Alt", "V"], ["Cmd", "Option", "V"]),
        dual("current-ticket", "Focus the current ticket", ["Ctrl", "Alt", "T"], ["Cmd", "Option", "T"]),
        dual("requester", "Focus the requester", ["Ctrl", "Alt", "R"], ["Cmd", "Option", "R"]),
        dual("search", "Open search", ["Ctrl", "Alt", "F"], ["Cmd", "Option", "F"]),
        dual("advanced-search", "Open advanced search", ["Ctrl", "Alt", "/"], ["Cmd", "Option", "/"]),
        dual("new-ticket", "Create a new ticket", ["Ctrl", "Alt", "N"], ["Cmd", "Option", "N"]),
        dual("next-tab", "Move to the next ticket tab", ["Ctrl", "Alt", "Tab"], ["Cmd", "Option", "Tab"]),
        dual("previous-tab", "Move to the previous ticket tab", ["Ctrl", "Alt", "Shift", "Tab"], ["Cmd", "Option", "Shift", "Tab"]),
        dual("move-up", "Move up in a list", ["Shift", "Up Arrow"], ["Shift", "Up Arrow"]),
        dual("move-down", "Move down in a list", ["Shift", "Down Arrow"], ["Shift", "Down Arrow"]),
        dual("drill", "Open the focused item", ["Enter"], ["Enter"]),
        dual("select", "Select the focused item", ["Space"], ["Space"]),
        dual("preview", "Preview the focused item", ["X"], ["X"]),
      ],
    },
    {
      id: "tickets",
      title: "Tickets",
      intro: "Open the reply editor, apply a macro, change ticket status, and move through tickets.",
      shortcuts: [
        dual("reply", "Open the public reply editor", ["Ctrl", "Alt", "C"], ["Cmd", "Option", "C"]),
        dual("internal-note", "Open the internal note editor", ["Ctrl", "Alt", "X"], ["Cmd", "Option", "X"]),
        dual("macro", "Open the macro menu", ["Ctrl", "Alt", "M"], ["Cmd", "Option", "M"]),
        dual("apps", "Open apps", ["Ctrl", "Alt", "A"], ["Cmd", "Option", "A"]),
        dual("update-status", "Open the ticket status menu", ["Ctrl", "Alt", "U"], ["Cmd", "Option", "U"]),
        dual("status-open", "Set status to Open", ["Ctrl", "Alt", "O"], ["Cmd", "Option", "O"]),
        dual("status-pending", "Set status to Pending", ["Ctrl", "Alt", "P"], ["Cmd", "Option", "P"]),
        dual("status-hold", "Set status to On-hold", ["Ctrl", "Alt", "D"], ["Cmd", "Option", "D"]),
        dual("status-solved", "Set status to Solved", ["Ctrl", "Alt", "S"], ["Cmd", "Option", "S"]),
        dual("close-tab", "Close the current ticket tab", ["Ctrl", "Alt", "W"], ["Cmd", "Option", "W"]),
        dual("next-ticket", "Open the next ticket", ["Ctrl", "Alt", "Down Arrow"], ["Cmd", "Option", "Down Arrow"]),
      ],
    },
    {
      id: "composer",
      title: "Composer",
      intro: "Format a reply or note with the Agent Workspace composer shortcuts.",
      shortcuts: [
        dual("inline-image", "Insert an inline image", ["Ctrl", "M"], ["Cmd", "M"]),
        dual("link", "Insert a link", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("indent-left", "Decrease indentation", ["Ctrl", "["], ["Cmd", "["]),
        dual("indent-right", "Increase indentation", ["Ctrl", "]"], ["Cmd", "]"]),
        dual("bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italicize text", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("code", "Format inline code", ["Ctrl", "Shift", "5"], ["Cmd", "Shift", "5"]),
        dual("code-block", "Format a code block", ["Shift", "6"], ["Shift", "6"]),
        dual("numbered-list", "Toggle a numbered list", ["Shift", "7"], ["Shift", "7"]),
        dual("bulleted-list", "Toggle a bulleted list", ["Shift", "8"], ["Shift", "8"]),
        dual("quote", "Format a quote", ["Shift", "9"], ["Shift", "9"]),
      ],
    },
  ],
};

export default zendesk;
