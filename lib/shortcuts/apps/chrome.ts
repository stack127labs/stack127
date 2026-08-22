import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const chrome: AppShortcuts = {
  slug: "chrome",
  name: "Google Chrome",
  category: "Web browser",
  platforms: [...platforms],
  intro:
    "Chrome's shortcuts fall into a few habits worth keeping: manage tabs, move through history, search the current page, and reach bookmarks, downloads, and developer tools quickly.",
  versionContext: "Documented defaults from Google's Chrome Help in August 2026.",
  sourceUrl: "https://support.google.com/chrome/answer/157179",
  sourceLabel: "official Chrome keyboard shortcuts",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "tabs",
      title: "Tabs and windows",
      intro: "Open, close, restore, reorder, and move between Chrome tabs and windows.",
      shortcuts: [
        { id: "new-tab", action: "New tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        {
          id: "new-window",
          action: "New window",
          keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]),
        },
        {
          id: "private-window",
          action: "New Incognito window",
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
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Tab"],
            macos: ["Ctrl", "Tab"],
            linux: ["Ctrl", "Tab"],
          }),
          note: "Ctrl+PgDn also works; Ctrl+Shift+Tab goes the other way.",
        },
        {
          id: "jump-to-tab",
          action: "Jump to a specific tab",
          keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]),
          note: "Ctrl+1 through Ctrl+8 pick tabs by position; Ctrl+9 jumps to the last tab.",
        },
        {
          id: "close-tab",
          action: "Close current tab",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "W"],
            macos: ["Cmd", "W"],
            linux: ["Ctrl", "W"],
          }),
          note: "Ctrl+F4 also closes on Windows and Linux.",
        },
        {
          id: "close-window",
          action: "Close current window",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "W"],
            macos: ["Cmd", "Shift", "W"],
            linux: ["Ctrl", "Shift", "W"],
          }),
        },
        {
          id: "previous-tab",
          action: "Previous open tab",
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
          id: "move-tab",
          action: "Move the current tab left or right",
          keys: combo(platforms, ["Ctrl", "Shift", "PgUp"], ["Ctrl", "Shift", "PgUp"]),
          note: "Use PgDn instead of PgUp to move it right.",
        },
        {
          id: "fullscreen",
          action: "Toggle full-screen mode",
          keys: perPlatform(platforms, {
            windows: ["F11"],
            macos: ["Fn", "F"],
            linux: ["F11"],
          }),
        },
        {
          id: "minimize-window",
          action: "Minimize the current window",
          keys: perPlatform(platforms, { windows: ["Alt", "Space", "N"], macos: ["Cmd", "M"], linux: ["Alt", "Space", "N"] }),
        },
        {
          id: "maximize-window",
          action: "Maximize the current window",
          keys: perPlatform(platforms, { windows: ["Alt", "Space", "X"], linux: ["Alt", "Space", "X"] }),
        },
        {
          id: "quit",
          action: "Quit Chrome",
          keys: perPlatform(platforms, { windows: ["Alt", "F", "X"], macos: ["Cmd", "Q"], linux: ["Alt", "F", "X"] }),
        },
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "Move through browsing history, reload a page, or leave a page that is still loading.",
      shortcuts: [
        {
          id: "back",
          action: "Previous page in history",
          keys: perPlatform(platforms, {
            windows: ["Alt", "Left"],
            macos: ["Cmd", "["],
            linux: ["Alt", "Left"],
          }),
        },
        {
          id: "forward",
          action: "Next page in history",
          keys: perPlatform(platforms, {
            windows: ["Alt", "Right"],
            macos: ["Cmd", "]"],
            linux: ["Alt", "Right"],
          }),
        },
        {
          id: "reload",
          action: "Reload the page",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "R"],
            macos: ["Cmd", "R"],
            linux: ["Ctrl", "R"],
          }),
          note: "F5 also reloads on Windows and Linux.",
        },
        {
          id: "hard-reload",
          action: "Reload ignoring cached content",
          keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        },
        { id: "stop-loading", action: "Stop the page from loading", keys: combo(platforms, ["Esc"]) },
        {
          id: "home-page",
          action: "Open your home page in the current tab",
          keys: perPlatform(platforms, {
            windows: ["Alt", "Home"],
            macos: ["Cmd", "Shift", "H"],
            linux: ["Alt", "Home"],
          }),
        },
      ],
    },
    {
      id: "address-bar",
      title: "Address bar",
      intro: "Focus the omnibox, search with another engine, and change its suggestions without touching the mouse.",
      shortcuts: [
        {
          id: "focus-address-bar",
          action: "Jump to the address bar",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "L"],
            macos: ["Cmd", "L"],
            linux: ["Ctrl", "L"],
          }),
          note: "F6 or Alt+D also work on Windows and Linux.",
        },
        {
          id: "search-engine",
          action: "Search with your default search engine",
          keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]),
          note: "Ctrl+E does the same.",
        },
        {
          id: "add-www-com",
          action: "Add www. and .com to a site name and open it",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
          note: "Type the site name first, then press the chord.",
        },
        {
          id: "address-bar-new-window",
          action: "Open the typed address in a new window",
          keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]),
          note: "Type a site name in the address bar first.",
        },
        {
          id: "address-bar-new-tab",
          action: "Open the typed address in a new tab",
          keys: combo(platforms, ["Alt", "Enter"], ["Cmd", "Enter"]),
          note: "Type a search or address in the address bar first.",
        },
        {
          id: "remove-prediction",
          action: "Remove a highlighted address-bar prediction",
          keys: combo(platforms, ["Down", "Shift", "Delete"]),
        },
      ],
    },
    {
      id: "page",
      title: "Bookmarks and page",
      intro: "Find text, print or save the page, change its zoom, and manage bookmarks or developer tools.",
      shortcuts: [
        {
          id: "find",
          action: "Find on page",
          keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]),
        },
        {
          id: "bookmark",
          action: "Bookmark the current page",
          keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]),
        },
        {
          id: "bookmarks-bar",
          action: "Show or hide the bookmarks bar",
          keys: combo(platforms, ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]),
        },
        {
          id: "history",
          action: "Open the History page",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "H"],
            macos: ["Cmd", "Y"],
            linux: ["Ctrl", "H"],
          }),
        },
        {
          id: "downloads",
          action: "Open the Downloads page",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "J"],
            macos: ["Cmd", "Shift", "J"],
            linux: ["Ctrl", "J"],
          }),
        },
        {
          id: "devtools",
          action: "Open Developer Tools",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Shift", "I"],
            macos: ["Cmd", "Option", "I"],
            linux: ["Ctrl", "Shift", "I"],
          }),
          note: "F12 also works on Windows and Linux.",
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
          id: "open-file",
          action: "Open a file from the computer",
          keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]),
        },
        {
          id: "view-source",
          action: "View the page source",
          keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "Option", "U"]),
        },
        {
          id: "zoom-in",
          action: "Make everything bigger",
          keys: combo(platforms, ["Ctrl", "+"], ["Cmd", "+"]),
        },
        {
          id: "zoom-out",
          action: "Make everything smaller",
          keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]),
        },
        {
          id: "zoom-reset",
          action: "Return everything to the default size",
          keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]),
        },
        {
          id: "scroll-down",
          action: "Scroll down one screen",
          keys: combo(platforms, ["Space"]),
        },
        {
          id: "scroll-up",
          action: "Scroll up one screen",
          keys: combo(platforms, ["Shift", "Space"]),
        },
        {
          id: "top-of-page",
          action: "Go to the top of the page",
          keys: combo(platforms, ["Home"]),
        },
        {
          id: "bottom-of-page",
          action: "Go to the bottom of the page",
          keys: combo(platforms, ["End"]),
        },
        {
          id: "next-find-match",
          action: "Jump to the next find match",
          keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]),
        },
        {
          id: "previous-find-match",
          action: "Jump to the previous find match",
          keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        },
        {
          id: "word-back",
          action: "Move the cursor back one word in a text field",
          keys: perPlatform(platforms, { windows: ["Ctrl", "Left"], macos: ["Option", "Left"], linux: ["Ctrl", "Left"] }),
        },
        {
          id: "word-forward",
          action: "Move the cursor forward one word in a text field",
          keys: perPlatform(platforms, { windows: ["Ctrl", "Right"], macos: ["Option", "Right"], linux: ["Ctrl", "Right"] }),
        },
        {
          id: "delete-word",
          action: "Delete the previous word in a text field",
          keys: perPlatform(platforms, { windows: ["Ctrl", "Backspace"], macos: ["Option", "Delete"], linux: ["Ctrl", "Backspace"] }),
        },
      ],
    },
  ],
};
