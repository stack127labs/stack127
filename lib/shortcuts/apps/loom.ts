import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const desktop = (id: string, action: string, windows?: string[], macos?: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const video = (id: string, action: string, keys: string[], alternatives?: string[][]): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys, ...(alternatives ? { alternatives } : {}) })),
});

export const loom: AppShortcuts = {
  slug: "loom",
  name: "Loom",
  category: "Screen recording",
  platforms: [...platforms],
  versionContext:
    "Change desktop keys in Settings and Chrome extension keys at chrome://extensions/shortcuts. Loom says the desktop keys support QWERTY keyboards.",
  sourceUrl: "https://support.atlassian.com/loom/docs/use-looms-keyboard-shortcuts",
  sourceLabel: "official Loom keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "desktop-recorder",
      title: "Desktop recorder",
      intro: "Control an active Loom recording or capture a screenshot from the desktop app.",
      shortcuts: [
        desktop("start-stop", "Start or stop recording", ["Ctrl", "Shift", "L"]),
        desktop("pause-resume", "Pause or resume recording", ["Alt", "Shift", "P"]),
        desktop("cancel", "Cancel recording", ["Alt", "Shift", "C"]),
        desktop("full-screen-screenshot", "Capture the display", ["Ctrl", "Shift", "1"], ["Option", "Shift", "1"]),
        desktop("custom-screenshot", "Capture a custom-size screenshot", ["Ctrl", "Shift", "2"], ["Option", "Shift", "4"]),
        desktop("quick-restart", "Quickly restart recording", ["Ctrl", "Shift", "R"]),
        desktop("draw", "Open the drawing tool", ["Ctrl", "Shift", "D"]),
        desktop("confetti", "Trigger confetti", ["Ctrl", "Alt", "C"]),
        desktop("record-window", "Record a window", undefined, ["Option", "Shift", "2"]),
        desktop("record-custom-size", "Record a custom size", undefined, ["Option", "Shift", "3"]),
        desktop("record-camera", "Record camera only", undefined, ["Option", "Shift", "4"]),
        desktop("record-agent", "Record for Agent", undefined, ["Option", "Shift", "5"]),
        desktop("record-control", "Start, pause, or resume recording", undefined, ["Control", "Option", "R"]),
      ],
    },
    {
      id: "chrome-extension",
      title: "Chrome extension",
      intro: "Use the extension bindings while recording in Chrome. These are separate from the desktop-app shortcuts.",
      shortcuts: [
        desktop("extension-activate", "Activate the Loom extension", ["Alt", "Shift", "L"], ["Option", "Shift", "L"]),
        desktop("extension-pause", "Pause or resume extension recording", ["Alt", "Shift", "S"], ["Option", "Shift", "P"]),
        desktop("extension-cancel", "Cancel extension recording", ["Alt", "Shift", "C"], ["Option", "Shift", "C"]),
        desktop("extension-restart", "Quickly restart the extension recording", ["Alt", "Shift", "R"], ["Option", "Shift", "R"]),
      ],
    },
    {
      id: "video-player",
      title: "Video playback",
      intro: "While watching a Loom video, use these player keys to seek, pause, change volume, and enter full screen.",
      shortcuts: [
        video("jump-forward", "Jump forward six seconds", ["Right"], [["L"]]),
        video("jump-back", "Jump back six seconds", ["Left"], [["J"]]),
        video("step-forward", "Step forward one second", ["."]),
        video("step-back", "Step back one second", [","]),
        video("play-pause", "Play or pause playback", ["K"], [["Space"]]),
        video("full-screen", "Toggle full-screen playback", ["F"]),
        video("volume-up", "Increase volume", ["Up"]),
        video("volume-down", "Decrease volume", ["Down"]),
      ],
    },
  ],
};

export default loom;
