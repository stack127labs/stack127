import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => pair(id, action, keys, keys, note);

export const looker: AppShortcuts = {
  slug: "looker",
  name: "Looker",
  category: "Analytics",
  platforms: [...platforms],
  versionContext:
    "Shortcuts from the current Google Cloud Looker keyboard-shortcuts page, last updated July 22, 2025 and checked September 1, 2026. Availability depends on the current Looker location, permissions, and browser; the published table covers Windows and macOS.",
  sourceUrl: "https://docs.cloud.google.com/looker/docs/keyboard-shortcuts?hl=en",
  sourceLabel: "Google Cloud Looker keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "global",
      title: "Global Looker shortcuts",
      intro: "Search, open the shortcut help, switch developer mode, and move through Looker navigation.",
      shortcuts: [
        pair("search", "Open search", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]),
        shared("shortcut-help", "Show or hide shortcut help", ["?"]),
        pair("developer-mode", "Toggle Development Mode", ["Ctrl", "Shift", "D"], ["Ctrl", "Shift", "D"]),
        pair("navigation", "Focus Looker navigation", ["Ctrl", ";"], ["Ctrl", ";"]),
      ],
    },
    {
      id: "dashboard-view",
      title: "Dashboard view",
      intro: "Refresh dashboard data, edit or download the dashboard, schedule it, and reset filters.",
      shortcuts: [
        pair("reload", "Reload dashboard data", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        pair("clear-cache", "Clear cache and refresh dashboard data", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Return"]),
        pair("edit", "Enter dashboard edit mode", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]),
        pair("download", "Download the dashboard", ["Alt", "Shift", "D"], ["Cmd", "Shift", "D"]),
        pair("schedule", "Schedule the dashboard", ["Alt", "Shift", "S"], ["Option", "Shift", "S"]),
        pair("reset-filters", "Reset dashboard filters", ["Ctrl", "Alt", "R"], ["Cmd", "Option", "R"]),
      ],
    },
    {
      id: "dashboard-edit",
      title: "Dashboard editing",
      intro: "Add dashboard tiles and text, save changes, and focus the filter controls while editing.",
      shortcuts: [
        pair("add-text", "Add a text tile", ["Alt", "Shift", "T"], ["Option", "Shift", "T"]),
        pair("add-query-tile", "Add a query tile", ["Alt", "Shift", "V"], ["Option", "Shift", "V"]),
        pair("save", "Save dashboard changes", ["Ctrl", "S"], ["Cmd", "S"]),
        pair("filter", "Focus dashboard filters", ["Alt", "Shift", "F"], ["Option", "Shift", "F"]),
      ],
    },
    {
      id: "looks",
      title: "Looks",
      intro: "Edit, explore, run, download, save, share, and schedule a Look from its own shortcut context.",
      shortcuts: [
        pair("edit-look", "Edit the Look", ["Ctrl", "E"], ["Cmd", "E"]),
        pair("explore-look", "Explore the Look", ["Ctrl", "Alt", "E"], ["Ctrl", "Option", "E"]),
        pair("look-settings", "Open Look settings", ["Ctrl", "Shift", "E"], ["Ctrl", "Cmd", "E"]),
        pair("lookml", "Open LookML", ["Ctrl", "Alt", "A"], ["Option", "Cmd", "A"]),
        pair("download-look", "Download the Look", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        pair("run-look", "Run the Look", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        pair("save-look", "Save the Look", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        pair("add-dashboard", "Add the Look to a dashboard", ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]),
        pair("refresh-look", "Clear cache and refresh the Look", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Return"]),
        pair("make-public", "Make the Look public", ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        pair("send-look", "Send the Look", ["Alt", "Shift", "S"], ["Option", "Shift", "S"]),
        pair("schedule-look", "Schedule the Look", ["Ctrl", "Alt", "S"], ["Option", "Cmd", "S"]),
        pair("share-look", "Share the Look", ["Ctrl", "U"], ["Cmd", "U"]),
      ],
    },
    {
      id: "explores",
      title: "Explores",
      intro: "Clear Explore selections, run and refresh queries, then download, share, or schedule the result.",
      shortcuts: [
        pair("clear-explore", "Clear Explore filters, fields, and calculations", ["Ctrl", "K"], ["Cmd", "K"]),
        pair("clear-fields", "Clear Explore fields", ["Ctrl", "Alt", "K"], ["Option", "Cmd", "K"]),
        pair("explore-lookml", "Open Explore LookML", ["Ctrl", "Alt", "A"], ["Option", "Cmd", "A"]),
        pair("download-explore", "Download the Explore", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        pair("run-explore", "Run the Explore", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        pair("add-explore-dashboard", "Add the Explore to a dashboard", ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]),
        pair("refresh-explore", "Clear cache and run the Explore", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Return"]),
        pair("public-explore", "Make the Explore public", ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]),
        pair("send-explore", "Send the Explore", ["Alt", "Shift", "S"], ["Option", "Shift", "S"]),
        pair("share-explore", "Share the Explore", ["Ctrl", "U"], ["Cmd", "U"]),
      ],
    },
    {
      id: "lookml-ide",
      title: "LookML IDE",
      intro: "Search files, save and format LookML, edit indentation, and move through the IDE's code structure.",
      shortcuts: [
        pair("search-file", "Search for a file", ["Ctrl", "J"], ["Cmd", "J"]),
        pair("file-browser", "Open the file browser", ["Ctrl", "B"], ["Cmd", "B"]),
        pair("fold-all", "Fold all code", ["Ctrl", "Alt", "0"], ["Option", "Cmd", "0"]),
        pair("unfold-all", "Unfold all code", ["Ctrl", "Alt", "="], ["Option", "Cmd", "="]),
        pair("save-file", "Save the file", ["Ctrl", "S"], ["Cmd", "S"]),
        pair("undo", "Undo the last edit", ["Ctrl", "Z"], ["Cmd", "Z"]),
        pair("redo", "Redo the last edit", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        pair("comment", "Comment or uncomment a line", ["Ctrl", "/"], ["Cmd", "/"]),
        pair("indent", "Indent the selected lines", ["Ctrl", "]"], ["Ctrl", "]"]),
        pair("outdent", "Outdent the selected lines", ["Ctrl", "["], ["Ctrl", "["]),
        pair("delete-line", "Delete the current line", ["Ctrl", "D"], ["Ctrl", "D"]),
        pair("duplicate-line", "Duplicate the current line", ["Ctrl", "Shift", "D"], ["Ctrl", "Shift", "D"]),
        pair("move-line-up", "Move the current line up", ["Alt", "Up"], ["Option", "Up"]),
        pair("move-line-down", "Move the current line down", ["Alt", "Down"], ["Option", "Down"]),
        pair("format", "Format LookML", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]),
        pair("autocomplete", "Open autocomplete", ["Ctrl", "Space"], ["Ctrl", "Space"]),
      ],
    },
  ],
};

export default looker;
