import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleDrive: AppShortcuts = {
  slug: "google-drive",
  name: "Google Drive",
  category: "Cloud storage",
  platforms: [...platforms],
  versionContext:
    "Google publishes PC and Mac columns for Drive. The navigation sequences below are entered in order, not pressed as one chord. Some commands require the file list, details pane, or preview to have focus.",
  sourceUrl: "https://support.google.com/drive/answer/2563044?co=GENIE.Platform%3DDesktop&hl=en",
  sourceLabel: "official Google Drive keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Move focus to Drive's navigation areas, change the list view, and open status or details panes.",
      shortcuts: [
        { id: "navigation-panel", action: "Focus the navigation panel", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "N"], macos: ["Option", "G", "then", "N"] }) },
        { id: "folders", action: "Focus folders", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "F"], macos: ["Option", "G", "then", "F"] }) },
        { id: "items", action: "Focus items", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "I"], macos: ["Option", "G", "then", "I"] }) },
        { id: "grid-list", action: "Switch between grid and list view", keys: perPlatform(platforms, { windows: ["Alt", "V", "then", "L"], macos: ["Option", "V", "then", "L"] }) },
        { id: "page-content", action: "Focus page content", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "C"], macos: ["Option", "G", "then", "C"] }) },
        { id: "details-pane", action: "Open the details pane", keys: perPlatform(platforms, { windows: ["Alt", "V", "then", "D"], macos: ["Option", "V", "then", "D"] }) },
        { id: "activity-pane", action: "Open the activity pane", keys: perPlatform(platforms, { windows: ["Alt", "V", "then", "A"], macos: ["Option", "V", "then", "A"] }) },
        { id: "top-of-page", action: "Move to the top of the page", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "T"], macos: ["Option", "G", "then", "T"] }) },
        { id: "download-status", action: "Open download status", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "A"], macos: ["Option", "G", "then", "A"] }) },
        { id: "upload-status", action: "Open upload status", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "U"], macos: ["Option", "G", "then", "U"] }) },
        { id: "approvals", action: "Open approvals", keys: combo(platforms, ["Alt", "V", "then", "E"], ["Option", "V", "then", "E"]) },
      ],
    },
    {
      id: "selection-and-items",
      title: "Selection and items",
      intro: "Select files, open and rename them, and apply sharing, moving, starring, or shortcut actions.",
      shortcuts: [
        { id: "select-row", action: "Select the current row", keys: combo(platforms, ["Shift", "Space"]) },
        { id: "extend-selection", action: "Extend selection with the arrow keys", keys: combo(platforms, ["Shift", "Arrow"]) },
        { id: "select-all", action: "Select all visible items", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "clear-selection", action: "Clear selection", keys: combo(platforms, ["Esc"]) },
        { id: "open", action: "Open the selected item", keys: combo(platforms, ["Enter"]) },
        { id: "open-new-tab", action: "Open the selected item in a new tab", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "rename", action: "Rename the selected item", keys: combo(platforms, ["F2"]) },
        { id: "share", action: "Share the selected item", keys: combo(platforms, ["Ctrl", "Alt", "A"], ["Cmd", "Option", "A"]) },
        { id: "move", action: "Move the selected item", keys: combo(platforms, ["Ctrl", "Alt", "M"], ["Cmd", "Option", "M"]) },
        { id: "star", action: "Add or remove a star", keys: combo(platforms, ["Ctrl", "Alt", "S"], ["Cmd", "Option", "S"]) },
        { id: "create-shortcut", action: "Create a shortcut to the selected items", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "R"], macos: ["Cmd", "Ctrl", "R"] }) },
        { id: "remove", action: "Remove the selected item", keys: combo(platforms, ["Delete"]) },
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
        { id: "upload-file", action: "Upload files", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "U"], macos: ["Ctrl", "C", "then", "U"] }) },
        { id: "upload-folder", action: "Upload a folder", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "I"], macos: ["Ctrl", "C", "then", "I"] }) },
        { id: "new-menu", action: "Open the New menu", keys: perPlatform(platforms, { windows: ["Alt", "N"], macos: ["Ctrl", "N"] }) },
        { id: "new-document", action: "Create a Google document", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "T"], macos: ["Ctrl", "C", "then", "T"] }) },
        { id: "new-presentation", action: "Create a presentation", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "P"], macos: ["Ctrl", "C", "then", "P"] }) },
        { id: "new-spreadsheet", action: "Create a spreadsheet", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "S"], macos: ["Ctrl", "C", "then", "S"] }) },
        { id: "new-drawing", action: "Create a drawing", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "D"], macos: ["Ctrl", "C", "then", "D"] }) },
        { id: "new-folder", action: "Create a folder", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "F"], macos: ["Ctrl", "C", "then", "F"] }) },
        { id: "new-form", action: "Create a form", keys: perPlatform(platforms, { windows: ["Alt", "C", "then", "O"], macos: ["Ctrl", "C", "then", "O"] }) },
      ],
    },
    {
      id: "menus-and-preview",
      title: "Menus and preview",
      intro: "Open action menus, search Drive, change density, and control a selected file in preview.",
      shortcuts: [
        { id: "more-actions", action: "Open the More actions menu", keys: perPlatform(platforms, { windows: ["Shift", "F10", "then", "A"], macos: ["Shift", "F10"] }) },
        { id: "folder-actions", action: "Open actions for the current folder", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "A"], macos: ["Ctrl", "Shift", "A"] }) },
        { id: "sort", action: "Open the sort menu", keys: combo(platforms, ["Alt", "R"], ["Ctrl", "R"]) },
        { id: "settings", action: "Open Drive settings", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "help", action: "Show keyboard shortcuts", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "find", action: "Find in Drive", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "last-message", action: "Open the last message", keys: perPlatform(platforms, { windows: ["Alt", "G", "then", "K"], macos: ["Option", "G", "then", "K"] }) },
        { id: "preview", action: "Preview the selected item", keys: combo(platforms, ["Ctrl", "Alt", "P"], ["Cmd", "Option", "P"]) },
        { id: "close-preview", action: "Close preview", keys: combo(platforms, ["Esc"]) },
        { id: "preview-play", action: "Play media in preview", keys: combo(platforms, ["Space"]) },
        { id: "preview-zoom-in", action: "Zoom in in preview", keys: combo(platforms, ["+"]) },
        { id: "preview-zoom-out", action: "Zoom out in preview", keys: combo(platforms, ["-"]) },
      ],
    },
  ],
};

export default googleDrive;
