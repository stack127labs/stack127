import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const linkedin: AppShortcuts = {
  slug: "linkedin",
  name: "LinkedIn",
  category: "Social networking",
  platforms: [...platforms],
  intro:
    "LinkedIn's desktop feed shortcuts move between posts and notifications, open the main destinations, and expose a quick reference modal.",
  versionContext:
    "Desktop-only shortcuts from LinkedIn's current Keyboard Shortcuts FAQ, checked September 1, 2026. LinkedIn says the shortcuts can be enabled or disabled from the keyboard menu and are not available in its mobile apps.",
  sourceUrl: "https://www.linkedin.com/help/linkedin/answer/a6246187?lang=en-US",
  sourceLabel: "official LinkedIn Keyboard Shortcuts FAQ",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "feed",
      title: "Feed and notifications",
      intro: "Move through the desktop feed, then act on the focused post or notification.",
      shortcuts: [
        { id: "new-post", action: "Open the new-post share box", keys: combo(platforms, ["N"]) },
        { id: "next-feed-item", action: "Move to the next feed item", keys: combo(platforms, ["J"]) },
        { id: "previous-feed-item", action: "Move to the previous feed item", keys: combo(platforms, ["K"]) },
        { id: "like-post", action: "Like the focused post", keys: combo(platforms, ["L"]) },
        { id: "comment-post", action: "Comment on the focused post", keys: combo(platforms, ["C"]) },
        { id: "share-post", action: "Share the focused post", keys: combo(platforms, ["R"]) },
        { id: "send-post", action: "Send the focused post", keys: combo(platforms, ["S"]) },
        { id: "next-notification", action: "Move to the next notification", keys: combo(platforms, ["J"]) },
        { id: "previous-notification", action: "Move to the previous notification", keys: combo(platforms, ["K"]) },
      ],
    },
    {
      id: "navigation",
      title: "Desktop navigation",
      intro: "Use slash search and the documented G-prefixed sequences to reach LinkedIn's main destinations.",
      shortcuts: [
        { id: "search", action: "Focus search", keys: combo(platforms, ["/"]) },
        { id: "home", action: "Go to Home", keys: combo(platforms, ["G", "then", "H"]) },
        { id: "my-network", action: "Go to My Network", keys: combo(platforms, ["G", "then", "W"]) },
        { id: "jobs", action: "Go to Jobs", keys: combo(platforms, ["G", "then", "J"]) },
        { id: "messages", action: "Go to Messaging", keys: combo(platforms, ["G", "then", "M"]) },
        { id: "notifications", action: "Go to Notifications", keys: combo(platforms, ["G", "then", "N"]) },
        { id: "me", action: "Go to Me", keys: combo(platforms, ["G", "then", "P"]) },
        { id: "shortcut-cheatsheet", action: "Open the shortcut cheatsheet", keys: combo(platforms, ["Shift", "?"]) },
        { id: "keyboard-menu", action: "Focus the keyboard shortcuts menu", keys: combo(platforms, ["Tab"]) },
      ],
    },
  ],
};

export default linkedin;
