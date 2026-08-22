import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["macos", "linux"] as const;

export const ghostty: AppShortcuts = {
  slug: "ghostty",
  name: "Ghostty",
  category: "Terminal emulator",
  platforms: [...platforms],
  intro:
    "Ghostty's useful defaults are about arranging terminal work. Split the surface, move between tabs, copy and paste, change the view, and reload configuration while keeping the shell session alive.",
  versionContext:
    "Documented defaults from ghostty.org in August 2026. Every binding is remappable with keybind = trigger=action in the config file, and ghostty +list-keybinds --default prints the full set. Ghostty does not run on Windows.",
  sourceUrl: "https://ghostty.org/docs/config/keybind",
  sourceLabel: "official Ghostty keybind docs",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "splits",
      title: "Splits",
      intro:
        "Splits are Ghostty's headline feature: the macOS bindings use Cmd while Linux uses Ctrl+Shift or Ctrl+Alt for the same actions.",
      shortcuts: [
        {
          id: "split-right",
          action: "New split to the right",
          keys: perPlatform(platforms, { macos: ["Cmd", "D"], linux: ["Ctrl", "Shift", "O"] }),
        },
        {
          id: "split-down",
          action: "New split below",
          keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "D"], linux: ["Ctrl", "Shift", "E"] }),
        },
        {
          id: "focus-split",
          action: "Move focus between splits",
          keys: perPlatform(platforms, { macos: ["Cmd", "]"], linux: ["Ctrl", "Super", "]"] }),
          note: "[ goes to the previous split; Option+Cmd+Arrow (Linux: Ctrl+Alt+Arrow) moves by direction.",
        },
        {
          id: "toggle-split-zoom",
          action: "Zoom the focused split to fill the window",
          keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "Enter"], linux: ["Ctrl", "Shift", "Enter"] }),
        },
        {
          id: "resize-split",
          action: "Resize the focused split",
          keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "Up"], linux: ["Ctrl", "Super", "Shift", "Up"] }),
          note: "Works with Down, Left, and Right too.",
        },
        {
          id: "equalize-splits",
          action: "Equalize all splits",
          keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "="], linux: ["Ctrl", "Super", "Shift", "="] }),
        },
        {
          id: "close-split",
          action: "Close the focused split or tab",
          keys: perPlatform(platforms, { macos: ["Cmd", "W"], linux: ["Ctrl", "Shift", "W"] }),
        },
      ],
    },
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Open, close, and move between terminal tabs or windows without interrupting a running shell.",
      shortcuts: [
        {
          id: "new-tab",
          action: "New tab",
          keys: perPlatform(platforms, { macos: ["Cmd", "T"], linux: ["Ctrl", "Shift", "T"] }),
        },
        {
          id: "new-window",
          action: "New window",
          keys: perPlatform(platforms, { macos: ["Cmd", "N"], linux: ["Ctrl", "Shift", "N"] }),
        },
        {
          id: "next-tab",
          action: "Next tab",
          keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "]"], linux: ["Ctrl", "Tab"] }),
          note: "On Linux Ctrl+PageDown also works; Cmd+Shift+[ (Linux: Ctrl+Shift+Tab) goes back.",
        },
        {
          id: "jump-to-tab",
          action: "Jump to a tab by number",
          keys: perPlatform(platforms, { macos: ["Cmd", "1"], linux: ["Alt", "1"] }),
          note: "Digits 1 through 8 pick tabs by position; 9 jumps to the last tab.",
        },
      ],
    },
    {
      id: "clipboard-and-view",
      title: "Clipboard and view",
      intro: "Copy and paste safely, change font size, toggle fullscreen, and clear or redraw the terminal view.",
      shortcuts: [
        {
          id: "copy",
          action: "Copy the selection",
          keys: perPlatform(platforms, { macos: ["Cmd", "C"], linux: ["Ctrl", "Shift", "C"] }),
        },
        {
          id: "paste",
          action: "Paste from the clipboard",
          keys: perPlatform(platforms, { macos: ["Cmd", "V"], linux: ["Ctrl", "Shift", "V"] }),
        },
        {
          id: "font-size-up",
          action: "Increase font size",
          keys: perPlatform(platforms, { macos: ["Cmd", "+"], linux: ["Ctrl", "+"] }),
          note: "- decreases and 0 resets on both platforms.",
        },
        {
          id: "toggle-fullscreen",
          action: "Toggle full screen",
          keys: perPlatform(platforms, { macos: ["Cmd", "Enter"], linux: ["F11"] }),
        },
      ],
    },
    {
      id: "config",
      title: "Config and inspector",
      intro: "Reload configuration and open the inspectors that explain what Ghostty is doing in the current window.",
      shortcuts: [
        {
          id: "open-config",
          action: "Open the config file",
          keys: perPlatform(platforms, { macos: ["Cmd", ","], linux: ["Ctrl", ","] }),
        },
        {
          id: "reload-config",
          action: "Reload the config without restarting",
          keys: perPlatform(platforms, { macos: ["Cmd", "Shift", ","], linux: ["Ctrl", "Shift", ","] }),
        },
        {
          id: "terminal-inspector",
          action: "Toggle the terminal inspector",
          keys: perPlatform(platforms, { macos: ["Cmd", "Option", "I"], linux: ["Ctrl", "Shift", "I"] }),
        },
      ],
    },
  ],
};
