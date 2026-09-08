import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [
    { platform: "windows", keys: windows },
    { platform: "macos", keys: macos },
  ],
  ...(note ? { note } : {}),
});

const mac = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "macos", keys, ...(alternatives ? { alternatives } : {}) }],
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});

export const fantastical: AppShortcuts = {
  slug: "fantastical",
  name: "Fantastical",
  category: "Calendar and tasks",
  platforms: [...platforms],
  intro:
    "Fantastical's Mac and Windows shortcut pages cover search, event and task creation, date navigation, item movement, and app controls.",
  versionContext:
    "Current Fantastical keyboard shortcut pages checked September 1, 2026. The Mac page lists more commands than the Windows page, and the global open shortcut can be customized.",
  sourceUrl: "https://flexibits.com/fantastical/help/keyboard-shortcuts",
  sourceLabel: "Fantastical keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "application",
      title: "Application",
      intro: "Open Fantastical, search, create items, and reach app controls.",
      shortcuts: [
        mac("open", "Open or close Fantastical", ["Ctrl", "Option", "Space"], undefined, "This global shortcut is customizable."),
        pair("search", "Search", ["Ctrl", "F"], ["Cmd", "F"]),
        pair("new-event", "Create a new event", ["Ctrl", "N"], ["Cmd", "N"]),
        pair("today", "Go to today", ["Ctrl", "T"], ["Cmd", "T"]),
        pair("task-list", "Show the task list", ["Ctrl", "R"], ["Cmd", "R"]),
        pair("settings", "Open Settings", ["Ctrl", ","], ["Cmd", ","]),
        mac("quit", "Quit Fantastical", ["Cmd", "Q"]),
        mac("print", "Print", ["Cmd", "P"]),
        mac("info", "Show item information", ["Cmd", "I"]),
        mac("event-task-mode", "Switch between event and task mode", ["Cmd", "K"]),
        mac("keep-on-top", "Keep the Mini Window on top", ["Ctrl", "Cmd", "A"]),
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "Move through calendar dates and open search results with the keyboard.",
      shortcuts: [
        shared("date-navigation", "Move through dates", ["Arrow keys"]),
        mac("details", "Show event or task details", ["Cmd", "E"]),
        mac("next-search-result", "Move to the next search result", ["Cmd", "Down"]),
        mac("delete", "Delete the selected event or task", ["Cmd", "Backspace"], [["Backspace"]]),
        mac("detected-invitees", "Show detected invitees", ["Shift", "Cmd", "I"]),
      ],
    },
    {
      id: "move-items",
      title: "Move events and tasks",
      intro: "Mac shortcuts move the selected item by a day, fifteen minutes, or its end time.",
      shortcuts: [
        mac("move-day-forward", "Move the item one day forward", ["Ctrl", "Cmd", "Right"]),
        mac("move-day-back", "Move the item one day backward", ["Ctrl", "Cmd", "Left"]),
        mac("move-fifteen-forward", "Move the item fifteen minutes forward", ["Ctrl", "Cmd", "Down"]),
        mac("move-fifteen-back", "Move the item fifteen minutes backward", ["Ctrl", "Cmd", "Up"]),
        mac("extend-end-forward", "Move the event end later", ["Ctrl", "Shift", "Down"]),
        mac("extend-end-back", "Move the event end earlier", ["Ctrl", "Shift", "Up"]),
      ],
    },
  ],
};

export default fantastical;
