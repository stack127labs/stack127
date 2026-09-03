import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows"] as const;

const harvest: AppShortcuts = {
  slug: "harvest",
  name: "Harvest",
  category: "Time tracking",
  platforms: [...platforms],
  intro:
    "Harvest's Windows app shortcuts cover timer creation, the timesheet, favorites, day navigation, and editing or deleting a selected entry. The source gives these as the app's current Windows defaults.",
  versionContext:
    "Harvest documents Windows defaults and marks several commands as customizable in preferences. Its Mac preferences page describes customization without publishing stable default key values, so this record is Windows-only.",
  sourceUrl: "https://support.getharvest.com/hc/en-us/articles/360048685411-Windows-app-Keyboard-shortcuts",
  sourceLabel: "official Harvest Windows app keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "timer-and-timesheet",
      title: "Timer and timesheet",
      intro: "Start a timer, show the timesheet, move between days, and select entries in the Windows desktop app.",
      shortcuts: [
        { id: "new-timer", action: "Start a new timer", keys: combo(platforms, ["Ctrl", "Alt", "N"]), note: "Customizable in Harvest preferences." },
        { id: "new-timer-timesheet", action: "Start a new timer from the timesheet", keys: combo(platforms, ["Ctrl", "N"]) },
        { id: "toggle-timesheet", action: "Show or hide the timesheet", keys: combo(platforms, ["Ctrl", "Alt", "H"]), note: "Customizable in Harvest preferences." },
        { id: "favorites", action: "Open favorites", keys: combo(platforms, ["Ctrl", "Alt", "F"]) },
        { id: "previous-day", action: "Move to the previous day", keys: combo(platforms, ["Left"]) },
        { id: "next-day", action: "Move to the next day", keys: combo(platforms, ["Right"]) },
        { id: "today", action: "Go to today", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "previous-entry", action: "Select the previous entry", keys: combo(platforms, ["Up"]) },
        { id: "next-entry", action: "Select the next entry", keys: combo(platforms, ["Down"]) },
      ],
    },
    {
      id: "entry-actions",
      title: "Entry actions",
      intro: "Start or stop the selected timer, edit its details, or remove the selected time entry.",
      shortcuts: [
        { id: "toggle-selected-timer", action: "Start or stop the selected timer", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "edit-entry", action: "Edit the selected entry", keys: combo(platforms, ["Ctrl", "E"]) },
        { id: "delete-entry", action: "Delete the selected entry", keys: combo(platforms, ["Delete"]) },
      ],
    },
  ],
};

export default harvest;
