import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

export const reddit: AppShortcuts = {
  slug: "reddit",
  name: "Reddit",
  category: "Social and community",
  platforms: [...platforms],
  intro:
    "Reddit's current desktop web hotkeys move through posts and comments, perform voting and saving actions, and control media playback. This page keeps navigation, actions, and media separate so the single-letter bindings are easy to scan.",
  versionContext:
    "Current Reddit desktop web hotkeys checked September 1, 2026. Reddit says the feature is available on the newest reddit.com interface, not old Reddit. On Windows, the help article maps its CMD references to Alt.",
  sourceUrl: "https://support.reddithelp.com/hc/en-us/articles/38744650091412-How-to-use-keyboard-shortcuts-hotkeys",
  sourceLabel: "official Reddit keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Navigation keys move through posts and comments or open the helper panel that lists Reddit's current hotkeys.",
      shortcuts: [
        dual("show-shortcuts", "Show the shortcuts panel", ["Shift", "?"], ["Shift", "?"]),
        dual("next", "Move to the next post or comment", ["J"], ["J"]),
        dual("previous", "Move to the previous post or comment", ["K"], ["K"]),
        dual("expand", "Expand or collapse content", ["X"], ["X"], "Reddit documents this for compact mode."),
        dual("copy-link", "Copy a post or comment link", ["L"], ["L"]),
        dual("toggle-navigation", "Open or close navigation", ["Q"], ["Q"]),
      ],
    },
    {
      id: "actions",
      title: "Post and comment actions",
      intro: "These single-letter commands act on the focused post or comment. Reddit lets users enable or disable the hotkeys from the helper panel.",
      shortcuts: [
        dual("upvote", "Upvote", ["A"], ["A"]),
        dual("downvote", "Downvote", ["Z"], ["Z"]),
        dual("reply", "Reply to a comment", ["R"], ["R"]),
        dual("save", "Save or unsave a post or comment", ["S"], ["S"]),
        dual("hide", "Hide a post", ["H"], ["H"]),
        dual("collapse", "Collapse or expand a comment", ["F"], ["F"]),
        dual("create", "Create a post", ["C"], ["C"]),
        dual("submit", "Submit a comment or post", ["Alt", "Enter"], ["Cmd", "Enter"]),
      ],
    },
    {
      id: "media",
      title: "Media playback",
      intro: "Media keys work while a Reddit video is focused. The same letters used for post navigation can have a playback meaning in the media player.",
      shortcuts: [
        dual("play-pause", "Play or pause", ["Space", "or", "K"], ["Space", "or", "K"]),
        dual("fullscreen", "Toggle fullscreen mode", ["F"], ["F"]),
        dual("rewind-five", "Rewind five seconds", ["Left Arrow"], ["Left Arrow"]),
        dual("forward-five", "Fast-forward five seconds", ["Right Arrow"], ["Right Arrow"]),
        dual("volume-up", "Increase volume", ["Up Arrow"], ["Up Arrow"]),
        dual("volume-down", "Decrease volume", ["Down Arrow"], ["Down Arrow"]),
        dual("rewind-ten", "Rewind ten seconds", ["J"], ["J"]),
        dual("forward-ten", "Fast-forward ten seconds", ["L"], ["L"]),
        dual("restart", "Restart media", ["0"], ["0"]),
        dual("mute", "Mute or unmute", ["M"], ["M"]),
        dual("captions", "Toggle captions", ["C"], ["C"]),
      ],
    },
  ],
};

export default reddit;
