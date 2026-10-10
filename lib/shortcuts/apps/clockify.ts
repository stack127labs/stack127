import type { AppShortcuts, Shortcut } from "../types.ts";

const web = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: (["windows", "macos", "linux"] as const).map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});
const mac = (id: string, action: string, keys: string[]): Shortcut => ({ id, action, keys: [{ platform: "macos", keys }] });

export const clockify: AppShortcuts = {
  slug: "clockify",
  name: "Clockify",
  category: "Time tracking",
  platforms: ["windows", "macos", "linux"],
  versionContext:
    "Current Clockify web and Mac desktop documentation checked August 31, 2026. Favorite-entry number keys require the workspace feature to be enabled and entries pinned. User-configurable global shortcuts are not listed as defaults.",
  sourceUrl: "https://clockify.me/help/track-time-and-expenses/creating-a-time-entry",
  sourceLabel: "Clockify time-entry keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "web-time-tracker",
      title: "Web Time Tracker",
      intro: "These single-key commands work on the Time Tracker page only when the cursor is not active in an editable field.",
      shortcuts: [
        web("new-timer", "Start a new timer", ["N"]),
        web("continue", "Continue the latest time entry", ["C"]),
        web("stop", "Stop the current timer", ["S"]),
        web("manual", "Switch to manual time-entry mode", ["M"]),
        web("favorite", "Quick-start favorite time entry 1 through 5", ["1-5"], "Requires Favorite entries to be enabled and pinned in the favorites bar."),
      ],
    },
    {
      id: "mac-desktop",
      title: "Mac desktop app",
      intro: "These commands require focus in the Clockify window. Start/stop and app visibility can also be assigned custom global shortcuts in Preferences.",
      shortcuts: [
        mac("mac-start", "Start the timer", ["Cmd", "S"]),
        mac("mac-stop", "Stop the timer", ["Cmd", "T"]),
        mac("mac-manual", "Enter manual time-entry mode", ["Cmd", "N"]),
        mac("mac-save", "Save the time entry being edited", ["Cmd", "Shift", "S"]),
        mac("mac-discard", "Discard the timer", ["Cmd", "D"]),
        mac("mac-sync", "Sync data", ["Cmd", "Y"]),
        mac("mac-logout", "Log out", ["Cmd", "L"]),
      ],
    },
  ],
};

export default clockify;
