import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
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

export const youtube: AppShortcuts = {
  slug: "youtube",
  name: "YouTube",
  category: "Video",
  platforms: [...platforms],
  intro:
    "YouTube publishes desktop player shortcuts for playback, seeking, captions, chapters, speed, volume, search, and playlist navigation.",
  versionContext:
    "YouTube Help keyboard shortcut reference checked September 1, 2026. Some commands require the player or seek bar to have focus, and frame controls work only while playback is paused.",
  sourceUrl: "https://support.google.com/youtube/answer/7631406?hl=en",
  sourceLabel: "official YouTube keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "playback",
      title: "Playback",
      intro: "Use these keys to play, pause, mute, seek, and change playback speed.",
      shortcuts: [
        shared("space", "Play or pause", ["Space"], "The seek bar must be selected, or the focused button must support activation."),
        shared("media-play", "Play or pause", ["Media Play/Pause"]),
        shared("play-pause-k", "Play or pause", ["K"]),
        shared("mute", "Mute or unmute", ["M"]),
        shared("media-stop", "Stop playback", ["Media Stop"]),
        shared("media-next", "Play the next track", ["Media Next Track"]),
        shared("seek-back", "Seek backward five seconds", ["Left Arrow"], "The seek bar must have focus."),
        shared("seek-forward", "Seek forward five seconds", ["Right Arrow"], "The seek bar must have focus."),
        shared("back-ten", "Seek backward ten seconds", ["J"]),
        shared("forward-ten", "Seek forward ten seconds", ["L"]),
        dual("next-chapter", "Go to the next chapter", ["Ctrl", "Right Arrow"], ["Option", "Right Arrow"]),
        dual("previous-chapter", "Go to the previous chapter", ["Ctrl", "Left Arrow"], ["Option", "Left Arrow"]),
        shared("next-frame", "Move to the next frame", ["."], "Use this only while playback is paused."),
        shared("previous-frame", "Move to the previous frame", [","], "Use this only while playback is paused."),
        shared("speed-up", "Increase playback speed", [">"]),
        shared("slow-down", "Decrease playback speed", ["<"]),
      ],
    },
    {
      id: "player",
      title: "Player controls",
      intro: "Jump to a position, change volume, and toggle player display controls.",
      shortcuts: [
        shared("start", "Seek to the beginning", ["Home"]),
        shared("end", "Seek to the end", ["End"]),
        shared("volume-up", "Increase volume by five percent", ["Up Arrow"]),
        shared("volume-down", "Decrease volume by five percent", ["Down Arrow"]),
        shared("fullscreen", "Toggle fullscreen", ["F"]),
        shared("captions", "Toggle captions", ["C"]),
        shared("miniplayer", "Open the miniplayer", ["I"]),
        shared("next-video", "Play the next video", ["Shift", "N"]),
        shared("previous-video", "Play the previous playlist video", ["Shift", "P"]),
      ],
    },
    {
      id: "seek-and-search",
      title: "Seeking and search",
      intro: "Use the number row to jump through a video, and slash to focus YouTube search.",
      shortcuts: [
        shared("seek-ten", "Seek to ten percent", ["1"]),
        shared("seek-twenty", "Seek to twenty percent", ["2"]),
        shared("seek-thirty", "Seek to thirty percent", ["3"]),
        shared("seek-forty", "Seek to forty percent", ["4"]),
        shared("seek-fifty", "Seek to fifty percent", ["5"]),
        shared("seek-sixty", "Seek to sixty percent", ["6"]),
        shared("seek-seventy", "Seek to seventy percent", ["7"]),
        shared("seek-eighty", "Seek to eighty percent", ["8"]),
        shared("seek-ninety", "Seek to ninety percent", ["9"]),
        shared("seek-zero", "Seek to the beginning", ["0"]),
        shared("search", "Focus search", ["/"]),
      ],
    },
  ],
};

export default youtube;
