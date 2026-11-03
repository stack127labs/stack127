import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

const either = (id: string, action: string, keys: string[], alternative: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }).map((entry) => ({ ...entry, alternatives: [alternative] })),
  ...(note ? { note } : {}),
});

const consoleOnly = "Lightning console apps only.";

export const salesforce: AppShortcuts = {
  slug: "salesforce",
  name: "Salesforce",
  category: "Customer relationship management",
  platforms: [...platforms],
  versionContext:
    "Lightning Experience shortcuts are enabled by default, ignore letter case, and can be turned off in the Help menu. Console shortcuts apply in Lightning console apps.",
  sourceUrl: "https://help.salesforce.com/s/articleView?id=accessibility_keyboard_shortcuts_lex.htm&language=en_US&type=5",
  sourceLabel: "official Salesforce Lightning keyboard shortcuts",
  lastVerified: "2026-11-03",
  groups: [
    {
      id: "lightning-global",
      title: "Lightning global shortcuts",
      intro: "Use these commands in Lightning Experience to close windows, edit records, save, search, and open utility actions.",
      shortcuts: [
        shared("close-or-deselect", "Close or deselect", ["Escape"]),
        shared("edit-record", "Edit a record", ["E"]),
        dual("quick-text", "Insert quick text", ["Ctrl", "."], ["Cmd", "."]),
        shared("macros", "Open or close Macros", ["M"]),
        shared("notes", "Open or close Notes", ["N"]),
        dual("post-feed", "Post to the feed", ["Ctrl", "Enter"], ["Cmd", "Enter"], "Submits a post or comment. It doesn't work on other publisher actions, such as emails and polls."),
        shared("search", "Place the cursor in the search box", ["/"]),
        dual("shortcut-menu", "Show the shortcut menu", ["Ctrl", "/"], ["Cmd", "/"]),
        dual("save", "Save a record", ["Ctrl", "S"], ["Cmd", "S"], "Focus a field before saving."),
      ],
    },
    {
      id: "lightning-navigation",
      title: "Lightning navigation",
      intro: "Move focus to common Lightning areas with the documented single-key and sequential go-to commands.",
      shortcuts: [
        shared("focus-notifications", "Focus notifications", ["C"]),
        shared("focus-notifications-reverse", "Focus the previous notification", ["Shift", "C"]),
        shared("go-composer", "Go to the composer window", ["G", "then", "D"]),
        shared("go-item-menu", "Go to the item menu", ["G", "then", "I"], consoleOnly),
        shared("go-navigation-item", "Go to the selected navigation item", ["G", "then", "L"], consoleOnly),
        shared("go-publisher", "Go to the publisher", ["G", "then", "P"]),
        shared("go-subtab", "Go to the active subtab", ["G", "then", "S"], consoleOnly),
        shared("go-utility-bar", "Go to the utility bar", ["G", "then", "U"]),
        shared("go-workspace-tab", "Go to the active workspace tab", ["G", "then", "W"], consoleOnly),
        dual("go-modifier", "Start a go-to command inside a dialog, form, or input", ["Ctrl", "Alt", "G"], ["Cmd", "Option", "G"], consoleOnly),
        dual("go-other-region", "Move among regions of certain pages", ["Ctrl", "F6"], ["Cmd", "F6"]),
      ],
    },
    {
      id: "composer",
      title: "Composer windows",
      intro: "Open the composer overflow menu and move between open composer windows from anywhere in a Lightning app.",
      shortcuts: [
        shared("composer-overflow", "Open the composer overflow menu", ["G", "then", "D"]),
        either("composer-list", "Move through open composer windows in the overflow menu", ["Up Arrow"], ["Down Arrow"]),
        either("composer-switch", "Move between open composer windows", ["Left Arrow"], ["Right Arrow"]),
      ],
    },
    {
      id: "console-global",
      title: "Lightning console global shortcuts",
      intro: "Lightning console apps add URL-copy, feed, utility, and tab navigation commands to the standard Lightning actions.",
      shortcuts: [
        dual("copy-active-tab-url", "Copy the URL for the active tab", ["Ctrl", "C", "then", "S"], ["Cmd", "C", "then", "S"]),
        dual("copy-workspace-url", "Copy the URL for the active workspace tab and subtabs", ["Ctrl", "C", "then", "W"], ["Cmd", "C", "then", "W"]),
        dual("console-post-feed", "Submit a post or comment from the console", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
        shared("open-history", "Open or close History", ["H"]),
        shared("open-omni-channel", "Open or close Omni-Channel", ["O"], "This shortcut works in the Service Console app only."),
      ],
    },
    {
      id: "console-tabs",
      title: "Lightning console tabs",
      intro: "Refresh or close workspace tabs and move between focused tabs with the Lightning console commands.",
      shortcuts: [
        either("switch-tabs", "Switch between workspace tabs and subtabs", ["Left Arrow"], ["Right Arrow"], "Focus must be on the tab itself."),
        shared("close-workspace-tab", "Close the current workspace tab", ["Shift", "X"]),
        shared("close-all-tabs", "Close all unpinned tabs", ["Shift", "W"]),
        shared("refresh-tab", "Refresh the current workspace tab", ["Shift", "R"]),
      ],
    },
  ],
};

export default salesforce;
