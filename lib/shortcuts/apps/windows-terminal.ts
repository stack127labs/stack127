import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

export const windowsTerminal: AppShortcuts = {
  slug: "windows-terminal",
  name: "Windows Terminal",
  category: "Terminal emulator",
  platforms: ["windows"],
  intro:
    "Windows Terminal is a workspace for several shells, so its important keys manage the container around the prompt. Open tabs, split panes, search scrollback, copy and paste, zoom, and reach the command palette.",
  versionContext:
    "Current Windows Terminal documentation as of August 2026; most bindings listed are defaults from the official Actions reference and can be changed in settings.",
  sourceUrl: "https://learn.microsoft.com/en-us/windows/terminal/customize-settings/actions",
  sourceLabel: "official Windows Terminal actions",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "tabs",
      title: "Tabs",
      intro: "Open, close, switch, rename, and move Windows Terminal tabs.",
      shortcuts: [
        {
          id: "new-tab",
          action: "New tab with the default profile",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "T"] }],
        },
        {
          id: "new-tab-profile",
          action: "New tab with a profile from the dropdown",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "1"] }],
          note: "Digits 1 through 9 open profiles 1 through 9.",
        },
        { id: "next-tab", action: "Next tab", keys: [{ platform: "windows", keys: ["Ctrl", "Tab"] }] },
        {
          id: "previous-tab",
          action: "Previous tab",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Tab"] }],
        },
        {
          id: "duplicate-tab",
          action: "Duplicate the current tab's profile and directory",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "D"] }],
        },
        {
          id: "close-pane-or-tab",
          action: "Close the active pane, or the tab if there are no splits",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "W"] }],
        },
        {
          id: "close-window",
          action: "Close the current window and all its tabs",
          keys: [{ platform: "windows", keys: ["Alt", "F4"] }],
        },
        {
          id: "open-new-tab-dropdown",
          action: "Open the new tab dropdown",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Space"] }],
        },
        {
          id: "switch-to-tab",
          action: "Switch to a specific tab by position",
          keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "1"] }],
          note: "Defaults cover tabs 1 through 8 with Ctrl+Alt+1 through Ctrl+Alt+8.",
        },
      ],
    },
    {
      id: "panes",
      title: "Panes",
      intro: "Split panes, move focus, resize the layout, and zoom the pane you are using.",
      shortcuts: [
        {
          id: "split-auto",
          action: "Split the pane automatically, duplicating the profile",
          keys: [{ platform: "windows", keys: ["Alt", "Shift", "D"] }],
          note: "Auto picks the direction with the most surface area.",
        },
        {
          id: "duplicate-pane-down",
          action: "Duplicate the pane downward",
          keys: [{ platform: "windows", keys: ["Alt", "Shift", "-"] }],
        },
        {
          id: "duplicate-pane-right",
          action: "Duplicate the pane to the right",
          keys: [{ platform: "windows", keys: ["Alt", "Shift", "+"] }],
        },
        {
          id: "move-pane-focus",
          action: "Move focus between panes",
          keys: [{ platform: "windows", keys: ["Alt", "Left"] }],
          note: "Also Alt+Right, Alt+Up, and Alt+Down. Ctrl+Alt+Left moves to the previously used pane.",
        },
        {
          id: "resize-pane",
          action: "Resize the active pane",
          keys: [{ platform: "windows", keys: ["Alt", "Shift", "Left"] }],
          note: "Also Alt+Shift+Right, Alt+Shift+Up, and Alt+Shift+Down.",
        },
      ],
    },
    {
      id: "clipboard",
      title: "Copy and paste",
      intro: "Copy, paste, and select terminal text while preserving the command-line workflow.",
      shortcuts: [
        {
          id: "copy",
          action: "Copy selected terminal content",
          keys: [{ platform: "windows", keys: ["Ctrl", "C"] }],
          note: "With no selection the chord passes through to the shell. Ctrl+Shift+C and Ctrl+Insert also copy.",
        },
        {
          id: "paste",
          action: "Paste from the clipboard",
          keys: [{ platform: "windows", keys: ["Ctrl", "V"] }],
          note: "Ctrl+Shift+V and Shift+Insert also paste.",
        },
        {
          id: "select-all",
          action: "Select all content in the text buffer",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "A"] }],
        },
        {
          id: "mark-mode",
          action: "Toggle mark mode for keyboard selections",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "M"] }],
        },
      ],
    },
    {
      id: "view-and-zoom",
      title: "View and zoom",
      intro: "Change font size, toggle fullscreen, and move through the terminal viewport.",
      shortcuts: [
        { id: "font-size-up", action: "Increase the text size", keys: [{ platform: "windows", keys: ["Ctrl", "+"] }] },
        { id: "font-size-down", action: "Decrease the text size", keys: [{ platform: "windows", keys: ["Ctrl", "-"] }] },
        {
          id: "font-size-reset",
          action: "Reset the text size to the default",
          keys: [{ platform: "windows", keys: ["Ctrl", "0"] }],
        },
        {
          id: "toggle-fullscreen",
          action: "Toggle full screen",
          keys: [{ platform: "windows", keys: ["Alt", "Enter"] }],
          note: "F11 is bound to the same action.",
        },
      ],
    },
    {
      id: "search-and-scrollback",
      title: "Search and scrollback",
      intro: "Search terminal history and move through scrollback without losing the current prompt.",
      shortcuts: [
        {
          id: "find",
          action: "Search across the full scrollback buffer",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "F"] }],
          note: "Supports case sensitivity and regex toggles.",
        },
        {
          id: "scroll-up",
          action: "Scroll the screen up",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Up"] }],
          note: "Ctrl+Shift+Down scrolls down.",
        },
        {
          id: "scroll-page-up",
          action: "Scroll up by a whole page",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "PageUp"] }],
          note: "The official key name is pgup; PageUp is the readable equivalent.",
        },
        {
          id: "scroll-page-down",
          action: "Scroll down by a whole page",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "PageDown"] }],
          note: "The official key name is pgdn; PageDown is the readable equivalent.",
        },
        {
          id: "scroll-to-top",
          action: "Scroll to the earliest history",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Home"] }],
        },
        {
          id: "scroll-to-bottom",
          action: "Scroll to the latest history",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "End"] }],
        },
      ],
    },
    {
      id: "commands-and-settings",
      title: "Command palette and settings",
      intro: "Open the command palette, settings, and help when a binding is easier to discover than memorize.",
      shortcuts: [
        {
          id: "command-palette",
          action: "Open the command palette",
          keys: [],
          note: "Windows Terminal actions appear in the command palette, but the official reference does not assign a default keyboard binding to open it.",
        },
        {
          id: "open-settings-ui",
          action: "Open the Settings UI",
          keys: [{ platform: "windows", keys: ["Ctrl", ","] }],
        },
        {
          id: "open-settings-json",
          action: "Open the settings.json file",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", ","] }],
        },
        {
          id: "open-defaults-json",
          action: "Open the defaults.json file",
          keys: [{ platform: "windows", keys: ["Ctrl", "Alt", ","] }],
        },
        {
          id: "system-menu",
          action: "Open the window system menu",
          keys: [{ platform: "windows", keys: ["Alt", "Space"] }],
        },
        {
          id: "zoom-pane",
          action: "Zoom the focused pane to fill the window",
          keys: [],
          note: "The togglePaneZoom action is not currently bound by default; add a keybinding in settings if you use it.",
        },
        {
          id: "quake-mode",
          action: "Summon the quake mode window snapped to the top of the monitor",
          keys: [],
          note: "No default key binding is documented; bind the quakeMode action yourself or launch wt -w _quake.",
        },
      ],
    },
  ],
};
