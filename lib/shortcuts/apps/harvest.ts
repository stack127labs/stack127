import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const harvest: AppShortcuts = {
  slug: "harvest",
  name: "Harvest",
  category: "Time tracking",
  platforms: [...platforms],
  versionContext:
    "Harvest for Windows and Mac. Several keys can be changed in the app's settings.",
  sourceUrl: "https://support.getharvest.com/hc/en-us/articles/360048685411-Windows-app-Keyboard-shortcuts",
  sourceLabel: "official Harvest Windows app keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "timer-and-timesheet",
      title: "Timer and timesheet",
      intro: "Start a timer, show the timesheet, move between days, and select entries in the desktop app.",
      shortcuts: [
        { id: "new-timer", action: "Start a new timer", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "N"], macos: ["Option", "Cmd", "N"] }), note: "Customizable in Harvest settings." },
        { id: "new-timer-timesheet", action: "Start a new timer from the timesheet", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "toggle-timesheet", action: "Show or hide the timesheet", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "H"], macos: ["Option", "Cmd", "T"] }), note: "Customizable in Harvest settings." },
        { id: "favorites", action: "Open favorites", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "F"], macos: ["Option", "Cmd", "F"] }), note: "Customizable in Harvest settings." },
        { id: "previous-day", action: "Move to the previous day", keys: combo(platforms, ["Left"]) },
        { id: "next-day", action: "Move to the next day", keys: combo(platforms, ["Right"]) },
        { id: "today", action: "Go to today", keys: combo(platforms, ["Ctrl", "T"], ["T"]) },
        { id: "previous-entry", action: "Select the previous entry", keys: combo(platforms, ["Up"]) },
        { id: "next-entry", action: "Select the next entry", keys: combo(platforms, ["Down"]) },
      ],
    },
    {
      id: "entry-actions",
      title: "Entry actions",
      intro: "Start or stop the selected timer, edit its details, or remove the selected time entry.",
      shortcuts: [
        { id: "toggle-selected-timer", action: "Start or stop the selected timer", keys: combo(platforms, ["Ctrl", "S"], ["S"]) },
        { id: "edit-entry", action: "Edit the selected entry", keys: combo(platforms, ["Ctrl", "E"], ["E"]) },
        { id: "delete-entry", action: "Delete the selected entry", keys: combo(platforms, ["Delete"]) },
      ],
    },
  ],
};

export default harvest;
