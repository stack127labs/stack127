import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

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
  name: "DaVinci Resolve Fusion Page",
  category: "Compositing and motion graphics",
  platforms: [...platforms],
  intro:
    "The Fusion page uses a small set of transport and playhead commands for moving through a composition. The focused Fusion timeline or viewer determines where a command applies.",
  versionContext:
    "DaVinci Resolve Fusion 20.3 Reference Manual checked September 1, 2026. Resolve supports custom keyboard mappings, and the manual's Command-labelled range commands are kept separate from the shared transport keys.",
  sourceUrl: "https://documents.blackmagicdesign.com/UserManuals/FusionManual.pdf?_v=1724310010000",
  sourceLabel: "Fusion 20.3 Reference Manual",
  lastVerified: "2026-09-01",
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
      ],
    },
    {
      id: "render-range",
      title: "Render range",
      intro: "The current Fusion manual documents these range jumps with Command on macOS.",
      shortcuts: [
        mac("render-in", "Jump to the render range In point", ["Cmd", "Left"]),
        mac("render-out", "Jump to the render range Out point", ["Cmd", "Right"]),
      ],
    },
  ],
};

export default davinciResolveFusionPage;
