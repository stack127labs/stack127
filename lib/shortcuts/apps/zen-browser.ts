import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "linux"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, linux: keys }),
  ...(note ? { note } : {}),
});

export const zenBrowser: AppShortcuts = {
  slug: "zen-browser",
  name: "Zen Browser",
  category: "Web browser",
  platforms: [...platforms],
  intro:
    "Zen Browser publishes a current desktop shortcut reference for compact mode, workspaces, split views, tabs, navigation, search, pages, and developer tools.",
  versionContext:
    "Zen Browser shortcut reference checked September 1, 2026. The published table uses Ctrl and Alt notation and does not provide a separate macOS table, so this record covers Windows and Linux only.",
  sourceUrl: "https://docs.zen-browser.app/user-manual/shortcuts",
  sourceLabel: "official Zen Browser shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "zen-layout",
      title: "Zen layout",
      intro: "Switch compact browser controls, workspaces, and split views.",
      shortcuts: [
        shared("floating-toolbar", "Toggle the floating toolbar", ["Alt", "Ctrl", "T"]),
        shared("floating-sidebar", "Toggle the floating sidebar", ["Alt", "Ctrl", "S"]),
        shared("compact-mode", "Toggle compact mode", ["Alt", "Ctrl", "C"]),
        shared("workspace-back", "Move to the previous workspace", ["Alt", "Ctrl", "Q"]),
        shared("workspace-forward", "Move to the next workspace", ["Alt", "Ctrl", "E"]),
        shared("unsplit", "Unsplit the current view", ["Alt", "Ctrl", "U"]),
        shared("split-horizontal", "Split horizontally", ["Alt", "Ctrl", "H"]),
        shared("split-vertical", "Split vertically", ["Alt", "Ctrl", "V"]),
        shared("split-grid", "Use grid split view", ["Alt", "Ctrl", "G"]),
      ],
    },
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Create, close, restore, and move between Zen Browser tabs and windows.",
      shortcuts: [
        shared("new-window", "Open a new window", ["Ctrl", "N"]),
        shared("new-tab", "Open a new tab", ["Ctrl", "T"]),
        shared("close-tab", "Close the current tab", ["Ctrl", "W"]),
        shared("close-window", "Close the current window", ["Shift", "Ctrl", "W"]),
        shared("quit", "Quit Zen Browser", ["Ctrl", "Q"]),
        shared("restore-tab", "Restore the last closed tab", ["Shift", "Ctrl", "T"]),
        shared("undo-window", "Restore the last closed window", ["Shift", "Ctrl", "N"]),
        shared("next-tab", "Move to the next tab", ["Ctrl", "Tab"]),
        shared("previous-tab", "Move to the previous tab", ["Ctrl", "Shift", "Tab"]),
        shared("tab-one", "Select tab one", ["Alt", "1"]),
        shared("tab-eight", "Select tab eight", ["Alt", "8"]),
        shared("last-tab", "Select the last tab", ["Alt", "9"]),
      ],
    },
    {
      id: "navigation-and-search",
      title: "Navigation and search",
      intro: "Move through browser history, focus search fields, and reload pages.",
      shortcuts: [
        shared("back", "Go back", ["Alt", "Left Arrow"], "Ctrl+[ is also listed for this action."),
        shared("forward", "Go forward", ["Alt", "Right Arrow"], "Ctrl+] is also listed for this action."),
        shared("home", "Open the home page", ["Alt", "Home"]),
        shared("reload", "Reload the page", ["Ctrl", "R"]),
        shared("reload-no-cache", "Reload while bypassing the cache", ["Shift", "Ctrl", "R"]),
        shared("history", "Open browsing history", ["Ctrl", "H"]),
        shared("private-window", "Open a private window", ["Shift", "Ctrl", "P"]),
        shared("focus-search", "Focus the main search field", ["Ctrl", "K"]),
        shared("alternate-search", "Focus the alternate search field", ["Ctrl", "J"]),
        shared("find", "Find text on the page", ["Ctrl", "F"]),
        shared("find-next", "Find the next result", ["Ctrl", "G"]),
        shared("find-previous", "Find the previous result", ["Shift", "Ctrl", "G"]),
      ],
    },
    {
      id: "page-and-tools",
      title: "Page and developer tools",
      intro: "Save, print, inspect, and change the current page with Zen's published browser commands.",
      shortcuts: [
        shared("location", "Focus the location bar", ["Ctrl", "L"]),
        shared("alternate-location", "Focus the alternate location bar", ["Alt", "D"]),
        shared("save-page", "Save the page", ["Ctrl", "S"]),
        shared("print", "Print the page", ["Ctrl", "P"]),
        shared("reader", "Open reader view", ["Alt", "Ctrl", "R"]),
        shared("picture-in-picture", "Toggle picture-in-picture", ["Shift", "Ctrl", "]"]),
        shared("view-source", "View page source", ["Ctrl", "U"]),
        shared("page-info", "Open page information", ["Ctrl", "["]),
        shared("mute", "Mute the current tab", ["Ctrl", "M"]),
        shared("zoom-in", "Zoom in", ["Ctrl", "+"]),
        shared("zoom-out", "Zoom out", ["Ctrl", "-"]),
        shared("zoom-reset", "Reset page zoom", ["Ctrl", "0"]),
        shared("screenshot", "Take a screenshot", ["Shift", "Ctrl", "S"]),
        shared("devtools", "Open developer tools", ["Shift", "Ctrl", "I"]),
        shared("console", "Open the browser console", ["Shift", "Ctrl", "J"]),
        shared("responsive", "Open responsive design mode", ["Shift", "Ctrl", "M"]),
        shared("inspector", "Open the Inspector", ["Shift", "Ctrl", "L"]),
        shared("downloads", "Open downloads", ["Shift", "Ctrl", "Y"]),
        shared("addons", "Open add-ons", ["Shift", "Ctrl", "A"]),
        shared("stop", "Stop loading the page", ["Escape"]),
      ],
    },
  ],
};

export default zenBrowser;
