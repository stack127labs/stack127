import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

export const otterAi: AppShortcuts = {
  slug: "otter-ai",
  name: "Otter.ai",
  category: "Transcription",
  platforms: [...platforms],
  intro:
    "Otter's published shortcuts cover search, audio playback, and transcript editing. The key map stays focused on the commands Otter documents for its web workspace and leaves account or browser shortcuts out.",
  versionContext:
    "Otter Help Center keyboard shortcuts checked September 1, 2026. The source article was updated February 4, 2025 and labels the modifier differences for Mac and Windows.",
  sourceUrl: "https://help.otter.ai/hc/en-us/articles/29431724341399-Keyboard-Shortcuts",
  sourceLabel: "official Otter.ai keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "search",
      title: "Search",
      intro: "Open Otter's search view from the workspace with the platform's documented modifier and letter combination.",
      shortcuts: [dual("open-search", "Open search", ["Ctrl", "K"], ["Cmd", "K"])],
    },
    {
      id: "audio-playback",
      title: "Audio playback",
      intro: "Control the active recording with the playback keys Otter publishes for pausing, seeking, and speed changes.",
      shortcuts: [
        shared("play-pause", "Play or pause", ["Escape"]),
        shared("rewind", "Rewind five seconds", ["Left Arrow"]),
        shared("forward", "Forward five seconds", ["Right Arrow"]),
        shared("slow-down", "Slow down playback", ["F3"]),
        shared("speed-up", "Speed up playback", ["F4"]),
      ],
    },
    {
      id: "transcript-editing",
      title: "Transcript editing",
      intro: "Edit transcript paragraphs and manage the edit history with these commands while the transcript has focus.",
      shortcuts: [
        shared("insert-paragraph-break", "Insert a paragraph break", ["Return"], "Enter is also documented for this action."),
        shared("merge-paragraph", "Delete a paragraph break and merge with the previous paragraph", ["Delete"], "Backspace is also documented for this action."),
        dual("undo", "Undo an action", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo an action", ["Ctrl", "Y"], ["Cmd", "Y"]),
      ],
    },
    {
      id: "shortcut-help",
      title: "Shortcut help",
      intro: "Show or hide Otter's shortcut panel with the platform modifier and slash command from the help article.",
      shortcuts: [dual("toggle-shortcut-panel", "Toggle the keyboard shortcuts panel", ["Ctrl", "/"], ["Cmd", "/"])],
    },
  ],
};

export default otterAi;
