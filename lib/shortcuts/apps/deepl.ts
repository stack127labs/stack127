import type { AppShortcuts, Shortcut } from "../types.ts";

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys: windows }, { platform: "macos", keys: macos }],
  ...(note ? { note } : {}),
});

export const deepl: AppShortcuts = {
  slug: "deepl",
  name: "DeepL",
  category: "Translation and writing",
  platforms: ["windows", "macos"],
  intro:
    "DeepL's desktop shortcuts send selected text from any application to DeepL for translation or writing improvement. Translation uses a repeated C sequence; the keys are not pressed as one simultaneous chord.",
  versionContext:
    "Current DeepL desktop-app defaults checked August 31, 2026. Translation and improvement shortcuts can be disabled or customized in app settings, so these entries describe the published defaults.",
  sourceUrl: "https://support.deepl.com/hc/en-us/articles/360020613059-Use-DeepL-shortcuts-for-desktop-apps",
  sourceLabel: "DeepL desktop app shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "selected-text",
      title: "Translate or improve selected text",
      intro: "Select text in any app first. For translation, hold the platform modifier and press C twice; ordinary copy sends nothing to DeepL.",
      shortcuts: [
        dual("translate", "Translate selected text", ["Ctrl", "C", "then", "C"], ["Cmd", "C", "then", "C"]),
        dual("improve", "Improve selected text", ["Ctrl", "Win", "C"], ["Ctrl", "Cmd", "C"]),
      ],
    },
    {
      id: "application",
      title: "Application",
      intro: "DeepL documents a native quit command for its Mac desktop application.",
      shortcuts: [{ id: "quit", action: "Quit DeepL for Mac", keys: [{ platform: "macos", keys: ["Cmd", "Q"] }] }],
    },
  ],
};

export default deepl;
