import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const grammarly: AppShortcuts = {
  slug: "grammarly",
  name: "Grammarly",
  category: "Writing assistant",
  platforms: [...platforms],
  versionContext:
    "The source covers Grammarly for Windows and Mac, not every browser or editor integration. Tab and Shift+Tab move focus, while Enter or Space activates a focused control. Grammarly's separate quick-fix Tab behavior is being discontinued and is not included.",
  sourceUrl: "https://support.grammarly.com/hc/en-us/articles/24059143083277-Can-I-use-my-keyboard-to-navigate-Grammarly-for-Windows-and-Mac",
  sourceLabel: "official Grammarly keyboard navigation",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "desktop-surfaces",
      title: "Desktop surfaces",
      intro: "Open the Grammarly Assistant or sidebar, close it, and move focus through its controls using the documented desktop commands.",
      shortcuts: [
        { id: "open-assistant", action: "Open the Grammarly Assistant", keys: perPlatform(platforms, { windows: ["Shift", "Ctrl", "Alt", "G"], macos: ["Shift", "Ctrl", "Cmd", "G"] }) },
        { id: "close-surface", action: "Close the current Grammarly surface", keys: combo(platforms, ["Esc"]) },
        { id: "open-sidebar", action: "Open the Grammarly sidebar", keys: perPlatform(platforms, { windows: ["Shift", "Ctrl", "G"], macos: ["Shift", "Cmd", "G"] }) },
        { id: "next-control", action: "Move focus to the next control", keys: combo(platforms, ["Tab"]) },
        { id: "previous-control", action: "Move focus to the previous control", keys: combo(platforms, ["Shift", "Tab"]) },
        { id: "activate-enter", action: "Activate the focused control with Enter", keys: combo(platforms, ["Enter"]) },
        { id: "activate-space", action: "Activate the focused control with Space", keys: combo(platforms, ["Space"]) },
      ],
    },
  ],
};

export default grammarly;
