import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows"] as const;

const shortcut = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys }),
  ...(note ? { note } : {}),
});

export const windowsSnippingTool: AppShortcuts = {
  slug: "windows-snipping-tool",
  name: "Windows Snipping Tool",
  category: "Screen capture",
  platforms: [...platforms],
  versionContext:
    "Microsoft Snipping Tool help checked September 1, 2026. The capture overlay supports screenshots and screen recordings on current Windows.",
  sourceUrl: "https://support.microsoft.com/en-US/Windows/Apps/use-snipping-tool-to-capture-screenshots",
  sourceLabel: "official Microsoft Snipping Tool shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "capture",
      title: "Capture",
      intro: "Open a screenshot or screen-recording overlay from anywhere in Windows.",
      shortcuts: [
        shortcut("screenshot-overlay", "Open the screenshot snipping overlay", ["Windows", "Shift", "S"]),
        shortcut("recording-overlay", "Open the screen-recording overlay", ["Windows", "Shift", "R"]),
        shortcut("full-screen-copy", "Capture the full screen to the clipboard", ["Print Screen"]),
      ],
    },
    {
      id: "editor",
      title: "Snipping Tool editor",
      intro: "Use these commands after opening a capture in the Snipping Tool editor.",
      shortcuts: [
        shortcut("choose-mode", "Choose a snipping mode", ["Alt", "M"]),
        shortcut("new-snip", "Create a new snip in the current mode", ["Alt", "N"]),
        shortcut("move-mode", "Move between snipping modes", ["Shift", "Arrow keys"]),
        shortcut("delay", "Choose a capture delay", ["Alt", "D"], "The source lists delay choices from one to five seconds."),
        shortcut("copy", "Copy the snip", ["Ctrl", "C"]),
        shortcut("save", "Save the snip", ["Ctrl", "S"]),
      ],
    },
  ],
};

export default windowsSnippingTool;
