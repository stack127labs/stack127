import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const browser = (id: string, action: string, windowsLinux: string[], mac: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: windowsLinux, linux: windowsLinux, macos: mac }),
  ...(note ? { note } : {}),
});

export const opera: AppShortcuts = {
  slug: "opera",
  name: "Opera",
  category: "Web browser",
  platforms: [...platforms],
  versionContext:
    "Current Opera desktop shortcuts checked September 1, 2026. The official page covers macOS and Windows/Linux defaults and notes that shortcuts can be customized under Settings > Browser > Shortcuts.",
  sourceUrl: "https://help.opera.com/en/latest/shortcuts/",
  sourceLabel: "official Opera shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "commands",
      title: "Browser commands",
      intro: "Open browser pages, focus the address bar, print, save, and change Opera settings with these command shortcuts.",
      shortcuts: [
        browser("downloads", "Open the Downloads page", ["Ctrl", "J"], ["Cmd", "J"]),
        browser("extensions", "Open the Extensions page", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        browser("history", "Open History", ["Ctrl", "H"], ["Cmd", "Shift", "H"]),
        browser("open-file", "Open a local file", ["Ctrl", "O"], ["Cmd", "O"]),
        browser("address-bar", "Focus the address bar", ["Ctrl", "L"], ["Cmd", "L"]),
        browser("settings", "Open Settings", ["Alt", "P"], ["Cmd", ","]),
        browser("print", "Print the current page", ["Ctrl", "P"], ["Cmd", "P"]),
        browser("save", "Save the page locally", ["Ctrl", "S"], ["Cmd", "S"]),
        browser("quit", "Quit Opera", ["Ctrl", "Shift", "X"], ["Cmd", "Q"]),
        browser("help", "Open Opera help", ["F1"], ["F1"], "The official table lists F1 for Windows/Linux; macOS users can use the Help menu."),
      ],
    },
    {
      id: "find",
      title: "Find on a page",
      intro: "Search visible page text and move through matching results without leaving the current page.",
      shortcuts: [
        browser("find", "Find text on the page", ["Ctrl", "F"], ["Cmd", "F"]),
        browser("find-next", "Find the next match", ["Ctrl", "G"], ["Cmd", "G"]),
        browser("find-previous", "Find the previous match", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
      ],
    },
    {
      id: "navigation",
      title: "Page navigation",
      intro: "Move through focusable page controls, history, and the current page with these navigation commands.",
      shortcuts: [
        browser("next-element", "Cycle forward through page elements", ["Tab"], ["Tab"]),
        browser("previous-element", "Cycle backward through page elements", ["Shift", "Tab"], ["Shift", "Tab"]),
        browser("back", "Go back one page", ["Alt", "Left"], ["Cmd", "Left"]),
        browser("forward", "Go forward one page", ["Alt", "Right"], ["Cmd", "Right"]),
        browser("top", "Go to the top of the page", ["Home"], ["Cmd", "Up"]),
        browser("bottom", "Go to the bottom of the page", ["End"], ["Cmd", "Down"]),
        browser("page-down", "Page down", ["Space"], ["Space"]),
        browser("page-up", "Page up", ["Shift", "Space"], ["Shift", "Space"]),
        browser("reload", "Reload the current page", ["Ctrl", "R"], ["Cmd", "R"]),
        browser("source", "View the current page source", ["Ctrl", "U"], ["Cmd", "U"]),
      ],
    },
  ],
};

export default opera;
