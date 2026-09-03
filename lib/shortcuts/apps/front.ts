import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const front: AppShortcuts = {
  slug: "front",
  name: "Front",
  category: "Shared inbox",
  platforms: [...platforms],
  intro:
    "Front shortcuts keep conversations moving through selection, reply, assignment, tagging, and archive actions. The reference below uses Front's own shortcut set, including the commands that are useful while a conversation or composer has focus.",
  versionContext:
    "Front publishes four selectable shortcut sets. This record uses the Front set. Personal preferences, the browser versus desktop app, and single-key settings can change what is active. Windows uses Control where the Mac reference uses Command, and Alt where it uses Option.",
  sourceUrl: "https://help.front.com/en/articles/2189",
  sourceLabel: "official Front keyboard shortcuts",
  lastVerified: "2026-09-01",
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
          note: "The source labels this command Command+O on Mac and Control+O on Windows.",
        },
        {
          id: "search",
          action: "Search Front",
          keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
          note: "Shift+F is also listed by Front for this action in the Front set.",
        },
        { id: "back", action: "Go back", keys: combo(platforms, ["Ctrl", "["] , ["Cmd", "["]) },
        { id: "forward-history", action: "Go forward", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "quick-switcher", action: "Open the quick switcher", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "nav-inbox", action: "Open Inbox", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]) },
        { id: "nav-calendar", action: "Open Calendar", keys: combo(platforms, ["Ctrl", "2"], ["Cmd", "2"]) },
        { id: "nav-contacts", action: "Open Contacts", keys: combo(platforms, ["Ctrl", "3"], ["Cmd", "3"]) },
        { id: "nav-analytics", action: "Open Analytics", keys: combo(platforms, ["Ctrl", "4"], ["Cmd", "4"]) },
        { id: "nav-help-center", action: "Open Help Center", keys: combo(platforms, ["Ctrl", "5"], ["Cmd", "5"]) },
        { id: "nav-sequences", action: "Open Sequences", keys: combo(platforms, ["Ctrl", "6"], ["Cmd", "6"]) },
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
          keys: combo(platforms, ["Alt", "R"], ["Option", "R"]),
          note: "The Mac set also lists Command+Option+R and the Windows set Control+Alt+R.",
        },
        { id: "reply-all", action: "Reply all", keys: combo(platforms, ["Shift", "R"]) },
        { id: "forward", action: "Forward the message", keys: combo(platforms, ["Ctrl", "J"], ["Cmd", "J"]) },
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
        { id: "archive", action: "Archive or unarchive", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "tag", action: "Add or remove a tag", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "assign-self", action: "Assign to yourself", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "assign-teammate", action: "Assign to a teammate", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
        { id: "move", action: "Move the conversation", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "trash", action: "Move to trash", keys: combo(platforms, ["Delete"]) },
        { id: "spam", action: "Mark as spam", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
        { id: "snooze", action: "Snooze the conversation", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "subscribe", action: "Subscribe or unsubscribe", keys: combo(platforms, ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]) },
        { id: "conversation-info", action: "Show conversation information", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"]) },
        { id: "star", action: "Star the conversation", keys: combo(platforms, ["Alt", "S"], ["Option", "S"]) },
        { id: "expand-messages", action: "Expand messages", keys: combo(platforms, [";"]) },
        { id: "collapse-messages", action: "Collapse messages", keys: combo(platforms, ["Shift", ";"]) },
      ],
    },
  ],
};

export default front;
