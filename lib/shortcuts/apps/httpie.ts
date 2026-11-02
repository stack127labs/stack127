import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const httpie: AppShortcuts = {
  slug: "httpie",
  name: "HTTPie",
  category: "API client",
  platforms: [...platforms],
  versionContext:
    "HTTPie Desktop preview on macOS, Windows, and Linux. Some commands are desktop-only, and preview features may change.",
  sourceUrl: "https://httpie.io/docs/desktop/preview",
  sourceLabel: "official HTTPie Desktop keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "tabs-and-app",
      title: "Tabs and app",
      intro: "Open and close request tabs, switch between them, and reach HTTPie's library, settings, and AI prompt.",
      shortcuts: [
        { id: "new-tab", action: "Open a new tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "next-tab", action: "Select the next tab", keys: combo(platforms, ["Ctrl", "Tab"]).map((entry) => (entry.platform === "macos" ? { ...entry, alternatives: [["Shift", "Cmd", "}"]] } : entry)) },
        { id: "previous-tab", action: "Select the previous tab", keys: combo(platforms, ["Ctrl", "Shift", "Tab"]).map((entry) => (entry.platform === "macos" ? { ...entry, alternatives: [["Shift", "Cmd", "{"]] } : entry)) },
        { id: "tab-one", action: "Select tab one", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]) },
        { id: "tab-eight", action: "Select tab eight", keys: combo(platforms, ["Ctrl", "8"], ["Cmd", "8"]) },
        { id: "last-tab", action: "Select the last tab", keys: combo(platforms, ["Ctrl", "9"], ["Cmd", "9"]) },
        { id: "toggle-library", action: "Toggle the library", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]).map((entry) => (entry.platform === "macos" ? { ...entry, alternatives: [["Ctrl", "Cmd", "S"]] } : entry)) },
        { id: "settings", action: "Open settings", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "ai-prompt", action: "Open the AI prompt", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
      ],
    },
    {
      id: "request-editor",
      title: "Request editor",
      intro: "Focus the URL, send a request, and trigger autocomplete without leaving the HTTPie editor.",
      shortcuts: [
        { id: "url", action: "Focus the request URL", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "send", action: "Send the request", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]).map((entry) => ({ ...entry, alternatives: [[entry.platform === "macos" ? "Cmd" : "Ctrl", "R"]] })), note: "Ctrl+R or Cmd+R works in the desktop app only." },
        { id: "autocomplete", action: "Open autocomplete", keys: combo(platforms, ["Ctrl", "Space"]) },
      ],
    },
    {
      id: "editor-search",
      title: "Editor search",
      intro: "Find text in an editor or panel, filter its data, and move to the next or previous result.",
      shortcuts: [
        { id: "find", action: "Find in the editor", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "filter-search", action: "Open the data filter", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]) },
        { id: "next-match", action: "Move to the next match", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "previous-match", action: "Move to the previous match", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
        { id: "next-match-enter", action: "Move to the next match from search", keys: combo(platforms, ["Enter"]) },
        { id: "previous-match-enter", action: "Move to the previous match from search", keys: combo(platforms, ["Shift", "Enter"]) },
      ],
    },
  ],
};

export default httpie;
