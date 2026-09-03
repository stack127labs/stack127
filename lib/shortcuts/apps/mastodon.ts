import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys, ...(alternatives ? { alternatives } : {}) })),
  ...(note ? { note } : {}),
});

const option = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, linux: windows, macos }),
  ...(note ? { note } : {}),
});

export const mastodon: AppShortcuts = {
  slug: "mastodon",
  name: "Mastodon",
  category: "Social networking",
  platforms: [...platforms],
  intro:
    "Mastodon's web shortcuts search, open, and act on posts, move through columns, and use G-prefixed sequences to reach common views.",
  versionContext:
    "Web hotkeys from Mastodon's current main source, checked September 1, 2026. The source ignores shortcuts while focus is in an input, textarea, or select, and user instances can run different releases or customizations. Alt is shown as Option on macOS.",
  sourceUrl: "https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/components/hotkeys/index.tsx",
  sourceLabel: "Mastodon web hotkeys source",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "post-actions",
      title: "Post actions",
      intro: "Move through the timeline, open a post or profile, and act on the focused post.",
      shortcuts: [
        shared("help", "Open the keyboard shortcut help", ["?"]),
        shared("search", "Focus search", ["S"], [["/"]]),
        shared("back", "Go back", ["Backspace"]),
        shared("new-post", "Compose a new post", ["N"]),
        option("force-new-post", "Compose a new post in a fresh composer", ["Alt", "N"], ["Option", "N"]),
        shared("focus-load-more", "Focus the load-more control", ["L"]),
        shared("reply", "Reply to the focused post", ["R"]),
        shared("favourite", "Favourite the focused post", ["F"]),
        shared("boost", "Boost the focused post", ["B"]),
        shared("quote", "Quote the focused post", ["Q"]),
        shared("mention", "Mention the focused post's author", ["M"]),
        shared("open", "Open the focused post", ["Enter"], [["O"]]),
        shared("profile", "Open the focused profile", ["P"]),
        shared("move-down", "Move to the next post", ["J"], [["Alt", "Page Down"]]),
        shared("move-up", "Move to the previous post", ["K"], [["Alt", "Page Up"]]),
        shared("top", "Move to the top of the timeline", ["0"]),
        shared("toggle-hidden", "Show or hide a hidden post", ["X"]),
        shared("toggle-sensitive", "Show or hide sensitive media", ["H"]),
        option("compose-spoilers", "Toggle composer spoilers", ["Alt", "X"], ["Option", "X"]),
        shared("open-media", "Open the focused post's media", ["E"]),
        shared("translate", "Translate the focused post", ["T"]),
      ],
    },
    {
      id: "columns",
      title: "Column navigation",
      intro: "Use the documented G then letter sequences to open Mastodon's main timeline and account columns.",
      shortcuts: [
        shared("focus-column", "Focus a numbered column", ["1-9"]),
        shared("home", "Open Home", ["G", "then", "H"]),
        shared("explore", "Open Explore", ["G", "then", "E"]),
        shared("notifications", "Open Notifications", ["G", "then", "N"]),
        shared("local", "Open the Local timeline", ["G", "then", "L"]),
        shared("federated", "Open the Federated timeline", ["G", "then", "T"]),
        shared("direct", "Open Direct messages", ["G", "then", "D"]),
        shared("start", "Open the start column", ["G", "then", "S"]),
        shared("favourites", "Open Favourites", ["G", "then", "F"]),
        shared("pinned", "Open pinned posts", ["G", "then", "P"]),
        shared("profile-column", "Open your profile", ["G", "then", "U"]),
        shared("blocked", "Open blocked accounts", ["G", "then", "B"]),
        shared("muted", "Open muted accounts", ["G", "then", "M"]),
        shared("follow-requests", "Open follow requests", ["G", "then", "R"]),
      ],
    },
  ],
};

export default mastodon;
