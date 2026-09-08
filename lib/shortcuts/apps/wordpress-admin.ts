import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const editor = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos, linux: windows }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys, linux: keys }),
  ...(note ? { note } : {}),
});

export const wordpressAdmin: AppShortcuts = {
  slug: "wordpress-admin",
  name: "WordPress Admin",
  category: "Content management",
  platforms: [...platforms],
  intro:
    "WordPress publishes keyboard references for the Block Editor, Classic Editor, comments, and Site Editor. This map keeps those admin editing surfaces together and does not claim shortcuts for every plugin screen.",
  versionContext:
    "WordPress Block Editor, Classic Editor, and Site Editor references checked September 1, 2026. The Block Editor table and Classic Editor table publish Windows or Linux and Mac variants, while the Site Editor documents its command palette separately.",
  sourceUrl: "https://wordpress.org/documentation/article/keyboard-shortcuts-block-editor/",
  sourceLabel: "official WordPress editor keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "block-editor",
      title: "Block Editor",
      intro: "Use these commands to open editor views, manage blocks, and format selected text.",
      shortcuts: [
        editor("show-shortcuts", "Show the keyboard shortcuts", ["Shift", "Alt", "H"], ["Shift", "Option", "Cmd", "H"]),
        editor("code-editor", "Open the code editor", ["Ctrl", "Shift", "Alt", "M"], ["Shift", "Option", "Cmd", "M"]),
        editor("fullscreen", "Toggle fullscreen mode", ["Ctrl", "Shift", "Alt", "F"], ["Shift", "Option", "Cmd", "F"]),
        editor("list-view", "Open List View", ["Shift", "Alt", "O"], ["Ctrl", "Option", "O"]),
        editor("sidebar", "Show or hide the settings sidebar", ["Ctrl", "Shift", ","], ["Shift", "Cmd", ","]),
        editor("next-part", "Move to the next part of the editor", ["Ctrl", "Backtick"], ["Ctrl", "Backtick"]),
        editor("previous-part", "Move to the previous part of the editor", ["Ctrl", "Shift", "Backtick"], ["Ctrl", "Shift", "Backtick"]),
        editor("toolbar", "Move to the nearest toolbar", ["Alt", "F10"], ["Option", "F10"]),
        editor("save", "Save changes", ["Ctrl", "S"], ["Cmd", "S"]),
        editor("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        editor("redo", "Redo", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        editor("select-all", "Select all text when editing a block", ["Ctrl", "A"], ["Cmd", "A"]),
        shared("escape", "Clear selection or exit the current control", ["Escape"]),
        editor("duplicate-block", "Duplicate the selected block", ["Ctrl", "Shift", "D"], ["Shift", "Cmd", "D"]),
        editor("remove-block", "Remove the selected block", ["Shift", "Alt", "Z"], ["Ctrl", "Option", "Z"]),
        editor("insert-before", "Insert a block before the selected block", ["Ctrl", "Alt", "T"], ["Option", "Cmd", "T"]),
        editor("insert-after", "Insert a block after the selected block", ["Ctrl", "Alt", "Y"], ["Option", "Cmd", "Y"]),
        editor("move-block-up", "Move the selected block up", ["Ctrl", "Shift", "Alt", "T"], ["Shift", "Option", "Cmd", "T"]),
        editor("move-block-down", "Move the selected block down", ["Ctrl", "Shift", "Alt", "Y"], ["Shift", "Option", "Cmd", "Y"]),
        editor("group-block", "Group selected blocks", ["Ctrl", "G"], ["Cmd", "G"]),
        shared("block-type", "Change the selected block type", ["/"]),
        editor("paste-styles", "Paste block styles", ["Ctrl", "Alt", "V"], ["Cmd", "Option", "V"]),
      ],
    },
    {
      id: "block-text",
      title: "Block text formatting",
      intro: "These commands apply while text inside a block is selected.",
      shortcuts: [
        editor("bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        editor("italic", "Italicize text", ["Ctrl", "I"], ["Cmd", "I"]),
        editor("link", "Insert or edit a link", ["Ctrl", "K"], ["Cmd", "K"]),
        editor("remove-link", "Remove a link", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        editor("underline", "Underline text", ["Ctrl", "U"], ["Cmd", "U"]),
        editor("collapse-list", "Collapse the current list", ["Alt", "L"], ["Option", "L"]),
      ],
    },
    {
      id: "classic-editor",
      title: "Classic Editor",
      intro: "The Classic Editor reference includes common text actions and editor commands for Windows, Linux, and Mac.",
      shortcuts: [
        editor("classic-copy", "Copy selected text", ["Ctrl", "C"], ["Cmd", "C"]),
        editor("classic-cut", "Cut selected text", ["Ctrl", "X"], ["Cmd", "X"]),
        editor("classic-paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        editor("classic-select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        editor("classic-undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        editor("classic-redo", "Redo", ["Ctrl", "Y"], ["Cmd", "Shift", "Z"]),
        editor("classic-bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        editor("classic-italic", "Italicize text", ["Ctrl", "I"], ["Cmd", "I"]),
        editor("classic-underline", "Underline text", ["Ctrl", "U"], ["Cmd", "U"]),
        editor("classic-link", "Insert or edit a link", ["Ctrl", "K"], ["Cmd", "K"]),
        editor("classic-page-break", "Insert a page break tag", ["Alt", "Shift", "P"], ["Ctrl", "Option", "P"]),
        editor("classic-help", "Show the Classic Editor help", ["Shift", "Alt", "H"], ["Ctrl", "Option", "H"]),
      ],
    },
    {
      id: "comments-and-site-editor",
      title: "Comments and Site Editor",
      intro: "WordPress also documents keyboard navigation for comments and the command palette in the Site Editor.",
      shortcuts: [
        shared("comment-next", "Move to the next comment", ["J"]),
        shared("comment-previous", "Move to the previous comment", ["K"]),
        shared("comment-approve", "Approve a selected comment", ["A"]),
        shared("comment-spam", "Mark a selected comment as spam", ["S"]),
        shared("comment-trash", "Move a selected comment to the trash", ["D"]),
        shared("comment-restore", "Restore a selected comment", ["Z"]),
        editor("site-command-palette", "Open the Site Editor command palette", ["Ctrl", "K"], ["Cmd", "K"]),
      ],
    },
  ],
};

export default wordpressAdmin;
