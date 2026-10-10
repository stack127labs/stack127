import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const windowsOnly = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys }],
  ...(note ? { note } : {}),
});

export const microsoftEdge: AppShortcuts = {
  slug: "microsoft-edge",
  name: "Microsoft Edge",
  category: "Web browser",
  platforms: [...platforms],
  versionContext:
    "Current Microsoft Edge desktop shortcuts checked September 1, 2026. The official table has separate Windows and Mac columns; some commands depend on the page type, such as PDF viewing, and extensions can add conflicts.",
  sourceUrl: "https://support.microsoft.com/en-US/edge/keyboard-shortcuts-in-microsoft-edge",
  sourceLabel: "official Microsoft Edge keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Create, close, restore, duplicate, and move between Edge tabs and windows.",
      shortcuts: [
        pair("new-window", "Open a new window", ["Ctrl", "N"], ["Cmd", "N"]),
        pair("new-inprivate-window", "Open a new InPrivate window", ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]),
        pair("open-file", "Open a file from the computer", ["Ctrl", "O"], ["Cmd", "O"]),
        pair("new-tab", "Open a new tab", ["Ctrl", "T"], ["Cmd", "T"]),
        pair("reopen-tab", "Reopen the last closed tab", ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
        pair("close-tab", "Close the current tab", ["Ctrl", "W"], ["Cmd", "W"]),
        pair("close-window", "Close the current window", ["Ctrl", "Shift", "W"], ["Cmd", "Shift", "W"]),
        pair("duplicate-tab", "Duplicate the current tab", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        pair("next-tab", "Move to the next tab", ["Ctrl", "Tab"], ["Cmd", "Fn", "Down"]),
        pair("previous-tab", "Move to the previous tab", ["Ctrl", "Shift", "Tab"], ["Cmd", "Fn", "Up"]),
        pair("tab-1", "Switch to tab 1", ["Ctrl", "1"], ["Cmd", "1"]),
        pair("tab-2", "Switch to tab 2", ["Ctrl", "2"], ["Cmd", "2"]),
        pair("tab-3", "Switch to tab 3", ["Ctrl", "3"], ["Cmd", "3"]),
        pair("tab-4", "Switch to tab 4", ["Ctrl", "4"], ["Cmd", "4"]),
        pair("tab-5", "Switch to tab 5", ["Ctrl", "5"], ["Cmd", "5"]),
        pair("tab-6", "Switch to tab 6", ["Ctrl", "6"], ["Cmd", "6"]),
        pair("tab-7", "Switch to tab 7", ["Ctrl", "7"], ["Cmd", "7"]),
        pair("tab-8", "Switch to tab 8", ["Ctrl", "8"], ["Cmd", "8"]),
        pair("last-tab", "Switch to the last tab", ["Ctrl", "9"], ["Cmd", "9"]),
      ],
    },
    {
      id: "navigation-and-search",
      title: "Navigation and search",
      intro: "Focus the address bar, search the web or page, move through results, and revisit browsing history.",
      shortcuts: [
        pair("address-bar", "Focus the address bar", ["Alt", "D"], ["Cmd", "L"]),
        pair("search-address-bar", "Search from the address bar", ["Ctrl", "E"], ["Cmd", "Option", "F"]),
        pair("find-on-page", "Find text on the current page", ["Ctrl", "F"], ["Cmd", "F"]),
        pair("next-find-match", "Find the next match", ["Ctrl", "G"], ["Cmd", "G"]),
        pair("previous-find-match", "Find the previous match", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        pair("history", "Open browsing history", ["Ctrl", "H"], ["Cmd", "Y"]),
        pair("reload", "Reload the current page", ["Ctrl", "R"], ["Cmd", "R"]),
        pair("hard-reload", "Reload while ignoring cached content", ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        pair("back", "Go back", ["Alt", "Left"], ["Cmd", "["]),
        pair("forward", "Go forward", ["Alt", "Right"], ["Cmd", "]"]),
        pair("home", "Open the home page", ["Alt", "Home"], ["Cmd", "Shift", "H"]),
        pair("downloads", "Open downloads", ["Ctrl", "J"], ["Cmd", "Option", "L"]),
        pair("favorites", "Add the current page to favorites", ["Ctrl", "D"], ["Cmd", "D"]),
        pair("save-all-tabs", "Save all open tabs as favorites", ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]),
        pair("favorites-page", "Open the Favorites page", ["Ctrl", "Shift", "O"], ["Cmd", "Option", "B"]),
        pair("favorites-bar", "Show or hide the favorites bar", ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]),
        windowsOnly("focus-favorites-bar", "Focus the first item on the favorites bar", ["Alt", "Shift", "B"]),
        pair("search-sidebar", "Open sidebar search", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
      ],
    },
    {
      id: "page-tools",
      title: "Page tools and developer tools",
      intro: "Open page tools, inspect source, print or save a page, and reach Edge's developer tools.",
      shortcuts: [
        windowsOnly("menu", "Open the Edge menu", ["Alt", "E"]),
        pair("print", "Print the current page", ["Ctrl", "P"], ["Cmd", "P"]),
        windowsOnly("system-print", "Open system print", ["Ctrl", "Shift", "P"]),
        pair("save-page", "Save the current page", ["Ctrl", "S"], ["Cmd", "S"]),
        pair("view-source", "View page source", ["Ctrl", "U"], ["Cmd", "U"]),
        pair("read-aloud", "Start or stop Read aloud", ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]),
        pair("developer-tools", "Open developer tools", ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "C"]),
        pair("developer-console", "Open the developer console", ["Ctrl", "Shift", "J"], ["Cmd", "Option", "J"]),
        windowsOnly("feedback", "Send feedback", ["Alt", "Shift", "I"]),
        pair("focus-toolbar", "Focus the first item in the toolbar", ["Alt", "Shift", "T"], ["Cmd", "Option", "T"]),
        pair("mute-tab", "Mute or unmute the current tab", ["Ctrl", "M"], ["Ctrl", "M"]),
        pair("profile", "Open the profile menu", ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]),
        windowsOnly("collections", "Open Collections", ["Ctrl", "Shift", "Y"]),
        pair("clear-browsing-data", "Open the clear browsing data dialog", ["Ctrl", "Shift", "Delete"], ["Cmd", "Shift", "Delete"]),
        pair("escape", "Stop loading or close a dialog", ["Esc"], ["Esc"]),
      ],
    },
    {
      id: "zoom-and-pdf",
      title: "Zoom and PDF viewing",
      intro: "Change page zoom and use the shortcuts Edge exposes while a PDF is focused.",
      shortcuts: [
        pair("zoom-in", "Zoom in", ["Ctrl", "+"], ["Cmd", "+"]),
        pair("zoom-out", "Zoom out", ["Ctrl", "-"], ["Cmd", "-"]),
        pair("zoom-reset", "Reset zoom to 100 percent", ["Ctrl", "0"], ["Cmd", "0"]),
        pair("pdf-fit", "Fit a PDF to the page", ["Ctrl", "\\"], ["Cmd", "\\"]),
        pair("pdf-rotate-left", "Rotate a PDF left", ["Ctrl", "["], ["Cmd", "["]),
        pair("pdf-rotate-right", "Rotate a PDF right", ["Ctrl", "]"], ["Cmd", "]"]),
        windowsOnly("pdf-full-screen", "Enter PDF full-screen mode", ["Ctrl", "Shift", "F"]),
        pair("full-screen", "Toggle full-screen mode", ["F11"], ["Ctrl", "Cmd", "F"]),
        pair("immersive-reader", "Open Immersive Reader", ["F9"], ["F9"]),
        pair("scroll-down", "Scroll down one screen", ["Space"], ["Space"]),
        pair("scroll-up", "Scroll up one screen", ["Shift", "Space"], ["Shift", "Space"]),
      ],
    },
  ],
};

export default microsoftEdge;
