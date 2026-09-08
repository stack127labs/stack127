import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const sparkMail: AppShortcuts = {
  slug: "spark-mail",
  name: "Spark Mail",
  category: "Email",
  platforms: [...platforms],
  intro:
    "Spark Mail's desktop shortcut reference groups email triage, navigation, composing, formatting, calendar, and team actions. This record uses the published Mac and Windows desktop presets.",
  versionContext:
    "Spark Desktop shortcuts checked September 1, 2026. Spark supports configurable shortcut presets, so these entries describe the published default desktop bindings rather than a user's custom preset.",
  sourceUrl: "https://sparkmailapp.com/help/tips-tricks/use-keyboard-shortcuts",
  sourceLabel: "official Spark Mail desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "email-triage",
      title: "Email triage",
      intro: "Email triage shortcuts reply, forward, mark, archive, snooze, label, and move messages without leaving the inbox.",
      shortcuts: [
        { id: "previous-message", action: "Go to the previous message", keys: perPlatform(platforms, { windows: ["Up"], macos: ["Up"] }) },
        { id: "next-message", action: "Go to the next message", keys: perPlatform(platforms, { windows: ["Down"], macos: ["Down"] }) },
        { id: "reply", action: "Reply", keys: perPlatform(platforms, { windows: ["Shift", "R"], macos: ["Shift", "R"] }) },
        { id: "reply-all", action: "Reply all", keys: perPlatform(platforms, { windows: ["R"], macos: ["R"] }) },
        { id: "forward", action: "Forward", keys: perPlatform(platforms, { windows: ["F"], macos: ["F"] }) },
        { id: "mark-read", action: "Mark as read or unread", keys: perPlatform(platforms, { windows: ["U"], macos: ["U"] }) },
        { id: "delete", action: "Move the message to Trash", keys: perPlatform(platforms, { windows: ["Delete"], macos: ["Delete"] }) },
        { id: "spam", action: "Mark as spam", keys: perPlatform(platforms, { windows: ["Shift", "1"], macos: ["Shift", "1"] }) },
        { id: "done", action: "Mark as done", keys: perPlatform(platforms, { windows: ["E"], macos: ["E"] }) },
        { id: "priority", action: "Mark as priority", keys: perPlatform(platforms, { windows: ["I"], macos: ["I"] }) },
        { id: "pin", action: "Pin or unpin", keys: perPlatform(platforms, { windows: ["D"], macos: ["D"] }) },
        { id: "snooze", action: "Snooze", keys: perPlatform(platforms, { windows: ["S"], macos: ["S"] }) },
        { id: "label", action: "Set a label", keys: perPlatform(platforms, { windows: ["L"], macos: ["L"] }) },
        { id: "move", action: "Move a message", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "send-again", action: "Send the message again", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
      ],
    },
    {
      id: "navigation",
      title: "Navigation and views",
      intro: "Navigation shortcuts switch mailbox views, focus search, open folders, and change the message list presentation.",
      shortcuts: [
        { id: "inbox", action: "Open Inbox", keys: combo(platforms, ["Ctrl", "Shift", "1"], ["Cmd", "Shift", "1"]) },
        { id: "archive-view", action: "Open Archive", keys: combo(platforms, ["Ctrl", "Shift", "2"], ["Cmd", "Shift", "2"]) },
        { id: "search", action: "Focus search", keys: perPlatform(platforms, { windows: ["/"], macos: ["/"] }) },
        { id: "done-view", action: "Open Done", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "set-aside", action: "Set aside a message", keys: perPlatform(platforms, { windows: ["G"], macos: ["G"] }) },
        { id: "pinned-view", action: "Open Pinned", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "P"], macos: ["Cmd", "Shift", "P"] }) },
        { id: "snoozed-view", action: "Open Snoozed", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "S"], macos: ["Cmd", "Shift", "S"] }) },
        { id: "new-window", action: "Open a new window", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "N"], macos: ["Ctrl", "Option", "N"] }) },
        { id: "folder", action: "Open a folder", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
      ],
    },
    {
      id: "composer",
      title: "Composer and formatting",
      intro: "Composer shortcuts create drafts, attach files, send messages, insert templates, and apply formatting while the editor is active.",
      shortcuts: [
        { id: "compose", action: "Compose a new message", keys: perPlatform(platforms, { windows: ["C"], macos: ["C"] }) },
        { id: "send", action: "Send the message", keys: perPlatform(platforms, { windows: ["Ctrl", "Enter"], macos: ["Cmd", "Return"] }) },
        { id: "send-done", action: "Send and mark as done", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "Enter"], macos: ["Cmd", "Shift", "Return"] }) },
        { id: "attach", action: "Attach a file", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "template", action: "Insert a template", keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]) },
        { id: "bold", action: "Bold text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italic text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "clear-formatting", action: "Clear formatting", keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]) },
      ],
    },
  ],
};

export default sparkMail;
