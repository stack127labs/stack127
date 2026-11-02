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
    "Zendesk Agent Workspace. Some keys work only in an open ticket or the editor.",
  sourceUrl: "https://static.zdassets.com/agent/assets/keyboard-shortcut-cheatsheet-9bad3e7d4d6f5c2affb9d23e2f23ce22.pdf",
  sourceLabel: "official Zendesk Agent Workspace shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "navigation",
      title: "Agent Workspace navigation",
      intro: "Move between Zendesk areas, ticket tabs, and the controls in the active ticket.",
      shortcuts: [
        { id: "home", action: "Open Home", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "H"] }) },
        { id: "views", action: "Open Views", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "V"] }) },
        { id: "current-ticket", action: "Focus the current ticket", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "T"] }) },
        { id: "requester", action: "Focus the requester", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "R"] }) },
        { id: "search", action: "Open search", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "F"] }) },
        { id: "advanced-search", action: "Open advanced search", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "/"] }) },
        { id: "new-ticket", action: "Create a new ticket", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "N"] }) },
        { id: "next-tab", action: "Move to the next ticket tab", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Tab"] }) },
        { id: "previous-tab", action: "Move to the previous ticket tab", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Shift", "Tab"] }) },
        { id: "move-up", action: "Move up in a list", keys: perPlatform(platforms, { windows: ["Up Arrow"] }) },
        { id: "move-down", action: "Move down in a list", keys: perPlatform(platforms, { windows: ["Down Arrow"] }) },
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
        { id: "reply", action: "Open the public reply editor", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "C"] }) },
        { id: "internal-note", action: "Open the internal note editor", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "X"] }) },
        { id: "macro", action: "Open the macro menu", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "M"] }) },
        { id: "apps", action: "Open apps", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "A"] }) },
        { id: "update-status", action: "Open the ticket status menu", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "U"] }) },
        { id: "status-open", action: "Set status to Open", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "O"] }) },
        { id: "status-pending", action: "Set status to Pending", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "P"] }) },
        { id: "status-hold", action: "Set status to On-hold", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "D"] }) },
        { id: "status-solved", action: "Set status to Solved", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "S"] }) },
        { id: "close-tab", action: "Close the current ticket tab", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "W"] }) },
        { id: "next-ticket", action: "Open the next ticket", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "Down Arrow"], alternatives: [["Ctrl", "Alt", "J"]] }] },
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
        dual("code-block", "Format a code block", ["Ctrl", "Shift", "6"], ["Cmd", "Shift", "6"]),
        dual("numbered-list", "Toggle a numbered list", ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]),
        dual("bulleted-list", "Toggle a bulleted list", ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]),
        dual("quote", "Format a quote", ["Ctrl", "Shift", "9"], ["Cmd", "Shift", "9"]),
      ],
    },
  ],
};

export default zendesk;
