import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const brave: AppShortcuts = {
  slug: "brave",
  name: "Brave Browser",
  category: "Web browser",
  platforms: [...platforms],
  intro:
    "Brave keeps the useful browser controls close to the keyboard: move across tabs, jump to the address bar, search a page, or open the browser tools without leaving the current window.",
  versionContext:
    "Documented defaults from the Brave Help Center in August 2026. Shortcuts can be customized in Settings, System, Shortcuts.",
  sourceUrl: "https://support.brave.com/hc/en-us/articles/360032272171-What-keyboard-shortcuts-can-I-use-in-Brave",
  sourceLabel: "official Brave keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Create, close, restore, and move between tabs or windows without losing the page you are reading.",
      shortcuts: [
        { id: "new-tab", action: "New tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        {
          id: "new-window",
          action: "New window",
          keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]),
        },
        {
          id: "private-window",
          action: "New private window",
          keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]),
        },
        {
          id: "reopen-tab",
          action: "Reopen the last closed tab",
          keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
        },
        {
          id: "next-tab",
          action: "Next open tab",
          keys: combo(platforms, ["Ctrl", "Tab"]),
          note: "Ctrl+PgDn also works; Ctrl+Shift+Tab goes the other way.",
        },
        {
          id: "jump-to-tab",
          action: "Jump to a specific tab",
          keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]),
          note: "1 through 8 pick tabs by position; 9 jumps to the last tab.",
        },
        {
          id: "close-tab",
          action: "Close the current tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "W"],
            macos: ["Cmd", "W"],
            linux: ["Ctrl", "W"],
          }),
        },
        {
          id: "close-window",
          action: "Close the current window",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "W"],
            macos: ["Cmd", "Shift", "W"],
            linux: ["Ctrl", "Shift", "W"],
          }),
        },
      ],
    },
    {
      id: "browser-tools",
      title: "Browser tools",
      intro: "Open downloads, history, bookmarks, developer tools, and Brave's task manager from the current window.",
      shortcuts: [
        {
          id: "bookmarks-bar",
          action: "Show or hide the bookmarks bar",
          keys: combo(platforms, ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]),
        },
        {
          id: "bookmark-manager",
          action: "Open the Bookmark Manager",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "O"],
            macos: ["Cmd", "Option", "B"],
            linux: ["Ctrl", "Shift", "O"],
          }),
        },
        {
          id: "history",
          action: "Open the History page in a new tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "H"],
            macos: ["Cmd", "Y"],
            linux: ["Ctrl", "H"],
          }),
        },
        {
          id: "downloads",
          action: "Open the Downloads page in a new tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "J"],
            macos: ["Cmd", "Shift", "J"],
            linux: ["Ctrl", "J"],
          }),
        },
        {
          id: "task-manager",
          action: "Open the Brave Task Manager",
          keys: perPlatform(platforms, {
            windows: ["Shift", "Esc"],
            macos: ["Option", "Cmd", "Esc"],
            linux: ["Shift", "Esc"],
          }),
        },
        {
          id: "clear-data",
          action: "Open the Clear Browsing Data options",
          keys: combo(platforms, ["Ctrl", "Shift", "Delete"], ["Cmd", "Shift", "Delete"]),
        },
      ],
    },
    {
      id: "address-bar",
      title: "Address bar and find",
      intro: "Jump to the address bar or find text on the current page, then move between matches.",
      shortcuts: [
        {
          id: "focus-address-bar",
          action: "Jump to the address bar",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "L"],
            macos: ["Cmd", "L"],
            linux: ["Ctrl", "L"],
          }),
          note: "Alt+D also works on Windows and Linux.",
        },
        {
          id: "search",
          action: "Search from anywhere on the page",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "K"],
            macos: ["Cmd", "K"],
            linux: ["Ctrl", "K"],
          }),
          note: "Ctrl+E does the same on Windows and Linux.",
        },
        {
          id: "find",
          action: "Open the Find Bar for the current page",
          keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]),
          note: "F3 also works on Windows and Linux.",
        },
        {
          id: "find-next",
          action: "Jump to the next Find Bar match",
          keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]),
        },
      ],
    },
    {
      id: "webpage",
      title: "Webpage",
      intro: "Print, save, zoom, reload, and move through links or form controls on the page.",
      shortcuts: [
        {
          id: "reload",
          action: "Reload the current page",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "R"],
            macos: ["Cmd", "R"],
            linux: ["Ctrl", "R"],
          }),
        },
        {
          id: "hard-reload",
          action: "Reload ignoring cached content",
          keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        },
        { id: "stop-loading", action: "Stop the page loading", keys: combo(platforms, ["Esc"]) },
        {
          id: "print",
          action: "Print options for the current page",
          keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]),
        },
        {
          id: "save-page",
          action: "Save the current page",
          keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]),
        },
        {
          id: "devtools",
          action: "Open Developer Tools",
          keys: perPlatform(platforms, {
            windows: ["F12"],
            macos: ["Cmd", "Option", "I"],
            linux: ["F12"],
          }),
        },
      ],
    },
  ],
};
