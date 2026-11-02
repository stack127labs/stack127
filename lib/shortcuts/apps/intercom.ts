import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const intercom: AppShortcuts = {
  slug: "intercom",
  name: "Intercom",
  category: "Customer support",
  platforms: [...platforms],
  versionContext:
    "Same keys on Mac and Windows, with Command or Control. Direct keys work outside the composer in Chrome or Edge, on QWERTY, AZERTY, and some other keyboard layouts.",
  sourceUrl: "https://www.intercom.com/help/en/articles/6272267-how-to-use-command-k-with-intercom-inbox",
  sourceLabel: "official Intercom Inbox keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "conversation-actions",
      title: "Conversation actions",
      intro: "Open the Inbox menus, assign or snooze a conversation, and change its state without reaching for the action bar.",
      shortcuts: [
        { id: "command-k", action: "Open the Command-K menu", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "left-menu", action: "Show or hide the left menu", keys: combo(platforms, ["["]) },
        { id: "right-menu", action: "Show or hide the right menu", keys: combo(platforms, ["]"]) },
        { id: "toggle-events", action: "Show or hide conversation events", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "close", action: "Close the conversation", keys: combo(platforms, ["Ctrl", "Shift", "Y"], ["Cmd", "Shift", "Y"]) },
        { id: "reopen", action: "Reopen the conversation", keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]) },
        { id: "snooze", action: "Snooze the conversation", keys: combo(platforms, ["Z"]) },
        { id: "priority", action: "Change the conversation's priority", keys: combo(platforms, ["P"]) },
        { id: "assign", action: "Assign the conversation", keys: combo(platforms, ["A"]) },
        { id: "new-conversation", action: "Start a new conversation", keys: combo(platforms, ["C"]) },
        { id: "tag-latest", action: "Tag the latest message", keys: combo(platforms, ["Shift", "T"]) },
      ],
    },
    {
      id: "inbox-navigation",
      title: "Inbox navigation",
      intro: "Switch inboxes, move between conversations, change layout, and select several conversations at once.",
      shortcuts: [
        { id: "switch-inbox", action: "Switch to another inbox", keys: combo(platforms, ["G"]) },
        { id: "previous-conversation", action: "Open the previous conversation", keys: combo(platforms, ["J"]) },
        { id: "next-conversation", action: "Open the next conversation", keys: combo(platforms, ["K"]) },
        { id: "layout", action: "Change the Inbox layout", keys: combo(platforms, ["L"]) },
        { id: "top", action: "Jump to the top of the page", keys: combo(platforms, ["Ctrl", "Up"], ["Cmd", "Up"]) },
        { id: "bottom", action: "Jump to the bottom of the page", keys: combo(platforms, ["Ctrl", "Down"], ["Cmd", "Down"]) },
        { id: "bulk-select", action: "Start bulk selection", keys: combo(platforms, ["X"]) },
        { id: "previous-page", action: "Move the page up", keys: combo(platforms, ["Up"]) },
        { id: "next-page", action: "Move the page down", keys: combo(platforms, ["Down"]) },
      ],
    },
    {
      id: "composer",
      title: "Composer",
      intro: "Switch between reply and note, send a response, and insert common content in the conversation composer.",
      shortcuts: [
        { id: "reply", action: "Switch to reply", keys: combo(platforms, ["R"]) },
        { id: "note", action: "Switch to note", keys: combo(platforms, ["N"]) },
        { id: "send", action: "Send the response", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "send-close", action: "Send and close the conversation", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]) },
        { id: "send-snooze", action: "Send and snooze the conversation", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Enter"], macos: ["Cmd", "Option", "Enter"] }) },
        { id: "gif", action: "Insert a GIF", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
        { id: "image", action: "Insert an image", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"]) },
        { id: "article", action: "Insert an article", keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]) },
        { id: "attachment", action: "Attach a file", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "emoji", action: "Open the emoji picker", keys: combo(platforms, [":"]) },
        { id: "macro", action: "Open macros", keys: combo(platforms, ["\\"]) },
        { id: "cross-post", action: "Cross-post a note to a ticket", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]), note: "Uses the same keys as send and close when a ticket cross-post is available." },
      ],
    },
  ],
};

export default intercom;
