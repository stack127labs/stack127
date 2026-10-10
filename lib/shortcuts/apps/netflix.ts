import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

export const netflix: AppShortcuts = {
  slug: "netflix",
  name: "Netflix",
  category: "Video streaming",
  platforms: [...platforms],
  versionContext:
    "Netflix Help Center keyboard shortcuts checked September 1, 2026. The shortcuts apply while watching on a computer; Space and Escape also work in the Windows 10 and Windows 11 app where Netflix says so.",
  sourceUrl: "https://help.netflix.com/en/node/24855",
  sourceLabel: "official Netflix keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "player",
      title: "Video player",
      intro: "Use these keys while a Netflix video is active to control playback, seeking, sound, and the opening sequence.",
      shortcuts: [
        {
          id: "play-pause",
          action: "Play or pause",
          keys: platforms.map((platform) => ({
            platform,
            keys: ["Enter"],
            alternatives: [["Space"]],
            ...(platform === "windows" ? { note: "Space also works in the Windows 10 and Windows 11 app." } : {}),
          })),
        },
        dual("fullscreen", "Enter fullscreen", ["F"]),
        dual("exit-fullscreen", "Exit fullscreen", ["Escape"], "Escape also works in the Windows 10 and Windows 11 app."),
        dual("rewind", "Rewind 10 seconds", ["Left Arrow"]),
        dual("fast-forward", "Fast forward 10 seconds", ["Right Arrow"]),
        dual("volume-up", "Increase volume", ["Up Arrow"]),
        dual("volume-down", "Decrease volume", ["Down Arrow"]),
        dual("mute", "Mute", ["M"]),
        dual("skip-intro", "Skip intro", ["S"]),
      ],
    },
  ],
};

export default netflix;
