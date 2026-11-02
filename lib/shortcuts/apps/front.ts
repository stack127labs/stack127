import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const paired = (
  windows: string[],
  macos: string[],
  windowsAlternatives: string[][] = [],
  macosAlternatives: string[][] = [],
) => [
  { platform: "windows" as const, keys: windows, ...(windowsAlternatives.length ? { alternatives: windowsAlternatives } : {}) },
  { platform: "macos" as const, keys: macos, ...(macosAlternatives.length ? { alternatives: macosAlternatives } : {}) },
];

const front: AppShortcuts = {
  slug: "front",
  name: "Front",
  category: "Shared inbox",
  platforms: [...platforms],
  versionContext:
    "Front's own shortcut set, one of four you can pick. Windows uses Ctrl for Cmd and Alt for Option, and the desktop app turns off single-key alternatives by default.",
  sourceUrl: "https://help.front.com/en/articles/2189",
  sourceLabel: "official Front keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "conversation-navigation",
      title: "Conversation navigation",
      intro: "Select conversations, move through the inbox, and open search or navigation tools without leaving the keyboard.",
      shortcuts: [
        { id: "previous-conversation", action: "Move to the previous conversation", keys: combo(platforms, ["Up"]) },
        { id: "next-conversation", action: "Move to the next conversation", keys: combo(platforms, ["Down"]) },
        {
          id: "select-multiple-down",
          action: "Extend selection downward",
          keys: combo(platforms, ["Shift", "Down"]),
        },
        {
          id: "select-multiple-up",
          action: "Extend selection upward",
          keys: combo(platforms, ["Shift", "Up"]),
        },
        {
          id: "open-by-link",
          action: "Open a conversation by link or ID",
          keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]),
        },
        {
          id: "search",
          action: "Search Front",
          keys: paired(["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"], [["Shift", "F"]], [["Shift", "F"]]),
        },
        { id: "back", action: "Go back", keys: combo(platforms, ["Ctrl", "["] , ["Cmd", "["]) },
        { id: "forward-history", action: "Go forward", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "quick-switcher", action: "Open the quick switcher", keys: paired(["Ctrl", "K"], ["Cmd", "K"], [["Ctrl", "Shift", "P"], ["Ctrl", "Alt", "Shift", "P"]], [["Cmd", "Shift", "P"], ["Cmd", "Option", "Shift", "P"]]) },
        { id: "nav-inbox", action: "Open Inbox", keys: paired(["Ctrl", "1"], ["Cmd", "1"], [["Alt", "1"]], [["Ctrl", "1"]]) },
        { id: "nav-calendar", action: "Open Calendar", keys: paired(["Ctrl", "2"], ["Cmd", "2"], [["Alt", "2"]], [["Ctrl", "2"]]) },
        { id: "nav-contacts", action: "Open Contacts", keys: paired(["Ctrl", "3"], ["Cmd", "3"], [["Alt", "3"]], [["Ctrl", "3"]]) },
        { id: "nav-analytics", action: "Open Analytics", keys: paired(["Ctrl", "4"], ["Cmd", "4"], [["Alt", "4"]], [["Ctrl", "4"]]) },
        { id: "nav-help-center", action: "Open Help Center", keys: paired(["Ctrl", "5"], ["Cmd", "5"], [["Alt", "5"]], [["Ctrl", "5"]]) },
        { id: "nav-sequences", action: "Open Sequences", keys: paired(["Ctrl", "6"], ["Cmd", "6"], [["Alt", "6"]], [["Ctrl", "6"]]) },
      ],
    },
    {
      id: "replies-and-sending",
      title: "Replies and sending",
      intro: "Start a reply, choose how it sends, and apply common composer formatting while writing to a customer.",
      shortcuts: [
        { id: "reply", action: "Reply to the latest message", keys: combo(platforms, ["R"]) },
        {
          id: "reply-new-window",
          action: "Reply in a new window",
          keys: paired(["Alt", "R"], ["Option", "R"], [["Ctrl", "Alt", "R"]], [["Cmd", "Option", "R"]]),
        },
        { id: "reply-all", action: "Reply all", keys: combo(platforms, ["Shift", "R"]) },
        { id: "forward", action: "Forward the message", keys: paired(["Ctrl", "J"], ["Cmd", "J"], [["J"]], [["J"]]) },
        { id: "send-archive", action: "Send and archive", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        {
          id: "send-without-archive",
          action: "Send without archiving",
          keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]),
        },
        { id: "bold", action: "Bold selected text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italicize selected text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline selected text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "link", action: "Insert a link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "cc", action: "Add Cc recipients", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
        { id: "bcc", action: "Add Bcc recipients", keys: combo(platforms, ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]) },
        { id: "templates", action: "Open message templates", keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]) },
        { id: "comment-mode", action: "Open the comment bar", keys: combo(platforms, ["Ctrl", "."], ["Cmd", "."]) },
        { id: "mention", action: "Mention a teammate", keys: combo(platforms, ["@"]) },
      ],
    },
    {
      id: "conversation-actions",
      title: "Conversation actions",
      intro: "Archive, assign, tag, snooze, and otherwise manage the selected conversation from the inbox.",
      shortcuts: [
        { id: "archive", action: "Archive or unarchive", keys: paired(["Ctrl", "E"], ["Cmd", "E"], [["E"]], [["E"]]) },
        { id: "tag", action: "Add or remove a tag", keys: paired(["Ctrl", "T"], ["Cmd", "T"], [["T"]], [["T"]]) },
        { id: "assign-self", action: "Assign to yourself", keys: paired(["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"], [["Shift", "A"]], [["Shift", "A"]]) },
        { id: "assign-teammate", action: "Assign to a teammate", keys: paired(["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"], [["Shift", "G"]], [["Shift", "G"]]) },
        { id: "move", action: "Move the conversation", keys: paired(["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"], [["Shift", "M"]], [["Shift", "M"]]) },
        { id: "trash", action: "Move to trash", keys: combo(platforms, ["Delete"]) },
        { id: "spam", action: "Mark as spam", keys: paired(["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"], [["Shift", "J"]], [["Shift", "J"]]) },
        { id: "snooze", action: "Snooze the conversation", keys: paired(["Ctrl", "S"], ["Cmd", "S"], [["S"]], [["S"]]) },
        { id: "subscribe", action: "Subscribe or unsubscribe", keys: paired(["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"], [["Shift", "U"]], [["Shift", "U"]]) },
        { id: "conversation-info", action: "Show conversation information", keys: paired(["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"], [["Shift", "I"]], [["Shift", "I"]]) },
        { id: "star", action: "Star the conversation", keys: combo(platforms, ["Alt", "S"], ["Option", "S"]) },
        { id: "expand-messages", action: "Expand messages", keys: combo(platforms, [";"]) },
        { id: "collapse-messages", action: "Collapse messages", keys: combo(platforms, ["Shift", ";"]) },
      ],
    },
  ],
};

export default front;
