import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const sparkMail: AppShortcuts = {
  slug: "spark-mail",
  name: "Spark Mail",
  category: "Email",
  platforms: [...platforms],
  versionContext:
    "Spark Desktop default keys. Spark has shortcut presets you can change, so yours may differ.",
  sourceUrl: "https://sparkmailapp.com/help/tips-tricks/use-keyboard-shortcuts",
  sourceLabel: "official Spark Mail desktop keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "email-triage",
      title: "Email triage",
      intro: "Email triage shortcuts reply, forward, mark, snooze, label, and move messages without leaving the inbox.",
      shortcuts: [
        { id: "previous-message", action: "Open the previous email", keys: perPlatform(platforms, { windows: ["Left"], macos: ["Left"] }) },
        { id: "next-message", action: "Open the next email", keys: perPlatform(platforms, { windows: ["Right"], macos: ["Right"] }) },
        { id: "reply", action: "Reply", keys: perPlatform(platforms, { windows: ["Shift", "R"], macos: ["Shift", "R"] }) },
        { id: "reply-all", action: "Reply all", keys: perPlatform(platforms, { windows: ["R"], macos: ["R"] }) },
        { id: "forward", action: "Forward", keys: perPlatform(platforms, { windows: ["F"], macos: ["F"] }) },
        { id: "mark-read", action: "Mark as read", keys: perPlatform(platforms, { windows: ["U"], macos: ["U"] }) },
        { id: "delete", action: "Delete", keys: perPlatform(platforms, { windows: ["Delete"], macos: ["Delete"] }) },
        { id: "spam", action: "Mark as spam", keys: perPlatform(platforms, { windows: ["Shift", "1"], macos: ["Shift", "1"] }) },
        { id: "done", action: "Mark as done", keys: perPlatform(platforms, { windows: ["E"], macos: ["E"] }) },
        { id: "priority", action: "Mark as priority", keys: perPlatform(platforms, { windows: ["I"], macos: ["I"] }) },
        { id: "pin", action: "Pin", keys: perPlatform(platforms, { windows: ["D"], macos: ["D"] }) },
        { id: "snooze", action: "Snooze", keys: perPlatform(platforms, { windows: ["S"], macos: ["S"] }) },
        { id: "label", action: "Add or remove a label", keys: perPlatform(platforms, { windows: ["L"], macos: ["L"] }) },
        { id: "move", action: "Move to", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "send-again", action: "Send again", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
      ],
    },
    {
      id: "navigation",
      title: "Navigation and views",
      intro: "Navigation shortcuts switch mailbox views, start a search, open folders, and show or hide Done emails.",
      shortcuts: [
        { id: "inbox", action: "Open Inbox", keys: combo(platforms, ["Ctrl", "Shift", "1"], ["Cmd", "Shift", "1"]) },
        { id: "calendar-view", action: "Open Calendar", keys: combo(platforms, ["Ctrl", "Shift", "2"], ["Cmd", "Shift", "2"]) },
        { id: "search", action: "Search", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "done-view", action: "Show or hide Done emails", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "set-aside", action: "Set aside a message", keys: perPlatform(platforms, { windows: ["G"], macos: ["G"] }) },
        { id: "pinned-view", action: "Open Pinned emails", keys: perPlatform(platforms, { windows: ["Ctrl", "D"], macos: ["Cmd", "D"] }) },
        { id: "snoozed-view", action: "Open Snoozed emails", keys: perPlatform(platforms, { windows: ["Ctrl", "S"], macos: ["Cmd", "S"] }) },
        { id: "new-window", action: "Open a thread in a new window", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "N"], macos: ["Ctrl", "Option", "N"] }) },
        { id: "folder", action: "Go to a folder", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
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
