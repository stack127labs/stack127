import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [
    { platform: "windows", keys: windows },
    { platform: "macos", keys: macos },
  ],
  ...(note ? { note } : {}),
});

export const descript: AppShortcuts = {
  slug: "descript",
  name: "Descript",
  category: "Audio and video editing",
  platforms: [...platforms],
  versionContext:
    "Descript for Mac and Windows. Single-key shortcuts need the Script Editor with Write and Correct modes off.",
  sourceUrl: "https://help.descript.com/descript-tour/keyboard-shortcuts",
  sourceLabel: "Descript keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "tools",
      title: "Editing tools",
      intro: "These single-key tools work in the Script Editor when Write and Correct modes are off.",
      shortcuts: [
        shared("select", "Select", ["A"]),
        shared("range", "Range", ["R"]),
        shared("blade", "Blade", ["B"]),
        shared("hand", "Hand", ["H"]),
        shared("slip", "Slip", ["Y"]),
      ],
    },
    {
      id: "commands-and-view",
      title: "Commands and view",
      intro: "Open Descript commands and the shortcut list, then change the project editor layout.",
      shortcuts: [
        pair("open-shortcuts", "Open the keyboard shortcut list", ["Ctrl", "Alt", "K"], ["Option", "Cmd", "K"]),
        pair("action-bar", "Open the action bar", ["Ctrl", "K"], ["Cmd", "K"]),
        pair("toggle-timeline", "Show or hide the timeline", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
      ],
    },
    {
      id: "script-editing",
      title: "Script editing",
      intro: "Correction commands act on selected transcript text or the focused script editor.",
      shortcuts: [
        pair("correct-mode", "Enter or exit Correct mode", ["Alt", "C"], ["Option", "C"]),
        shared("correct-word", "Correct the selected text", ["C"], "Highlight text in the script editor first."),
        shared("split-scene", "Insert a scene", ["/"], "Not while the correction tool is active."),
      ],
    },
  ],
};

export default descript;
