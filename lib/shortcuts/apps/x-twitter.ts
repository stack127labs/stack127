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

export const xTwitter: AppShortcuts = {
  slug: "x-twitter",
  name: "X (Twitter)",
  category: "Social media",
  platforms: [...platforms],
  versionContext:
    "X Help Center keyboard shortcut list checked October 10, 2026. These shortcuts apply to the desktop web experience on x.com. The Help Center still lists a Moments destination that is no longer included here.",
  sourceUrl: "https://help.x.com/en/using-x/how-to-post",
  sourceLabel: "official X Help Center keyboard shortcuts",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "posts",
      title: "Posts",
      intro: "Use these single-key commands to act on the focused post.",
      shortcuts: [
        shared("new-post", "Compose a new post", ["N"]),
        shared("like", "Like the focused post", ["L"]),
        shared("reply", "Reply to the focused post", ["R"]),
        shared("repost", "Repost the focused post", ["T"]),
        shared("direct-message", "Send a direct message", ["M"]),
        shared("mute", "Mute the focused account", ["U"]),
        shared("block", "Block the focused account", ["B"]),
        shared("open-details", "Open the focused post details", ["Enter"]),
        shared("expand-photo", "Expand the focused photo", ["O"]),
        dual("send-post", "Send the composed post", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "Move through posts, search, and load newer timeline items.",
      shortcuts: [
        shared("next-post", "Move to the next post", ["J"]),
        shared("previous-post", "Move to the previous post", ["K"]),
        shared("page-down", "Move down one page", ["Space"]),
        shared("search", "Focus search", ["/"]),
        shared("load-new-posts", "Load new posts", ["."]),
        shared("shortcut-menu", "Open the shortcut menu", ["?"]),
      ],
    },
    {
      id: "go-to",
      title: "Go to areas",
      intro: "Press G followed by the listed key to open a common X area.",
      shortcuts: [
        shared("home", "Go to Home", ["G", "then", "H"]),
        shared("notifications", "Go to Notifications", ["G", "then", "N"]),
        shared("mentions", "Go to Mentions", ["G", "then", "R"]),
        shared("profile", "Go to your profile", ["G", "then", "P"]),
        shared("likes", "Go to your Likes", ["G", "then", "L"]),
        shared("lists", "Go to Lists", ["G", "then", "I"]),
        shared("messages", "Go to Direct Messages", ["G", "then", "M"]),
        shared("settings", "Go to Settings and privacy", ["G", "then", "S"]),
        shared("user-profile", "Go to a profile", ["G", "then", "U"]),
      ],
    },
  ],
};

export default xTwitter;
