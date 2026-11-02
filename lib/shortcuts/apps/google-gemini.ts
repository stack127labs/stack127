import { perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleGemini: AppShortcuts = {
  slug: "google-gemini",
  name: "Google Gemini",
  category: "AI assistant",
  platforms: [...platforms],
  versionContext:
    "Gemini in Chrome, an opt-in feature that's still rolling out. They're for Chrome, not the Gemini web app, and you can change them in Chrome settings.",
  sourceUrl: "https://support.google.com/chrome/answer/16988996?hl=en",
  sourceLabel: "official Google Chrome Help for Gemini keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "gemini-in-chrome",
      title: "Gemini in Chrome",
      intro: "Use these Chrome commands to open Gemini, switch focus, or start selection mode.",
      shortcuts: [
        { id: "toggle-gemini", action: "Open or close Gemini in Chrome", keys: perPlatform(platforms, { windows: ["Alt", "G"], macos: ["Ctrl", "G"] }) },
        { id: "switch-tab-gemini", action: "Switch between the tab and Gemini", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "G"], macos: ["Ctrl", "Cmd", "G"] }) },
        { id: "selection-mode", action: "Start selection mode", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "G"], macos: ["Ctrl", "Shift", "G"] }) },
      ],
    },
  ],
};

export default googleGemini;
