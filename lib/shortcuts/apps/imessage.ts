import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["macos"] as const;

const imessage: AppShortcuts = {
  slug: "imessage",
  name: "Messages",
  category: "Messaging",
  platforms: [...platforms],
  versionContext:
    "The official Apple User Guide publishes the Messages shortcuts for macOS. The app name shown to Mac users is Messages, while this Stack127 record keeps the requested iMessage slug. iPhone and iPad gestures are outside scope.",
  sourceUrl: "https://support.apple.com/guide/messages/keyboard-shortcuts-ichtc78b3bff/mac",
  sourceLabel: "official Apple Messages keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "app-and-conversations",
      title: "App and conversations",
      intro: "Create messages, search conversations, switch filters, and change the Messages window from the keyboard.",
      shortcuts: [
        { id: "settings", action: "Open Messages settings", keys: combo(platforms, ["Cmd", ","]) },
        { id: "new-message", action: "Start a new message", keys: combo(platforms, ["Cmd", "N"]) },
        { id: "close-window", action: "Close the Messages window", keys: combo(platforms, ["Cmd", "W"]) },
        { id: "minimize", action: "Minimize the window", keys: combo(platforms, ["Cmd", "M"]) },
        { id: "fullscreen", action: "Toggle fullscreen", keys: combo(platforms, ["Ctrl", "Cmd", "F"]) },
        { id: "search", action: "Search conversations", keys: combo(platforms, ["Cmd", "F"]) },
        { id: "all-messages", action: "Show all messages", keys: combo(platforms, ["Ctrl", "Cmd", "1"]) },
        { id: "known-senders", action: "Show messages from known senders", keys: combo(platforms, ["Ctrl", "Cmd", "2"]) },
        { id: "unknown-senders", action: "Show messages from unknown senders", keys: combo(platforms, ["Ctrl", "Cmd", "3"]) },
        { id: "unread", action: "Show unread messages", keys: combo(platforms, ["Ctrl", "Cmd", "4"]) },
        { id: "recently-deleted", action: "Show recently deleted messages", keys: combo(platforms, ["Ctrl", "Cmd", "5"]) },
        { id: "pinned-conversation", action: "Open a pinned conversation by number", keys: combo(platforms, ["Cmd", "number"]) },
        { id: "first-unpinned", action: "Open the first unpinned conversation", keys: combo(platforms, ["Option", "Cmd", "1"]) },
      ],
    },
    {
      id: "message-composing",
      title: "Message composing",
      intro: "Send, edit, format, and add a Tapback while the conversation composer has focus.",
      shortcuts: [
        { id: "send", action: "Send the message", keys: combo(platforms, ["Return"]) },
        { id: "line-break", action: "Insert a line break", keys: combo(platforms, ["Option", "Return"]) },
        { id: "edit-sent", action: "Edit a sent message", keys: combo(platforms, ["Cmd", "E"]) },
        { id: "copy", action: "Copy selected text", keys: combo(platforms, ["Cmd", "C"]) },
        { id: "paste", action: "Paste text", keys: combo(platforms, ["Cmd", "V"]) },
        { id: "text-larger", action: "Make message text larger", keys: combo(platforms, ["Cmd", "+"]) },
        { id: "text-smaller", action: "Make message text smaller", keys: combo(platforms, ["Cmd", "-"]) },
        { id: "reply", action: "Reply to the selected message", keys: combo(platforms, ["Cmd", "R"]) },
        { id: "tapback-menu", action: "Open the Tapback menu", keys: combo(platforms, ["Cmd", "T", "then", "number"]) },
        { id: "emoji", action: "Open the emoji and symbols window", keys: combo(platforms, ["Ctrl", "Cmd", "Space"]) },
        { id: "delete", action: "Delete the selected message", keys: combo(platforms, ["Delete"]) },
        { id: "spelling", action: "Open the spelling window", keys: combo(platforms, ["Shift", "Cmd", ":"]) },
        { id: "check-spelling", action: "Check spelling", keys: combo(platforms, ["Cmd", ";"]) },
      ],
    },
    {
      id: "conversation-details",
      title: "Conversation details",
      intro: "Move between conversations, mark read state, and open contact, participant, and conversation details.",
      shortcuts: [
        { id: "next-conversation", action: "Select the next conversation", keys: combo(platforms, ["Ctrl", "Tab"]) },
        { id: "previous-conversation", action: "Select the previous conversation", keys: combo(platforms, ["Ctrl", "Shift", "Tab"]) },
        { id: "conversation-info", action: "Show conversation details", keys: combo(platforms, ["Option", "Cmd", "I"]) },
        { id: "mute", action: "Turn conversation alerts on or off", keys: combo(platforms, ["Option", "Cmd", "M"]) },
        { id: "mark-read", action: "Mark the conversation read or unread", keys: combo(platforms, ["Shift", "Cmd", "U"]) },
        { id: "contact-card", action: "Open the contact card", keys: combo(platforms, ["Option", "Cmd", "B"]) },
        { id: "email-contact", action: "Email the contact", keys: combo(platforms, ["Option", "Cmd", "E"]) },
        { id: "video-effects", action: "Open video effects", keys: combo(platforms, ["Shift", "Cmd", "E"]) },
        { id: "quick-look", action: "Quick Look at an attachment", keys: combo(platforms, ["Space"]) },
      ],
    },
  ],
};

export default imessage;
