import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const dual = (id: string, action: string, desktop: string[], mac: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: desktop, linux: desktop, macos: mac }),
  ...(note ? { note } : {}),
});
const desktop = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

export const mozillaThunderbird: AppShortcuts = {
  slug: "mozilla-thunderbird",
  name: "Mozilla Thunderbird",
  category: "Email",
  platforms: [...platforms],
  versionContext:
    "Current Thunderbird desktop shortcuts checked September 1, 2026. The official table was updated April 2, 2026. Add-ons can customize or disable some shortcuts, and macOS laptops may need Fn for function keys.",
  sourceUrl: "https://support.mozilla.org/en-US/kb/keyboard-shortcuts-thunderbird",
  sourceLabel: "official Thunderbird keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "messages",
      title: "Messages",
      intro: "Use these commands to compose, reply, read, mark, move, and remove messages from the message list or an open message.",
      shortcuts: [
        dual("new-message", "Start a new message", ["Ctrl", "M"], ["Cmd", "N"]),
        dual("reply", "Reply to the sender", ["Ctrl", "R"], ["Cmd", "R"]),
        dual("reply-all", "Reply to all recipients", ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        dual("reply-list", "Reply to the list", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        dual("forward", "Forward a message", ["Ctrl", "L"], ["Cmd", "L"]),
        desktop("archive", "Archive the selected message", ["A"]),
        desktop("mark-read", "Mark a message read or unread", ["M"]),
        desktop("mark-thread-read", "Mark a thread read", ["R"]),
        desktop("mark-junk", "Mark a message as junk", ["J"]),
        desktop("star", "Add or remove a star", ["S"]),
        desktop("delete", "Delete the selected message", ["Delete"]),
        dual("save-message", "Save a message as a file", ["Ctrl", "S"], ["Cmd", "S"]),
        dual("print-message", "Print the message or selected text", ["Ctrl", "P"], ["Cmd", "P"]),
        dual("undo", "Undo the last action", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo the last action", ["Ctrl", "Y"], ["Cmd", "Y"]),
      ],
    },
    {
      id: "search-and-navigation",
      title: "Search and navigation",
      intro: "Search messages, move between unread items, switch panes and tabs, and open the main Thunderbird areas from the keyboard.",
      shortcuts: [
        dual("global-search", "Search all messages", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("quick-filter", "Open the Quick Filter bar", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        dual("folder-search", "Search messages in the current folder", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        dual("find-message", "Find text in the current message", ["Ctrl", "F"], ["Cmd", "F"]),
        desktop("next-message", "Go to the next message", ["F"]),
        desktop("previous-message", "Go to the previous message", ["B"]),
        desktop("next-unread", "Go to the next unread message", ["N"]),
        desktop("previous-unread", "Go to the previous unread message", ["P"]),
        desktop("next-unread-thread", "Go to the next unread thread", ["T"]),
        desktop("first-message", "Go to the first message", ["Home"]),
        desktop("last-message", "Go to the last message", ["End"]),
        dual("next-tab", "Move to the next tab", ["Ctrl", "Tab"], ["Cmd", "Option", "Right"]),
        dual("previous-tab", "Move to the previous tab", ["Ctrl", "Shift", "Tab"], ["Cmd", "Option", "Left"]),
        dual("address-book", "Open the address book", ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]),
        dual("developer-tools", "Open developer tools", ["Ctrl", "Shift", "I"], ["Cmd", "Option", "I"]),
        dual("restore-tab", "Restore the most recently closed tab", ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
      ],
    },
    {
      id: "compose",
      title: "Writing messages",
      intro: "These commands apply in the compose window. The same key can have a different meaning in the message list, so keep the compose context in mind.",
      shortcuts: [
        dual("save-draft", "Save a draft", ["Ctrl", "S"], ["Cmd", "S"]),
        dual("send-now", "Send the message now", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        dual("send-later", "Send the message later", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Return"]),
        dual("paste-quote", "Paste as a quotation", ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]),
        dual("paste-plain", "Paste without formatting", ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]),
        dual("insert-link", "Insert a link", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("attach-file", "Attach a file", ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]),
        dual("bold", "Apply bold styling", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Apply italic styling", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("underline", "Apply underline styling", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("increase-indent", "Increase the indent", ["Ctrl", "]"], ["Cmd", "]"]),
        dual("decrease-indent", "Decrease the indent", ["Ctrl", "["], ["Cmd", "["]),
      ],
    },
    {
      id: "calendar-and-address-book",
      title: "Calendar and address book",
      intro: "Thunderbird's calendar and address book use the same desktop modifier pattern but add their own tabs, records, and date navigation commands.",
      shortcuts: [
        dual("new-contact", "Create a new address book contact", ["Ctrl", "N"], ["Cmd", "N"]),
        dual("contact-search", "Search contacts", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        dual("contact-properties", "Edit contact or address book properties", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("calendar-tab", "Open the calendar tab", ["Ctrl", "3"], ["Cmd", "3"]),
        dual("tasks-tab", "Open the tasks tab", ["Ctrl", "4"], ["Cmd", "4"]),
        dual("new-event", "Create a new event", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("new-task", "Create a new task", ["Ctrl", "D"], ["Cmd", "D"]),
        desktop("next-day", "Go to the next day, week, multiweek, or month", ["]"]),
        desktop("previous-day", "Go to the previous day, week, multiweek, or month", ["["]),
        desktop("clear-filter", "Clear the current calendar or task filter", ["Escape"]),
        dual("copy-calendar-item", "Copy the selected calendar item", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste-calendar-item", "Paste a calendar item", ["Ctrl", "V"], ["Cmd", "V"]),
      ],
    },
  ],
};

export default mozillaThunderbird;
