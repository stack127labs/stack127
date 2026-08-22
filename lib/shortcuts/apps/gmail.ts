import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const gmail: AppShortcuts = {
  slug: "gmail",
  name: "Gmail",
  category: "Email",
  platforms: [...platforms],
  intro:
    "Gmail becomes much faster once a conversation stays selected. Use the single-key triage actions first, then move through views, open a reply, and read a thread without reaching for the toolbar.",
  versionContext:
    "Documented defaults from Google's Gmail Help in August 2026. Keyboard shortcuts must be turned on first in Gmail Settings, General, Keyboard shortcuts.",
  sourceUrl: "https://support.google.com/mail/answer/6594",
  sourceLabel: "official Gmail keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "inbox-triage",
      title: "Inbox triage",
      intro:
        "Single keys act on the selected or checked conversation. Turn shortcuts on in Gmail settings before using any of these.",
      shortcuts: [
        { id: "archive", action: "Archive the conversation", keys: combo(platforms, ["e"]) },
        { id: "delete", action: "Send to Trash", keys: combo(platforms, ["#"]) },
        { id: "mark-read", action: "Mark as read", keys: combo(platforms, ["Shift", "I"]) },
        { id: "mark-unread", action: "Mark as unread", keys: combo(platforms, ["Shift", "U"]) },
        { id: "star", action: "Star or unstar", keys: combo(platforms, ["s"]) },
        {
          id: "select-conversation",
          action: "Check or uncheck the selected conversation",
          keys: combo(platforms, ["x"]),
        },
        {
          id: "report-spam",
          action: "Report as spam",
          keys: combo(platforms, ["!"]),
        },
        { id: "mute", action: "Mute the conversation", keys: combo(platforms, ["m"]) },
        { id: "undo", action: "Undo the last action", keys: combo(platforms, ["z"]) },
        { id: "mark-important", action: "Mark as important", keys: combo(platforms, ["+"]) },
        { id: "not-important", action: "Mark as not important", keys: combo(platforms, ["-"]) },
        { id: "snooze", action: "Snooze the conversation", keys: combo(platforms, ["b"]) },
        { id: "add-to-tasks", action: "Add the conversation to Tasks", keys: combo(platforms, ["Shift", "T"]) },
      ],
    },
    {
      id: "compose-and-reply",
      title: "Compose and reply",
      intro: "Start a message, reply or forward a thread, and send it without leaving the conversation.",
      shortcuts: [
        { id: "compose", action: "Compose a new message", keys: combo(platforms, ["c"]) },
        { id: "reply", action: "Reply to the sender", keys: combo(platforms, ["r"]) },
        { id: "reply-all", action: "Reply to everyone", keys: combo(platforms, ["a"]) },
        { id: "forward", action: "Forward", keys: combo(platforms, ["f"]) },
        { id: "reply-new-window", action: "Reply in a new window", keys: combo(platforms, ["Shift", "r"]) },
        { id: "forward-new-window", action: "Forward in a new window", keys: combo(platforms, ["Shift", "f"]) },
        { id: "cc", action: "Add Cc recipients", keys: combo(platforms, ["Ctrl", "Shift", "c"], ["Cmd", "Shift", "c"]) },
        { id: "bcc", action: "Add Bcc recipients", keys: combo(platforms, ["Ctrl", "Shift", "b"], ["Cmd", "Shift", "b"]) },
        { id: "insert-link", action: "Insert a link", keys: combo(platforms, ["Ctrl", "k"], ["Cmd", "k"]) },
        { id: "send", action: "Send the message", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        {
          id: "discard-draft",
          action: "Discard the draft",
          keys: combo(platforms, ["Shift", "Esc"]),
        },
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "The g sequences jump straight to a view; type g then the letter.",
      shortcuts: [
        { id: "go-inbox", action: "Go to Inbox", keys: combo(platforms, ["g", "i"]) },
        { id: "go-starred", action: "Go to Starred conversations", keys: combo(platforms, ["g", "s"]) },
        { id: "go-sent", action: "Go to Sent messages", keys: combo(platforms, ["g", "t"]) },
        { id: "go-drafts", action: "Go to Drafts", keys: combo(platforms, ["g", "d"]) },
        { id: "go-all-mail", action: "Go to All Mail", keys: combo(platforms, ["g", "a"]) },
        { id: "go-tasks", action: "Go to Tasks", keys: combo(platforms, ["g", "k"]) },
        { id: "go-labels", action: "Go to Labels", keys: combo(platforms, ["g", "l"]) },
        { id: "search", action: "Focus the search box", keys: combo(platforms, ["/"]) },
        {
          id: "open-older",
          action: "Open the older page of results",
          keys: combo(platforms, ["g", "n"]),
          note: "g then p opens the newer page.",
        },
      ],
    },
    {
      id: "reading",
      title: "Reading a thread",
      intro: "Open, expand, move through, and archive messages while reading a conversation.",
      shortcuts: [
        {
          id: "newer-message",
          action: "Newer message in the thread",
          keys: combo(platforms, ["k"]),
          note: "j moves to the older message.",
        },
        { id: "escape-from-input", action: "Move focus out of the input field", keys: combo(platforms, ["Esc"]) },
        { id: "open-conversation", action: "Open the selected conversation", keys: combo(platforms, ["o"]) },
        { id: "back-to-list", action: "Return to the thread list", keys: combo(platforms, ["u"]) },
        { id: "newer-conversation", action: "Move to a newer conversation", keys: combo(platforms, ["k"]) },
        { id: "older-conversation", action: "Move to an older conversation", keys: combo(platforms, ["j"]) },
        { id: "previous-message", action: "Previous message in the thread", keys: combo(platforms, ["p"]) },
        { id: "next-message", action: "Next message in the thread", keys: combo(platforms, ["n"]) },
        { id: "expand-thread", action: "Expand the whole thread", keys: combo(platforms, [":"]) },
        {
          id: "collapse-thread",
          action: "Collapse or expand the whole thread",
          keys: combo(platforms, [";"]),
        },
      ],
    },
    {
      id: "formatting",
      title: "Formatting",
      intro: "Format a message in place with the same text controls Gmail exposes in the compose window.",
      shortcuts: [
        { id: "bold", action: "Bold", keys: combo(platforms, ["Ctrl", "b"], ["Cmd", "b"]) },
        { id: "italic", action: "Italic", keys: combo(platforms, ["Ctrl", "i"], ["Cmd", "i"]) },
        { id: "underline", action: "Underline", keys: combo(platforms, ["Ctrl", "u"], ["Cmd", "u"]) },
        { id: "numbered-list", action: "Numbered list", keys: combo(platforms, ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]) },
        { id: "bulleted-list", action: "Bulleted list", keys: combo(platforms, ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]) },
        { id: "quote", action: "Quote", keys: combo(platforms, ["Ctrl", "Shift", "9"], ["Cmd", "Shift", "9"]) },
        { id: "remove-formatting", action: "Remove formatting", keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]) },
      ],
    },
    {
      id: "selection-and-menus",
      title: "Selection and menus",
      intro: "Select conversations in a list and open the menus that replace the toolbar for a keyboard-first workflow.",
      shortcuts: [
        { id: "select-all-conversations", action: "Select all conversations", keys: combo(platforms, ["*", "a"]) },
        { id: "deselect-all", action: "Deselect all conversations", keys: combo(platforms, ["*", "n"]) },
        { id: "select-read", action: "Select read conversations", keys: combo(platforms, ["*", "r"]) },
        { id: "select-unread", action: "Select unread conversations", keys: combo(platforms, ["*", "u"]) },
        { id: "toolbar", action: "Move focus to the toolbar", keys: combo(platforms, [","]) },
        { id: "more-actions", action: "Open the More actions menu", keys: combo(platforms, ["."]) },
        { id: "move-to", action: "Open the Move to menu", keys: combo(platforms, ["v"]) },
        { id: "label-as", action: "Open the Label as menu", keys: combo(platforms, ["l"]) },
        { id: "shortcut-help", action: "Open keyboard shortcut help", keys: combo(platforms, ["?"]) },
      ],
    },
  ],
};
