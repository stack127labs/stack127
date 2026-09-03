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
  intro:
    "Descript's documented shortcuts cover tool selection, the action bar, transcript correction, timeline visibility, and scene creation. The editor's in-app shortcut panel contains additional commands.",
  versionContext:
    "Current Descript blog and Help Center pages checked September 1, 2026. Descript's defaults apply to its Mac and Windows editor; focus on the script editor or timeline where noted.",
  sourceUrl: "https://www.descript.com/blog/article/how-to-use-descript",
  sourceLabel: "Descript keyboard shortcuts guide",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "tools",
      title: "Editing tools",
      intro: "These single-key tools apply while the editor is ready for a tool shortcut.",
      shortcuts: [
        shared("select", "Select", ["A"]),
        shared("range", "Range", ["R"]),
        shared("blade", "Blade", ["B"]),
        shared("hand", "Hand", ["H"]),
        shared("slip", "Slip", ["Y"]),
      ],
    },
    {
      id: "action-bar",
      title: "Action bar",
      intro: "The action bar searches Descript commands and AI features from inside a project.",
      shortcuts: [
        pair("open-shortcuts", "Open the keyboard shortcut list", ["Ctrl", "Alt", "K"], ["Option", "Cmd", "K"]),
        pair("action-bar", "Open the action bar", ["Ctrl", "K"], ["Cmd", "K"]),
      ],
    },
    {
      id: "script-editing",
      title: "Script editing",
      intro: "Correction commands act on selected transcript text or the focused script editor.",
      shortcuts: [
        pair("correct-mode", "Enter or exit Correct mode", ["Alt", "C"], ["Option", "C"]),
        shared("correct-word", "Correct the selected word", ["C"], "Select a word in the script editor first."),
        pair("new-scene", "Create a new empty scene", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]),
        shared("split-scene", "Split the current scene", ["/"], "Type the slash in the script where the new scene should begin."),
      ],
    },
    {
      id: "timeline-and-view",
      title: "Timeline and view",
      intro: "The timeline command changes the editor layout while the project remains open.",
      shortcuts: [
        pair("toggle-timeline", "Show or hide the timeline", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
      ],
    },
  ],
};

export default descript;
