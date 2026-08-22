import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const firefox: AppShortcuts = {
  slug: "firefox",
  name: "Mozilla Firefox",
  category: "Web browser",
  platforms: [...platforms],
  intro:
    "Firefox puts the everyday browser loop into four places: moving through history, managing tabs, finding things on a page, and reaching bookmarks or browser tools.",
  versionContext: "Documented defaults from Mozilla Support in August 2026.",
  sourceUrl: "https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly",
  sourceLabel: "official Firefox keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Move through history, open files, reload or stop a page, and jump to the start or end of a document.",
      shortcuts: [
        {
          id: "back",
          action: "Back",
          keys: perPlatform(platforms, {
            windows: ["Alt", "Left"],
            macos: ["Cmd", "["],
            linux: ["Alt", "Left"],
          }),
        },
        {
          id: "forward",
          action: "Forward",
          keys: perPlatform(platforms, {
            windows: ["Alt", "Right"],
            macos: ["Cmd", "]"],
            linux: ["Alt", "Right"],
          }),
        },
        {
          id: "reload",
          action: "Reload",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "R"],
            macos: ["Cmd", "R"],
            linux: ["Ctrl", "R"],
          }),
          note: "F5 also reloads on Windows and Linux.",
        },
        {
          id: "hard-reload",
          action: "Reload overriding the cache",
          keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        },
        { id: "stop", action: "Stop loading", keys: combo(platforms, ["Esc"]) },
        {
          id: "open-file",
          action: "Open a file",
          keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]),
        },
        { id: "home", action: "Home page", keys: perPlatform(platforms, {
          windows: ["Alt", "Home"],
          macos: ["Option", "Home"],
          linux: ["Alt", "Home"],
        }) },
        {
          id: "top-of-page",
          action: "Go to the top of the page",
          keys: perPlatform(platforms, { windows: ["Home"], macos: ["Cmd", "Up"], linux: ["Home"] }),
        },
        {
          id: "bottom-of-page",
          action: "Go to the bottom of the page",
          keys: perPlatform(platforms, { windows: ["End"], macos: ["Cmd", "Down"], linux: ["End"] }),
        },
      ],
    },
    {
      id: "tabs",
      title: "Tabs and windows",
      intro: "Open, close, restore, switch, and move tabs or windows while keeping the browser focused.",
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
          keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        },
        {
          id: "reopen-tab",
          action: "Reopen the last closed tab or window",
          keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
        },
        {
          id: "next-tab",
          action: "Next tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Tab"],
            macos: ["Ctrl", "Tab"],
            linux: ["Ctrl", "Tab"],
          }),
          note: "Ctrl+PgDn also works; Ctrl+Shift+Tab goes the other way.",
        },
        {
          id: "jump-to-tab",
          action: "Jump to tab by position",
          keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]),
          note: "1 through 8 pick tabs by position; 9 jumps to the last tab.",
        },
        {
          id: "close-tab",
          action: "Close tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "W"],
            macos: ["Cmd", "W"],
            linux: ["Ctrl", "W"],
          }),
        },
        {
          id: "previous-tab",
          action: "Previous tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "Tab"],
            macos: ["Cmd", "Option", "Left"],
            linux: ["Ctrl", "Shift", "Tab"],
          }),
        },
        {
          id: "last-tab",
          action: "Jump to the last tab",
          keys: combo(platforms, ["Ctrl", "9"], ["Cmd", "9"]),
        },
        {
          id: "close-window",
          action: "Close the current window",
          keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "W"], macos: ["Cmd", "Shift", "W"], linux: ["Ctrl", "Shift", "W"] }),
        },
      ],
    },
    {
      id: "find-and-page",
      title: "Find and page",
      intro: "Find text, move through matches, print or save the page, zoom it, and move through links or fields.",
      shortcuts: [
        {
          id: "find",
          action: "Find in page",
          keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]),
        },
        {
          id: "find-next",
          action: "Find again",
          keys: perPlatform(platforms, {
            windows: ["F3"],
            macos: ["Cmd", "G"],
            linux: ["F3"],
          }),
        },
        {
          id: "quick-find-link",
          action: "Quick find within link text only",
          keys: combo(platforms, ["'"]),
        },
        {
          id: "zoom-in",
          action: "Zoom in",
          keys: combo(platforms, ["Ctrl", "+"], ["Cmd", "+"]),
        },
        {
          id: "zoom-reset",
          action: "Reset zoom level",
          keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]),
        },
        {
          id: "print",
          action: "Print the current page",
          keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]),
        },
        {
          id: "save-page",
          action: "Save the current page",
          keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]),
        },
        {
          id: "page-down",
          action: "Move down one screen",
          keys: combo(platforms, ["PageDown"]),
        },
        {
          id: "page-up",
          action: "Move up one screen",
          keys: combo(platforms, ["PageUp"]),
        },
      ],
    },
    {
      id: "bookmarks-and-tools",
      title: "Bookmarks and tools",
      intro: "Reach bookmarks, history, downloads, developer tools, and the browser's built-in utilities.",
      shortcuts: [
        {
          id: "bookmark",
          action: "Bookmark the current page",
          keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]),
        },
        {
          id: "all-bookmarks",
          action: "Show all bookmarks (Library)",
          keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]),
        },
        {
          id: "history",
          action: "Show all history (Library)",
          keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]),
        },
        {
          id: "downloads",
          action: "Show downloads",
          keys: combo(platforms, ["Ctrl", "J"], ["Cmd", "J"]),
        },
        {
          id: "devtools",
          action: "Toggle Developer Tools",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "I"],
            macos: ["Cmd", "Option", "I"],
            linux: ["Ctrl", "Shift", "I"],
          }),
        },
        {
          id: "clear-data",
          action: "Clear recent data",
          keys: combo(platforms, ["Ctrl", "Shift", "Delete"], ["Cmd", "Shift", "Delete"]),
        },
      ],
    },
    {
      id: "editing-and-search",
      title: "Editing and search",
      intro: "Use the browser's text controls and search field without confusing them with page navigation.",
      shortcuts: [
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "select-all", action: "Select all text or items", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "find-next-match", action: "Find the next match", keys: perPlatform(platforms, { windows: ["Ctrl", "G"], macos: ["Cmd", "G"], linux: ["Ctrl", "G"] }) },
        { id: "find-previous-match", action: "Find the previous match", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "G"], macos: ["Cmd", "Shift", "G"], linux: ["Ctrl", "Shift", "G"] }) },
      ],
    },
    {
      id: "developer-and-media",
      title: "Developer and media",
      intro: "Reach Firefox's developer tools, page source, and media controls when the page needs more than browsing.",
      shortcuts: [
        { id: "view-source", action: "View page source", keys: perPlatform(platforms, { windows: ["Ctrl", "U"], macos: ["Cmd", "Option", "U"], linux: ["Ctrl", "U"] }) },
        { id: "web-console", action: "Open the Web Console", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "K"], macos: ["Cmd", "Option", "K"], linux: ["Ctrl", "Shift", "K"] }) },
        { id: "inspector", action: "Open the Inspector", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "C"], macos: ["Cmd", "Option", "C"], linux: ["Ctrl", "Shift", "C"] }) },
        { id: "media-play-pause", action: "Play or pause media", keys: combo(platforms, ["Space"]) },
      ],
    },
  ],
};
