import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const signal: AppShortcuts = {
  slug: "signal",
  name: "Signal",
  category: "Messaging",
  platforms: [...platforms],
  intro:
    "Signal Desktop keyboard shortcuts move through conversations, search messages, format drafts, manage media, and control calls. This reference keeps the published Mac and Windows/Linux differences visible.",
  versionContext:
    "Signal Desktop keyboard shortcuts checked September 1, 2026. The official table covers the Mac and Windows/Linux desktop apps; user settings and browser shortcuts are outside this record.",
  sourceUrl: "https://support.signal.org/hc/en-us/articles/360036517511-Signal-Desktop-Keyboard-Shortcuts",
  sourceLabel: "official Signal Desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "display-and-navigation",
      title: "Display and navigation",
      intro: "Display and navigation shortcuts change zoom, move between conversations, focus search, and reach the desktop views used most often.",
      shortcuts: [
        { id: "show-shortcuts", action: "View all shortcuts", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "zoom-in", action: "Zoom in", keys: combo(platforms, ["Ctrl", "="], ["Cmd", "="]) },
        { id: "zoom-out", action: "Zoom out", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "navigate-section", action: "Navigate by section", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "previous-chat", action: "Go to the previous chat", keys: combo(platforms, ["Alt", "Up"], ["Option", "Up"]) },
        { id: "next-chat", action: "Go to the next chat", keys: combo(platforms, ["Alt", "Down"], ["Option", "Down"]) },
        { id: "previous-unread", action: "Go to the previous unread chat", keys: combo(platforms, ["Alt", "Shift", "Up"], ["Option", "Shift", "Up"]) },
        { id: "next-unread", action: "Go to the next unread chat", keys: combo(platforms, ["Alt", "Shift", "Down"], ["Option", "Shift", "Down"]) },
        { id: "jump-to-chat", action: "Jump to chat 1 through 9", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]), note: "Use the number for the target chat." },
        { id: "oldest-unread", action: "Focus oldest unread or last message", keys: combo(platforms, ["Ctrl", "J"], ["Cmd", "J"]) },
        { id: "preferences", action: "Open Preferences", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "chat-menu", action: "Open chat menu", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
        { id: "new-chat", action: "Start a new chat", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "search", action: "Search", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "search-in-chat", action: "Search in chat", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]) },
        { id: "focus-composer", action: "Focus the composer", keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]) },
        { id: "all-media", action: "Open All Media view", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "save-media", action: "Save media in the media viewer", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "archive-chat", action: "Archive chat", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "unarchive-chat", action: "Unarchive chat", keys: combo(platforms, ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]) },
        { id: "scroll-top", action: "Scroll to the top of chat", keys: combo(platforms, ["Ctrl", "Up"], ["Cmd", "Up"]) },
        { id: "scroll-bottom", action: "Scroll to the bottom of chat", keys: combo(platforms, ["Ctrl", "Down"], ["Cmd", "Down"]) },
        { id: "close-chat", action: "Close the current chat", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
      ],
    },
    {
      id: "messages-and-composer",
      title: "Messages and composer",
      intro: "Message and composer shortcuts act on a selected message or draft, from replies and reactions through attachments and text formatting.",
      shortcuts: [
        { id: "message-default", action: "Run the default action for a selected message", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"], linux: ["Enter"] }) },
        { id: "message-details", action: "View selected message details", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "reply", action: "Toggle reply to selected message", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]) },
        { id: "reaction-picker", action: "Toggle the emoji reaction picker", keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]) },
        { id: "forward", action: "Forward selected messages", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "message-context", action: "Open context menu for selected message", keys: perPlatform(platforms, { windows: ["Shift", "F10"], macos: ["Cmd", "F12"], linux: ["Shift", "F10"] }) },
        { id: "delete-message", action: "Delete selected message", keys: combo(platforms, ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]) },
        { id: "newline", action: "Add a newline to a message", keys: perPlatform(platforms, { windows: ["Shift", "Enter"], macos: ["Shift", "Return"], linux: ["Shift", "Enter"] }) },
        { id: "expand-composer", action: "Expand the composer", keys: combo(platforms, ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]) },
        { id: "send-message", action: "Send in the expanded composer", keys: perPlatform(platforms, { windows: ["Ctrl", "Enter"], macos: ["Cmd", "Return"], linux: ["Ctrl", "Enter"] }) },
        { id: "attach-file", action: "Attach a file", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "remove-link-preview", action: "Remove a draft link preview", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "remove-attachments", action: "Remove all draft attachments", keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]) },
        { id: "edit-previous", action: "Edit the previous message", keys: perPlatform(platforms, { windows: ["Up"], macos: ["Up"], linux: ["Up"] }) },
        { id: "bold", action: "Mark selected text as bold", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Mark selected text as italic", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "strikethrough", action: "Mark selected text as strikethrough", keys: combo(platforms, ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]) },
        { id: "monospace", action: "Mark selected text as monospace", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "spoiler", action: "Mark selected text as a spoiler", keys: combo(platforms, ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]) },
      ],
    },
    {
      id: "calling",
      title: "Calling",
      intro: "Calling shortcuts answer, decline, and end calls, while the shared controls change mute, video, and preview state.",
      shortcuts: [
        { id: "toggle-mute", action: "Toggle mute", keys: perPlatform(platforms, { windows: ["Shift", "M"], macos: ["Shift", "M"], linux: ["Shift", "M"] }) },
        { id: "toggle-video", action: "Toggle video", keys: perPlatform(platforms, { windows: ["Shift", "V"], macos: ["Shift", "V"], linux: ["Shift", "V"] }) },
        { id: "answer-video", action: "Answer a call with video", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "V"], macos: ["Ctrl", "Shift", "V"], linux: ["Alt", "Shift", "V"] }) },
        { id: "answer-voice", action: "Answer a call without video", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "A"], macos: ["Ctrl", "Shift", "A"], linux: ["Alt", "Shift", "A"] }) },
        { id: "decline-call", action: "Decline a call", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "D"], macos: ["Ctrl", "Shift", "D"], linux: ["Alt", "Shift", "D"] }) },
        { id: "voice-call", action: "Start a voice call", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "C"], macos: ["Ctrl", "Shift", "C"], linux: ["Alt", "Shift", "C"] }) },
        { id: "video-call", action: "Start a video call", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "Y"], macos: ["Ctrl", "Shift", "Y"], linux: ["Alt", "Shift", "Y"] }) },
        { id: "end-call", action: "End a call", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "E"], macos: ["Ctrl", "Shift", "E"], linux: ["Alt", "Shift", "E"] }) },
        { id: "maximize-preview", action: "Maximize the call preview", keys: perPlatform(platforms, { windows: ["Shift", "P"], macos: ["Shift", "P"], linux: ["Shift", "P"] }) },
      ],
    },
  ],
};

export default signal;
