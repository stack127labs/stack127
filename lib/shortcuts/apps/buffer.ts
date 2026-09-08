import type { AppShortcuts, PlatformId, Shortcut } from "../types.ts";

const platforms: PlatformId[] = ["windows", "macos", "linux"];
const same = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});
const modified = (
  id: string,
  action: string,
  controlKeys: string[],
  commandKeys: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: [
    { platform: "windows", keys: controlKeys },
    { platform: "linux", keys: controlKeys },
    { platform: "macos", keys: commandKeys },
  ],
  ...(note ? { note } : {}),
});

export const buffer: AppShortcuts = {
  slug: "buffer",
  name: "Buffer",
  category: "Social media management",
  platforms,
  intro:
    "Buffer's web shortcuts open its reference and command bar, jump among product areas, start new work, schedule posts, build threads, and navigate Community conversations.",
  versionContext:
    "Current Buffer Help Center shortcut list checked August 31, 2026. Navigation commands are two-key sequences, not simultaneous chords, and global shortcuts are suppressed while the cursor is in a text field. Buffer Home must be enabled for its navigation command.",
  sourceUrl: "https://support.buffer.com/en-us/articles/using-buffers-keyboard-shortcuts-jvc735UOsa",
  sourceLabel: "Using Buffer's keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "reference-command-bar",
      title: "Shortcut reference and command bar",
      intro:
        "Open Buffer's in-app shortcut reference from any page or use the command bar to search for a destination without navigating menus.",
      shortcuts: [
        {
          id: "shortcut-dialog",
          action: "Open the Keyboard Shortcuts dialog",
          keys: [
            { platform: "windows", keys: ["Shift", "/"], alternatives: [["Ctrl", "/"]] },
            { platform: "linux", keys: ["Shift", "/"], alternatives: [["Ctrl", "/"]] },
            { platform: "macos", keys: ["Shift", "/"], alternatives: [["Cmd", "/"]] },
          ],
          note: "Shift+/ produces the question mark character on standard keyboard layouts.",
        },
        modified("command-bar", "Open the in-app command bar", ["Ctrl", "K"], ["Cmd", "K"]),
      ],
    },
    {
      id: "navigation",
      title: "Product navigation",
      intro:
        "Press each letter in order from outside text fields to jump directly to Buffer's publishing, analytics, engagement, landing-page, ideas, or home areas.",
      shortcuts: [
        same("publishing", "Go to Publishing", ["G", "then", "P"]),
        same("insights", "Go to Insights", ["G", "then", "A"]),
        same("community", "Go to Community", ["G", "then", "C"]),
        same("start-page", "Go to Start Page", ["G", "then", "S"]),
        same("ideas", "Go to Ideas", ["G", "then", "I"]),
        same("home", "Go to Home", ["G", "then", "H"], "Available only for organizations with Buffer Home enabled."),
      ],
    },
    {
      id: "create-refresh",
      title: "Create work and refresh Community",
      intro:
        "Start a post or idea, connect another social channel, or load newly available comments and mentions in Buffer Community.",
      shortcuts: [
        same("new-post", "Start a new post", ["N", "then", "P"]),
        same("new-idea", "Start a new idea", ["N", "then", "I"]),
        same("new-channel", "Connect a new channel", ["N", "then", "C"]),
        modified(
          "load-community",
          "Load new comments or mentions in Community",
          ["Ctrl", "J"],
          ["Cmd", "J"],
          "Works when Buffer reports that new Community comments or mentions are available.",
        ),
      ],
    },
    {
      id: "composer-community",
      title: "Composer and Community",
      intro:
        "Schedule the active post, continue directly into another post, add a thread item, or move through the current Community comment list.",
      shortcuts: [
        modified("schedule", "Schedule the current post", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        modified(
          "schedule-another",
          "Schedule the current post and start another",
          ["Ctrl", "Shift", "Enter"],
          ["Cmd", "Shift", "Enter"],
        ),
        same("start-thread", "Start a thread", ["Shift", "Enter"]),
        {
          id: "community-comments",
          action: "Navigate between comments in Community",
          keys: platforms.map((platform) => ({
            platform,
            keys: ["Up"],
            alternatives: [["Down"]],
          })),
        },
      ],
    },
  ],
};

export default buffer;
