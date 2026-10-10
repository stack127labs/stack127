import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

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
    { platform: "linux", keys: windows },
  ],
  ...(note ? { note } : {}),
});

export const davinciResolve: AppShortcuts = {
  slug: "davinci-resolve",
  name: "DaVinci Resolve",
  category: "Video editing",
  platforms: [...platforms],
  versionContext:
    "DaVinci Resolve 20 guides checked October 10, 2026. Blackmagic Design lists a Linux version and lets users change nearly every command in Keyboard Customization, so these entries describe the documented defaults.",
  sourceUrl: "https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Editors-Guide.pdf?_v=1757574010000",
  sourceLabel: "DaVinci Resolve 20 Editors Guide",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "playback",
      title: "Playback",
      intro: "Use the transport keys with the viewer or timeline focused. J, K, and L control reverse, stop, and forward playback.",
      shortcuts: [
        shared("play-stop", "Start or stop playback", ["Space"]),
        shared("frame-back", "Move back one frame", ["Left"]),
        shared("frame-forward", "Move forward one frame", ["Right"]),
        shared("play-reverse", "Play backward", ["J"]),
        shared("stop", "Stop playback", ["K"]),
        shared("play-forward", "Play forward", ["L"]),
      ],
    },
    {
      id: "timeline",
      title: "Timeline",
      intro: "Timeline zoom and fit commands change the visible timeline without changing the edit.",
      shortcuts: [
        pair("zoom-in", "Zoom in on the timeline", ["Ctrl", "="], ["Cmd", "="]),
        pair("zoom-out", "Zoom out on the timeline", ["Ctrl", "-"], ["Cmd", "-"]),
        shared("fit-timeline", "Fit the whole timeline in view", ["Shift", "Z"]),
        pair("blade", "Cut at the playhead", ["Ctrl", "B"], ["Cmd", "B"]),
        shared("enable-clip", "Enable or disable the selected clip", ["D"]),
      ],
    },
  ],
};

export default davinciResolve;
