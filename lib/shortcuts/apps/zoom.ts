import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const tri = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  linux: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos, linux }),
  ...(note ? { note } : {}),
});

export const zoom: AppShortcuts = {
  slug: "zoom",
  name: "Zoom",
  category: "Video conferencing",
  platforms: [...platforms],
  versionContext:
    "Zoom desktop keyboard shortcut reference checked September 1, 2026. Zoom notes that some shortcuts require a higher app version than the global minimum and that shortcuts can be edited in settings.",
  sourceUrl: "https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067050",
  sourceLabel: "official Zoom desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "meeting",
      title: "Meetings",
      intro: "Control audio, video, sharing, recording, participants, and leaving a Zoom meeting.",
      shortcuts: [
        tri("focus-controls", "Focus the meeting controls", ["Ctrl", "Alt", "Shift"], [], []),
        tri("always-show-controls", "Toggle always-show meeting controls", ["Alt"], ["Ctrl", "\\"], ["Ctrl", "\\"]),
        tri("floating-controls", "Show or hide floating meeting controls", ["Ctrl", "Alt", "Shift", "H"], ["Control", "Option", "Cmd", "H"], []),
        tri("gallery-page-up", "View the previous gallery page", ["Page Up"], ["Ctrl", "P"], []),
        tri("gallery-page-down", "View the next gallery page", ["Page Down"], ["Ctrl", "N"], []),
        tri("speaker-view", "Switch to speaker view", ["Alt", "F1"], [], ["Alt", "F1"]),
        tri("gallery-view", "Switch to gallery view", ["Alt", "F2"], [], ["Alt", "F2"]),
        tri("cycle-views", "Cycle between speaker, multi-speaker, and gallery views", [], ["Cmd", "Shift", "W"], []),
        tri("video", "Start or stop video", ["Alt", "V"], ["Cmd", "Shift", "V"], ["Alt", "V"]),
        tri("mute", "Mute or unmute audio", ["Alt", "A"], ["Cmd", "Shift", "A"], ["Alt", "A"]),
        tri("mute-everyone", "Mute or unmute everyone", ["Alt", "M"], ["Cmd", "Ctrl", "M"], ["Alt", "M"]),
        tri("share-screen", "Start screen sharing", ["Alt", "S"], ["Cmd", "Shift", "S"], ["Alt", "S"]),
        tri("pause-share", "Pause or resume screen sharing", ["Alt", "T"], ["Cmd", "Shift", "T"], ["Alt", "T"]),
        tri("record-local", "Start or stop local recording", ["Alt", "R"], ["Cmd", "Shift", "R"], ["Alt", "R"]),
        tri("record-cloud", "Start or stop cloud recording", ["Alt", "C"], ["Cmd", "Shift", "C"], ["Alt", "C"]),
        tri("pause-recording", "Pause or resume recording", ["Alt", "P"], ["Cmd", "Shift", "P"], ["Alt", "P"]),
        tri("participants", "Show or hide participants", ["Alt", "U"], ["Cmd", "U"], ["Alt", "U"]),
        tri("invite", "Invite participants", ["Alt", "I"], ["Cmd", "I"], ["Alt", "I"]),
        tri("copy-invite", "Copy the meeting invitation", ["Alt", "Shift", "I"], ["Cmd", "Shift", "I"], ["Alt", "Shift", "I"]),
        tri("raise-hand", "Raise or lower your hand", ["Alt", "Y"], ["Option", "Y"], ["Alt", "Y"]),
        tri("leave", "Leave the meeting", ["Alt", "Q"], [], []),
        tri("remote-control", "Start or stop remote control", ["Alt", "Shift", "R"], ["Ctrl", "Shift", "R"], ["Alt", "Shift", "R"]),
        tri("remote-control-request", "Request remote control", ["Alt", "Shift", "G"], ["Ctrl", "Shift", "G"], ["Alt", "Shift", "G"]),
        tri("fullscreen", "Enter or exit full screen", ["Alt", "F"], ["Cmd", "Shift", "F"], []),
      ],
    },
    {
      id: "chat-and-calls",
      title: "Chat and calls",
      intro: "Move through Zoom Chat, start new conversations, and handle calls from the desktop app.",
      shortcuts: [
        tri("screenshot", "Take a screenshot", ["Alt", "Shift", "T"], ["Cmd", "T"], ["Alt", "Shift", "T"]),
        tri("hide-chat", "Hide the current chat", ["Ctrl", "W"], [], ["Ctrl", "W"]),
        tri("previous-chat", "Move to the previous chat", ["Ctrl", "Up Arrow"], [], []),
        tri("next-chat", "Move to the next chat", ["Ctrl", "Down Arrow"], [], []),
        tri("chat-history-back", "Move back in chat history", ["Alt", "Left Arrow"], ["Cmd", "["], ["Alt", "Left Arrow"]),
        tri("chat-history-forward", "Move forward in chat history", ["Alt", "Right Arrow"], ["Cmd", "]"], ["Alt", "Right Arrow"]),
        tri("new-chat", "Start a new chat", ["Ctrl", "N"], ["Cmd", "N"], []),
        tri("chat-list", "Focus the chat list", ["Ctrl", "L"], ["Cmd", "Shift", "L"], []),
        tri("latest-chat", "Jump to the latest message", ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"], []),
        tri("add-member", "Add a member to the current group chat or channel", ["Ctrl", "Alt", "I"], ["Cmd", "Option", "I"], []),
        tri("new-messages", "Jump to the start of new messages", ["Alt", "N"], ["Cmd", "Control", "N"], []),
        tri("new-call", "Call the highlighted phone number", ["Ctrl", "P"], ["Control", "Shift", "C"], []),
        tri("accept-call", "Accept an incoming call", ["Ctrl", "Shift", "A"], ["Control", "Shift", "A"], ["Ctrl", "Shift", "A"]),
        tri("end-call", "End an incoming call", ["Ctrl", "Shift", "E"], ["Control", "Shift", "E"], ["Ctrl", "Shift", "E"]),
        tri("decline-call", "Decline an incoming call", ["Ctrl", "Shift", "D"], ["Control", "Shift", "D"], ["Ctrl", "Shift", "D"]),
      ],
    },
    {
      id: "application",
      title: "Application navigation",
      intro: "Search Zoom, move between product tabs, and open common desktop areas.",
      shortcuts: [
        tri("search", "Search Zoom", ["Ctrl", "F"], ["Cmd", "E"], []),
        tri("next-product", "Move to the next product tab", ["Ctrl", "Tab"], ["Control", "Tab"], []),
        tri("previous-product", "Move to the previous product tab", ["Ctrl", "Shift", "Tab"], ["Control", "Shift", "Tab"], []),
        tri("product-one", "Open product tab one", ["Ctrl", "1"], ["Cmd", "1"], []),
        tri("product-eight", "Open product tab eight", ["Ctrl", "8"], ["Cmd", "8"], []),
        tri("last-product", "Open the last product tab", ["Ctrl", "9"], ["Cmd", "9"], []),
        tri("ai-companion", "Open Zoom AI Companion", ["Ctrl", "Shift", "O"], ["Shift", "Cmd", "O"], []),
        tri("calendar", "Open Zoom Calendar", ["Ctrl", "Shift", "J"], ["Shift", "Cmd", "J"], []),
        tri("close-window", "Close the active Zoom window", ["Alt", "F4"], ["Cmd", "W"], []),
        tri("diagnostics", "Start the Zoom client health check", ["Ctrl", "Alt", "Shift", "D"], ["Cmd", "Option", "Shift", "D"], []),
      ],
    },
  ],
};

export default zoom;
