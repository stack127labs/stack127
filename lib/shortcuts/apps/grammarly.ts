import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const grammarly: AppShortcuts = {
  slug: "grammarly",
  name: "Grammarly",
  category: "Writing assistant",
  platforms: [...platforms],
  versionContext:
    "Grammarly for Windows and Mac, not its browser or editor add-ons. Tab and Shift+Tab move focus, and Enter or Space presses the focused control.",
  sourceUrl: "https://support.grammarly.com/hc/en-us/articles/24059143083277-Can-I-use-my-keyboard-to-navigate-Grammarly-for-Windows-and-Mac",
  sourceLabel: "official Grammarly keyboard navigation",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "desktop-surfaces",
      title: "Desktop surfaces",
      intro: "Open the Grammarly Assistant or sidebar, close it, and move focus through its controls.",
      shortcuts: [
        { id: "open-assistant", action: "Open the Grammarly Assistant", keys: [{ platform: "windows", keys: ["Shift", "Ctrl", "Alt", "G"] }, { platform: "macos", keys: ["Shift", "Ctrl", "Cmd", "G"], alternatives: [["Ctrl", "G"]], note: "Ctrl+G is for AI Chat." }] },
        { id: "open-sidebar", action: "Open or close the Grammarly sidebar", keys: perPlatform(platforms, { windows: ["Shift", "Ctrl", "G"], macos: ["Shift", "Cmd", "G"] }) },
        { id: "next-control", action: "Move focus to the next control", keys: combo(platforms, ["Tab"]) },
        { id: "previous-control", action: "Move focus to the previous control", keys: combo(platforms, ["Shift", "Tab"]) },
        { id: "activate-enter", action: "Activate the focused control with Enter", keys: combo(platforms, ["Enter"]) },
        { id: "activate-space", action: "Activate the focused control with Space", keys: combo(platforms, ["Space"]) },
      ],
    },
  ],
};

export default grammarly;
