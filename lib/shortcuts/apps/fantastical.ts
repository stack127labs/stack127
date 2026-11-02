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

export const fantastical: AppShortcuts = {
  slug: "fantastical",
  name: "Fantastical",
  category: "Calendar and tasks",
  platforms: [...platforms],
  versionContext:
    "Fantastical for Mac and Windows. The Mac app has more shortcuts, and you can change the global open shortcut.",
  sourceUrl: "https://flexibits.com/fantastical/help/keyboard-shortcuts",
  sourceLabel: "Fantastical keyboard shortcuts",
  lastVerified: "2026-11-02",
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
        pair("task-list", "Show or hide the task list", ["Ctrl", "R"], ["Cmd", "R"]),
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
        mac("date-navigation", "Jump to the next or previous month", ["Right"], [["Left"]]),
        mac("day-navigation", "Jump to the next or previous day", ["Shift", "Right"], [["Shift", "Left"]]),
        mac("week-navigation", "Jump to the next or previous week", ["Shift", "Down"], [["Shift", "Up"]]),
        mac("details", "Show or hide details", ["Cmd", "E"]),
        mac("next-search-result", "Jump from the search field to the first result", ["Cmd", "Down"]),
        mac("delete", "Delete the selected event or task", ["Cmd", "Backspace"], [["Backspace"]]),
        mac("detected-invitees", "Show detected invitees", ["Shift", "Cmd", "I"]),
      ],
    },
    {
      id: "move-items",
      title: "Move events and tasks",
      intro: "Move the selected item by a day or fifteen minutes in Day or Week view on Mac.",
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
