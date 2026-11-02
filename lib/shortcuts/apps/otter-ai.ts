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
  versionContext:
    "Mac and Windows use different modifier keys, as shown.",
  sourceUrl: "https://help.otter.ai/hc/en-us/articles/29431724341399-Keyboard-Shortcuts",
  sourceLabel: "official Otter.ai keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "audio-playback",
      title: "Audio playback",
      intro: "Pause, seek, and change the speed of the active recording.",
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
        shared("insert-paragraph-break", "Insert a paragraph break", ["Return"], "Enter also works."),
        shared("merge-paragraph", "Delete a paragraph break and merge with the previous paragraph", ["Delete"], "Backspace also works."),
        dual("undo", "Undo an action", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo an action", ["Ctrl", "Y"], ["Cmd", "Y"]),
      ],
    },
    {
      id: "search-and-shortcut-help",
      title: "Search and shortcut help",
      intro: "Open search, or show the panel that lists Otter's keyboard shortcuts.",
      shortcuts: [
        dual("open-search", "Open search", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("toggle-shortcut-panel", "Toggle the keyboard shortcuts panel", ["Ctrl", "/"], ["Cmd", "/"]),
      ],
    },
  ],
};

export default otterAi;
