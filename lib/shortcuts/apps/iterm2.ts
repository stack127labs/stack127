import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

export const iterm2: AppShortcuts = {
  slug: "iterm2",
  name: "iTerm2",
  category: "Terminal emulator",
  platforms: ["macos"],
  intro:
    "iTerm2's shortcuts are about keeping several terminal jobs visible at once. Work across panes and tabs, search scrollback, paste safely, broadcast input, and open the less obvious terminal tools.",
  versionContext:
    "Documented defaults from iTerm2's official documentation in August 2026. Most bindings can be changed in Preferences, Keys.",
  sourceUrl: "https://iterm2.com/documentation-one-page.html",
  sourceLabel: "official iTerm2 documentation",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "panes",
      title: "Panes",
      intro: "Split the terminal, move focus between panes, and resize or close the pane you are using.",
      shortcuts: [
        {
          id: "split-vertical",
          action: "Split the pane vertically (side by side)",
          keys: [{ platform: "macos", keys: ["Cmd", "D"] }],
        },
        {
          id: "split-horizontal",
          action: "Split the pane horizontally",
          keys: [{ platform: "macos", keys: ["Cmd", "Shift", "D"] }],
        },
        {
          id: "next-pane",
          action: "Move focus to the next pane",
          keys: [{ platform: "macos", keys: ["Cmd", "]"] }],
          note: "Cmd+[ moves to the previous pane. Option+Cmd+Arrow moves by direction.",
        },
        {
          id: "maximize-pane",
          action: "Maximize the current pane, or restore it",
          keys: [{ platform: "macos", keys: ["Shift", "Cmd", "Enter"] }],
        },
        {
          id: "close-pane",
          action: "Close the current pane or tab",
          keys: [{ platform: "macos", keys: ["Cmd", "W"] }],
        },
      ],
    },
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Create, close, switch, and rearrange iTerm2 tabs and windows.",
      shortcuts: [
        { id: "new-tab", action: "New tab", keys: [{ platform: "macos", keys: ["Cmd", "T"] }] },
        { id: "new-window", action: "New window", keys: [{ platform: "macos", keys: ["Cmd", "N"] }] },
        {
          id: "next-tab",
          action: "Next tab",
          keys: [{ platform: "macos", keys: ["Cmd", "Shift", "]"] }],
          note: "Cmd+Shift+[ goes to the previous tab; Cmd+digits jump straight to a tab.",
        },
      ],
    },
    {
      id: "find-and-paste",
      title: "Find and paste history",
      intro: "Search scrollback and recover previous paste entries when terminal output becomes dense.",
      shortcuts: [
        { id: "find", action: "Open the find bar", keys: [{ platform: "macos", keys: ["Cmd", "F"] }] },
        {
          id: "use-selection-for-find",
          action: "Use the selection for find without opening the bar",
          keys: [{ platform: "macos", keys: ["Cmd", "E"] }],
        },
        {
          id: "find-cursor",
          action: "Highlight the cursor when you lose track of it",
          keys: [{ platform: "macos", keys: ["Cmd", "/"] }],
        },
        {
          id: "paste-history",
          action: "Open paste history",
          keys: [{ platform: "macos", keys: ["Cmd", "Shift", "H"] }],
        },
        {
          id: "autocomplete",
          action: "Open autocomplete suggestions",
          keys: [{ platform: "macos", keys: ["Cmd", ";"] }],
        },
        {
          id: "command-history",
          action: "Open command history",
          keys: [{ platform: "macos", keys: ["Cmd", "Shift", ";"] }],
        },
      ],
    },
    {
      id: "broadcast-and-tools",
      title: "Broadcast and tools",
      intro: "Send input to several sessions and open iTerm2 tools such as profile, marks, and command history.",
      shortcuts: [
        {
          id: "broadcast-input",
          action: "Broadcast input to every pane in the tab",
          keys: [{ platform: "macos", keys: ["Option", "Cmd", "I"] }],
          note: "Type once, and every pane in the tab receives the same keystrokes.",
        },
        {
          id: "clear-buffer",
          action: "Clear the buffer",
          keys: [{ platform: "macos", keys: ["Cmd", "K"] }],
        },
        {
          id: "instant-replay",
          action: "Open instant replay to scroll back in time",
          keys: [{ platform: "macos", keys: ["Cmd", "Option", "B"] }],
        },
        {
          id: "toolbelt",
          action: "Show or hide the toolbelt",
          keys: [{ platform: "macos", keys: ["Cmd", "Shift", "B"] }],
        },
        {
          id: "preferences",
          action: "Open preferences",
          keys: [{ platform: "macos", keys: ["Cmd", ","] }],
        },
      ],
    },
  ],
};
