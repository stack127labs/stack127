import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows"] as const;

const shortcut = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys }),
  ...(note ? { note } : {}),
});

export const winmerge: AppShortcuts = {
  slug: "winmerge",
  name: "WinMerge",
  category: "File comparison",
  platforms: [...platforms],
  versionContext:
    "WinMerge manual shortcut page checked September 1, 2026. Some commands depend on whether a folder comparison, file comparison, or merge view has focus.",
  sourceUrl: "https://manual.winmerge.org/en/Shortcut_keys.html",
  sourceLabel: "official WinMerge shortcut keys",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "comparison",
      title: "Folder and file comparison",
      intro: "Use these commands to move between comparison tabs, rescan files, and copy changes between panes.",
      shortcuts: [
        shortcut("next-tab", "Move to the next comparison tab", ["Ctrl", "Tab"]),
        shortcut("previous-tab", "Move to the previous comparison tab", ["Ctrl", "Shift", "Tab"]),
        shortcut("open-selected", "Open the selected item", ["Enter"]),
        shortcut("parent-folder", "Go to the parent folder", ["Backspace"]),
        shortcut("rescan", "Rescan the comparison", ["F5"]),
        shortcut("first-difference", "Go to the first difference", ["Alt", "Home"]),
        shortcut("last-difference", "Go to the last difference", ["Alt", "End"]),
        shortcut("current-difference", "Go to the current difference", ["Alt", "Enter"]),
        shortcut("previous-difference", "Go to the previous difference", ["Alt", "Up Arrow"]),
        shortcut("next-difference", "Go to the next difference", ["Alt", "Down Arrow"]),
        shortcut("copy-right-to-left", "Copy the right pane to the left pane", ["Alt", "Left Arrow"]),
        shortcut("copy-left-to-right", "Copy the left pane to the right pane", ["Alt", "Right Arrow"]),
      ],
    },
    {
      id: "file-compare",
      title: "File comparison",
      intro: "These commands move through line differences, panes, conflicts, and merge controls.",
      shortcuts: [
        shortcut("close-compare", "Close the file comparison", ["Escape"]),
        shortcut("next-line-difference", "Go to the next line difference", ["F4"]),
        shortcut("previous-line-difference", "Go to the previous line difference", ["Shift", "F4"]),
        shortcut("refresh", "Refresh the comparison", ["F5"]),
        shortcut("reload", "Reload the comparison", ["Ctrl", "F5"]),
        shortcut("next-pane", "Move to the next pane", ["F6"]),
        shortcut("previous-pane", "Move to the previous pane", ["Shift", "F6"]),
        shortcut("previous-diff", "Go to the previous difference", ["F7"]),
        shortcut("previous-conflict", "Go to the previous conflict", ["Shift", "F7"]),
        shortcut("previous-file", "Go to the previous file", ["Ctrl", "F7"]),
        shortcut("next-diff", "Go to the next difference", ["F8"]),
        shortcut("next-conflict", "Go to the next conflict", ["Shift", "F8"]),
        shortcut("next-file", "Go to the next file", ["Ctrl", "F8"]),
        shortcut("merge-mode", "Toggle merge mode", ["F9"]),
        shortcut("go-to-line", "Go to a difference or line", ["Ctrl", "G"]),
        shortcut("column-selection", "Toggle column selection", ["Ctrl", "B"]),
        shortcut("diff-context", "Set the difference context", ["Ctrl", "D"]),
        shortcut("auto-merge", "Run automatic merge", ["Ctrl", "Alt", "M"]),
        shortcut("undo", "Undo", ["Ctrl", "Z"]),
        shortcut("redo", "Redo", ["Ctrl", "Y"]),
      ],
    },
    {
      id: "merge",
      title: "Merge and search",
      intro: "Use these commands to resolve conflicts, search the comparison, and manage bookmarks.",
      shortcuts: [
        shortcut("previous-conflict-merge", "Go to the previous conflict in merge mode", ["Alt", "Shift", "Up Arrow"]),
        shortcut("next-conflict-merge", "Go to the next conflict in merge mode", ["Alt", "Shift", "Down Arrow"]),
        shortcut("copy-left-advance", "Copy the left side and advance", ["Ctrl", "Alt", "Left Arrow"]),
        shortcut("copy-right-advance", "Copy the right side and advance", ["Ctrl", "Alt", "Right Arrow"]),
        shortcut("find", "Find text", ["Ctrl", "F"]),
        shortcut("replace", "Find and replace text", ["Ctrl", "H"]),
        shortcut("find-next", "Find the next match", ["F3"]),
        shortcut("find-previous", "Find the previous match", ["Shift", "F3"]),
        shortcut("bookmark", "Set or clear a bookmark", ["F2"]),
        shortcut("next-bookmark", "Go to the next bookmark", ["Ctrl", "F2"]),
        shortcut("zoom-in", "Zoom in", ["Ctrl", "+"]),
        shortcut("zoom-out", "Zoom out", ["Ctrl", "-"]),
      ],
    },
  ],
};

export default winmerge;
