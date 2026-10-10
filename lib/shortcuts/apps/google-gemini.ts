import { perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleGemini: AppShortcuts = {
  slug: "google-gemini",
  name: "Google Gemini",
  category: "AI assistant",
  platforms: [...platforms],
  versionContext:
    "Gemini in Chrome is an opt-in feature that Google is rolling out gradually. Its shortcuts can be changed in Chrome settings, and this record does not present them as shortcuts for the general Gemini web app.",
  sourceUrl: "https://support.google.com/gemini/answer/16988996?hl=en-GP",
  sourceLabel: "official Google Gemini in Chrome keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "gemini-in-chrome",
      title: "Gemini in Chrome",
      intro: "Use the documented Chrome integration commands to open Gemini, switch focus, or start selection mode.",
      shortcuts: [
        { id: "toggle-gemini", action: "Open or close Gemini in Chrome", keys: perPlatform(platforms, { windows: ["Alt", "G"], macos: ["Ctrl", "G"] }) },
        { id: "switch-tab-gemini", action: "Switch between the tab and Gemini", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "G"], macos: ["Ctrl", "Cmd", "G"] }) },
        { id: "selection-mode", action: "Start selection mode", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "G"], macos: ["Ctrl", "Shift", "G"] }) },
      ],
    },
  ],
};

export default googleGemini;
