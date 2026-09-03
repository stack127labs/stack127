import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["macos"] as const;

const mac = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [
    {
      platform: "macos",
      keys,
      ...(alternatives ? { alternatives } : {}),
      ...(note ? { note } : {}),
    },
  ],
});

export const safari: AppShortcuts = {
  slug: "safari",
  name: "Safari",
  category: "Web browser",
  platforms: [...platforms],
  intro:
    "Safari's Mac User Guide lists keyboard commands for scrolling, webpage fields, tabs, history, downloads, reading lists, bookmarks, zoom, and windows. This reference keeps keyboard actions separate from the guide's pointer gestures.",
  versionContext:
    "Apple's Safari User Guide for Mac checked September 1, 2026. Apple notes that shortcuts can vary with language and keyboard layout, so the Safari menus remain the authority when a local layout changes a key.",
  sourceUrl: "https://support.apple.com/en-az/guide/safari/cpsh003/mac",
  sourceLabel: "official Safari keyboard shortcuts and gestures",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "scroll-and-page",
      title: "Scrolling and webpage",
      intro: "Scroll the active page, search it, focus form controls, and use Safari's standard clipboard and print commands.",
      shortcuts: [
        mac("scroll", "Scroll up, down, left, or right", ["Arrow keys"]),
        mac("scroll-large", "Scroll in larger increments", ["Option", "Arrow keys"]),
        mac("page-down", "Scroll down one screen", ["Page Down"], [["Space"]]),
        mac("page-up", "Scroll up one screen", ["Page Up"], [["Shift", "Space"]]),
        mac("page-top-left", "Scroll to the top-left of the webpage", ["Cmd", "Up Arrow"]),
        mac("page-bottom-left", "Scroll to the bottom-left of the webpage", ["Cmd", "Down Arrow"]),
        mac("find-page", "Search the current webpage", ["Cmd", "F"]),
        mac("next-field", "Highlight the next field or pop-up menu", ["Tab"]),
        mac("next-clickable", "Highlight the next field, pop-up menu, or clickable item", ["Option", "Tab"]),
        mac("restore-address", "Restore the current webpage address while typing in Smart Search", ["Escape"]),
        mac("smart-search", "Select the Smart Search field", ["Cmd", "L"]),
        mac("print", "Print the current webpage", ["Cmd", "P"]),
        mac("copy", "Copy the selected item", ["Cmd", "C"]),
        mac("paste", "Paste the most recently copied item", ["Cmd", "V"]),
      ],
    },
    {
      id: "tabs",
      title: "Tabs",
      intro: "Open, switch, select, close, and restore Safari tabs with the Mac tab commands in Apple's current guide.",
      shortcuts: [
        mac("tab-overview", "Show tab overview", ["Shift", "Cmd", "\\"]),
        mac("new-tab", "Open a webpage in a new tab from Smart Search", ["Cmd", "Return"]),
        mac("next-tab", "Go to the next tab", ["Control", "Tab"], [["Shift", "Cmd", "]"]]),
        mac("previous-tab", "Go to the previous tab", ["Control", "Shift", "Tab"], [["Shift", "Cmd", "["]]),
        mac("tab-1", "Select tab 1", ["Cmd", "1"]),
        mac("tab-2", "Select tab 2", ["Cmd", "2"]),
        mac("tab-3", "Select tab 3", ["Cmd", "3"]),
        mac("tab-4", "Select tab 4", ["Cmd", "4"]),
        mac("tab-5", "Select tab 5", ["Cmd", "5"]),
        mac("tab-6", "Select tab 6", ["Cmd", "6"]),
        mac("tab-7", "Select tab 7", ["Cmd", "7"]),
        mac("tab-8", "Select tab 8", ["Cmd", "8"]),
        mac("last-tab", "Select the last tab", ["Cmd", "9"]),
        mac("close-tab", "Close the active tab", ["Cmd", "W"]),
        mac("reopen-tab", "Reopen the last tab you closed", ["Shift", "Cmd", "T"]),
      ],
    },
    {
      id: "settings-history-and-zoom",
      title: "Settings, history, and zoom",
      intro: "Open Safari settings, move through browsing history, and change website zoom from the browser keyboard.",
      shortcuts: [
        mac("homepage", "Go to the homepage", ["Shift", "Cmd", "H"]),
        mac("settings", "Open Safari settings", ["Cmd", ","]),
        mac("back", "Go back to the previous webpage", ["Cmd", "["]),
        mac("forward", "Go forward to the next webpage", ["Cmd", "]"]),
        mac("exit-fullscreen", "Exit full-screen view", ["Escape"]),
        mac("zoom-in", "Zoom website content in", ["Cmd", "+"]),
        mac("zoom-out", "Zoom website content out", ["Cmd", "-"]),
      ],
    },
    {
      id: "window-and-reading-list",
      title: "Windows and reading list",
      intro: "Switch Safari windows and manage the Reading List sidebar, current page, reader view, and reader exit state.",
      shortcuts: [
        mac("next-window", "Switch to another Safari window", ["Cmd", "`"]),
        mac("reopen-window", "Reopen the last window you closed", ["Shift", "Cmd", "T"]),
        mac("reading-list-sidebar", "Show or hide the Reading List sidebar", ["Control", "Cmd", "2"]),
        mac("add-reading-list", "Add the current webpage to Reading List", ["Shift", "Cmd", "D"]),
        mac("reader", "Open Reader", ["Shift", "Cmd", "R"]),
        mac("close-reader", "Close Reader", ["Escape"]),
      ],
    },
    {
      id: "bookmarks",
      title: "Bookmarks",
      intro: "Navigate the bookmarks sidebar and edit selected bookmark names with the keyboard commands Apple documents.",
      shortcuts: [
        mac("bookmarks-sidebar", "Show or hide the Bookmarks sidebar", ["Control", "Cmd", "1"]),
        mac("next-bookmark", "Select the next bookmark or folder", ["Down Arrow"], [["Up Arrow"]]),
        mac("open-bookmark", "Open the selected bookmark", ["Space"]),
        mac("open-folder", "Open the selected folder", ["Space"], [["Right Arrow"]]),
        mac("close-folder", "Close the selected folder", ["Space"], [["Left Arrow"]]),
        mac("edit-bookmark", "Edit a selected bookmark name", ["Return"]),
        mac("cancel-bookmark-edit", "Cancel editing a bookmark name", ["Escape"]),
        mac("finish-bookmark-edit", "Finish editing a bookmark name", ["Return"]),
      ],
    },
  ],
};

export default safari;
