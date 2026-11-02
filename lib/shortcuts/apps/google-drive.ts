import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleDrive: AppShortcuts = {
  slug: "google-drive",
  name: "Google Drive",
  category: "Cloud storage",
  platforms: [...platforms],
  versionContext:
    "Navigation sequences are typed one key after another, not held together. Some keys need the file list, details pane, or preview to have focus.",
  sourceUrl: "https://support.google.com/drive/answer/2563044?co=GENIE.Platform%3DDesktop&hl=en",
  sourceLabel: "official Google Drive keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Move focus to Drive's navigation areas, change the list view, and open status or details panes.",
      shortcuts: [
        { id: "navigation-panel", action: "Go to the navigation panel (folders list)", keys: perPlatform(platforms, { windows: ["Alt", "G", "F"], macos: ["Option", "G", "F"] }) },
        { id: "items", action: "Go to the items view", keys: perPlatform(platforms, { windows: ["Alt", "G", "I"], macos: ["Option", "G", "I"] }) },
        { id: "grid-list", action: "Switch between grid and list view", keys: perPlatform(platforms, { windows: ["Alt", "V", "L"], macos: ["Option", "V", "L"] }) },
        { id: "page-content", action: "Go to page content", keys: perPlatform(platforms, { windows: ["Alt", "G", "C"], macos: ["Option", "G", "C"] }) },
        { id: "details-pane", action: "Show or hide the details pane", keys: perPlatform(platforms, { windows: ["Alt", "V", "D"], macos: ["Option", "V", "D"] }) },
        { id: "activity-pane", action: "Show or hide the activity pane", keys: perPlatform(platforms, { windows: ["Alt", "V", "A"], macos: ["Option", "V", "A"] }) },
        { id: "top-of-page", action: "Go to the top of the app (Google bar)", keys: perPlatform(platforms, { windows: ["Alt", "G", "T"], macos: ["Option", "G", "T"] }) },
        { id: "download-status", action: "Go to download status", keys: perPlatform(platforms, { windows: ["Alt", "G", "A"], macos: ["Option", "G", "A"] }) },
        { id: "upload-status", action: "Go to upload status", keys: perPlatform(platforms, { windows: ["Alt", "G", "U"], macos: ["Option", "G", "U"] }) },
        { id: "approvals", action: "Show or hide the approvals pane", keys: combo(platforms, ["Alt", "V", "E"], ["Option", "V", "E"]) },
      ],
    },
    {
      id: "selection-and-items",
      title: "Selection and items",
      intro: "Select files, open and rename them, and apply sharing, moving, starring, or shortcut actions.",
      shortcuts: [
        { id: "select-row", action: "Select or deselect the item", keys: combo(platforms, ["Shift", "Space"]) },
        { id: "extend-selection", action: "Extend selection with the arrow keys", keys: combo(platforms, ["Shift", "Arrow"]) },
        { id: "select-all", action: "Select all visible items", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "clear-selection", action: "Clear selection", keys: combo(platforms, ["Esc"]) },
        { id: "open", action: "Open the selected item", keys: combo(platforms, ["Enter"]) },
        { id: "open-new-tab", action: "Open the selected item in a new tab", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "rename", action: "Rename the selected item", keys: combo(platforms, ["F2"]) },
        { id: "share", action: "Share the selected item", keys: combo(platforms, ["Ctrl", "Alt", "A"], ["Cmd", "Option", "A"]) },
        { id: "move", action: "Move the selected item", keys: combo(platforms, ["Ctrl", "Alt", "M"], ["Cmd", "Option", "M"]) },
        { id: "star", action: "Add or remove a star", keys: combo(platforms, ["Ctrl", "Alt", "S"], ["Cmd", "Option", "S"]) },
        { id: "create-shortcut", action: "Create a shortcut to the selected items", keys: [{ platform: "windows", keys: ["Ctrl", "Alt", "R"] }, { platform: "macos", keys: ["Cmd", "Ctrl", "R"], alternatives: [["Cmd", "Option", "R"]] }] },
        { id: "remove", action: "Remove the selected item", keys: combo(platforms, ["Delete"]).map((entry) => ({ ...entry, alternatives: [["#"]] })) },
        { id: "copy-url", action: "Copy the item URL", keys: combo(platforms, ["Ctrl", "Alt", "L"], ["Cmd", "Option", "L"]) },
        { id: "copy-title", action: "Copy the item title", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
      ],
    },
    {
      id: "files-and-creation",
      title: "Files and creation",
      intro: "Cut, paste, upload, and create new Google files or folders from the Drive interface.",
      shortcuts: [
        { id: "cut", action: "Cut the selected item", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "paste", action: "Paste an item", keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]) },
        { id: "upload-file", action: "Upload files", keys: perPlatform(platforms, { windows: ["Alt", "C", "U"], macos: ["Ctrl", "C", "U"] }) },
        { id: "upload-folder", action: "Upload a folder", keys: perPlatform(platforms, { windows: ["Alt", "C", "I"], macos: ["Ctrl", "C", "I"] }) },
        { id: "new-menu", action: "Open the Create menu", keys: perPlatform(platforms, { windows: ["Alt", "N"], macos: ["Ctrl", "N"] }) },
        { id: "new-document", action: "Create a Google document", keys: perPlatform(platforms, { windows: ["Alt", "C", "T"], macos: ["Ctrl", "C", "T"] }) },
        { id: "new-presentation", action: "Create a presentation", keys: perPlatform(platforms, { windows: ["Alt", "C", "P"], macos: ["Ctrl", "C", "P"] }) },
        { id: "new-spreadsheet", action: "Create a spreadsheet", keys: perPlatform(platforms, { windows: ["Alt", "C", "S"], macos: ["Ctrl", "C", "S"] }) },
        { id: "new-drawing", action: "Create a drawing", keys: perPlatform(platforms, { windows: ["Alt", "C", "D"], macos: ["Ctrl", "C", "D"] }) },
        { id: "new-folder", action: "Create a folder", keys: perPlatform(platforms, { windows: ["Alt", "C", "F"], macos: ["Ctrl", "C", "F"] }) },
        { id: "new-form", action: "Create a form", keys: perPlatform(platforms, { windows: ["Alt", "C", "O"], macos: ["Ctrl", "C", "O"] }) },
      ],
    },
    {
      id: "menus-and-preview",
      title: "Menus and preview",
      intro: "Open action menus, search Drive, and control a selected file in preview.",
      shortcuts: [
        { id: "more-actions", action: "Open the More actions menu", keys: [{ platform: "windows", keys: ["Shift", "F10"], alternatives: [["Alt", "A"]] }, { platform: "macos", keys: ["Shift", "F10"], alternatives: [["Ctrl", "A"]] }] },
        { id: "folder-actions", action: "Open actions for the current folder", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "A"], macos: ["Ctrl", "Shift", "A"] }) },
        { id: "sort", action: "Open the sort menu", keys: combo(platforms, ["Alt", "R"], ["Ctrl", "R"]) },
        { id: "settings", action: "Open Drive settings", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "help", action: "Show keyboard shortcuts", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "find", action: "Find in Drive", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "last-message", action: "Show the last message", keys: perPlatform(platforms, { windows: ["Alt", "G", "K"], macos: ["Option", "G", "K"] }) },
        { id: "preview", action: "Preview the selected item", keys: combo(platforms, ["Ctrl", "Alt", "P"], ["Cmd", "Option", "P"]) },
        { id: "close-preview", action: "Close preview", keys: combo(platforms, ["Esc"]) },
        { id: "preview-play", action: "Play or pause media in preview", keys: combo(platforms, ["Space"]) },
        { id: "preview-zoom-in", action: "Zoom in in preview", keys: combo(platforms, ["+"]).map((entry) => ({ ...entry, alternatives: [["="]] })) },
        { id: "preview-zoom-out", action: "Zoom out in preview", keys: combo(platforms, ["-"]) },
      ],
    },
  ],
};

export default googleDrive;
