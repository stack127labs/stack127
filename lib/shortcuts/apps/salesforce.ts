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

export const salesforce: AppShortcuts = {
  slug: "salesforce",
  name: "Salesforce",
  category: "Customer relationship management",
  platforms: [...platforms],
  versionContext:
    "Salesforce Help keyboard shortcut references checked September 1, 2026. Lightning shortcuts are enabled by default, are not case-sensitive, and can be disabled from the Help menu. Console shortcuts apply to Lightning console apps and may not be available in standard navigation.",
  sourceUrl: "https://help.salesforce.com/s/articleView?id=sf.accessibility_keyboard_shortcuts_lex.htm&language=en_US&type=5",
  sourceLabel: "official Salesforce Lightning keyboard shortcuts",
  lastVerified: "2026-09-01",
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
        dual("post-feed", "Post to the feed", ["Ctrl", "F6"], ["Cmd", "F6"], "This standard Lightning shortcut submits a post or comment."),
        shared("search", "Place the cursor in the search box", ["/"]),
        dual("shortcut-menu", "Show the shortcut menu", ["Ctrl", "/"], ["Cmd", "/"]),
        dual("save", "Save a record", ["Ctrl", "S"], ["Cmd", "S"], "The console reference says the focus must be on a field."),
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
        shared("go-item-menu", "Go to the item menu", ["G", "then", "I"]),
        shared("go-navigation-item", "Go to the selected navigation item", ["G", "then", "L"]),
        shared("go-publisher", "Go to the publisher", ["G", "then", "P"]),
        shared("go-subtab", "Go to the active subtab", ["G", "then", "S"]),
        shared("go-utility-bar", "Go to the utility bar", ["G", "then", "U"]),
        shared("go-workspace-tab", "Go to the active workspace tab", ["G", "then", "W"]),
        dual("go-modifier", "Start a go-to command inside a dialog, form, or input", ["Ctrl", "Alt", "G"], ["Cmd", "Option", "G"]),
      ],
    },
    {
      id: "composer",
      title: "Composer windows",
      intro: "Open the composer overflow menu and move between open composer windows from anywhere in a Lightning app.",
      shortcuts: [
        shared("composer-overflow", "Open the composer overflow menu", ["G", "then", "D"]),
        shared("composer-list", "Move through open composer windows", ["Up Arrow"], "Down Arrow moves in the opposite direction."),
        shared("composer-switch", "Move between open composer windows", ["Left Arrow"], "Right Arrow moves in the opposite direction."),
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
        shared("switch-tabs", "Switch between workspace tabs and subtabs", ["Left Arrow"], "Right Arrow moves in the opposite direction."),
        shared("close-workspace-tab", "Close the current workspace tab", ["Shift", "X"]),
        shared("close-all-tabs", "Close all unpinned tabs", ["Shift", "W"]),
        shared("refresh-tab", "Refresh the current workspace tab", ["Shift", "R"]),
      ],
    },
  ],
};

export default salesforce;
