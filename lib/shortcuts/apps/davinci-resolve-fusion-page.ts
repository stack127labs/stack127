import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});

const mac = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "macos", keys }],
  ...(note ? { note } : {}),
});

export const davinciResolveFusionPage: AppShortcuts = {
  slug: "davinci-resolve-fusion-page",
  name: "DaVinci Resolve Fusion page",
  category: "Compositing and motion graphics",
  platforms: [...platforms],
  versionContext:
    "The Fusion page in DaVinci Resolve. You can remap its keys in DaVinci Resolve > Keyboard Customization.",
  sourceUrl: "https://documents.blackmagicdesign.com/UserManuals/FusionManual.pdf",
  sourceLabel: "Fusion 21.1 Reference Manual",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "playback-and-navigation",
      title: "Playback and navigation",
      intro: "Space toggles forward playback. J, K, and L provide reverse, stop, and forward playback, while the arrow keys move one frame.",
      shortcuts: [
        shared("play-stop", "Toggle forward playback", ["Space"]),
        shared("play-reverse", "Play backward", ["J"]),
        shared("stop", "Stop playback", ["K"]),
        shared("play-forward", "Play forward", ["L"]),
        shared("frame-back", "Move one frame backward", ["Left"]),
        shared("frame-forward", "Move one frame forward", ["Right"]),
        shared("global-start", "Jump to the global start", ["Shift", "Left"]),
        shared("global-end", "Jump to the global end", ["Shift", "Right"]),
      ],
    },
    {
      id: "render-range",
      title: "Render range",
      intro: "These range jumps are listed with Command on macOS. Keys for Windows and Linux are not listed.",
      shortcuts: [
        mac("render-in", "Jump to the render range In point", ["Cmd", "Left"]),
        mac("render-out", "Jump to the render range Out point", ["Cmd", "Right"]),
      ],
    },
  ],
};

export default davinciResolveFusionPage;
