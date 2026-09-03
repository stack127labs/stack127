import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const gitkraken: AppShortcuts = {
  slug: "gitkraken",
  name: "GitKraken",
  category: "Git client",
  platforms: [...platforms],
  intro:
    "GitKraken's desktop shortcuts cover the work that repeats in every repository: fetch, stage, commit, move through history, compare changes, and switch between open tabs. The same reference covers Windows, macOS, and Linux.",
  versionContext:
    "The current GitKraken Desktop reference documents Command for macOS and Control for Windows and Linux. Some keys act on the commit graph or the panel under focus, so the group notes call out those contexts.",
  sourceUrl: "https://help.gitkraken.com/gitkraken-desktop/keyboard-shortcuts/",
  sourceLabel: "official GitKraken Desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "repository-work",
      title: "Repository work",
      intro: "Fetch, stage, commit, and open repository tools while keeping the current GitKraken repository in focus.",
      shortcuts: [
        { id: "create-branch", action: "Create a branch", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "fetch-all", action: "Fetch all", keys: combo(platforms, ["L"]) },
        { id: "stage-current", action: "Stage the current file", keys: combo(platforms, ["S"]) },
        { id: "stage-all", action: "Stage all files", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "unstage-current", action: "Unstage the current file", keys: combo(platforms, ["U"]) },
        { id: "unstage-all", action: "Unstage all files", keys: combo(platforms, ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]) },
        { id: "commit-staged", action: "Commit staged changes", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "stage-and-commit", action: "Stage all and commit", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]) },
        { id: "focus-commit-box", action: "Focus the commit message box", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "open-repository", action: "Open a repository", keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]) },
        { id: "terminal", action: "Open a terminal", keys: combo(platforms, ["Alt", "T"], ["Option", "T"]) },
        { id: "file-manager", action: "Open the file manager", keys: combo(platforms, ["Alt", "O"]) },
      ],
    },
    {
      id: "graph-navigation",
      title: "Graph navigation",
      intro: "Move through commits, branches, and panels with the graph navigation keys used by GitKraken Desktop.",
      shortcuts: [
        { id: "previous-item", action: "Move to the previous graph item", keys: combo(platforms, ["J"]), note: "Down is also documented for this movement." },
        { id: "next-item", action: "Move to the next graph item", keys: combo(platforms, ["K"]), note: "Up is also documented for this movement." },
        { id: "move-right", action: "Move right in the graph", keys: combo(platforms, ["L"]), note: "Right is also documented for this movement." },
        { id: "move-left", action: "Move left in the graph", keys: combo(platforms, ["H"]), note: "Left is also documented for this movement." },
        { id: "next-branch", action: "Move to the next branch", keys: combo(platforms, ["Shift", "Down"], ["Shift", "J"]) },
        { id: "previous-branch", action: "Move to the previous branch", keys: combo(platforms, ["Shift", "Up"], ["Shift", "K"]) },
        {
          id: "first-commit",
          action: "Move to the first commit",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "Home"],
            macos: ["Cmd", "Up"],
            linux: ["Ctrl", "Home"],
          }),
        },
        {
          id: "last-commit",
          action: "Move to the last commit",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "End"],
            macos: ["Cmd", "Down"],
            linux: ["Ctrl", "End"],
          }),
        },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Y"]) },
        { id: "command-palette", action: "Open the command palette", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "search-commits", action: "Search commits", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "file-history", action: "Open file history or blame", keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]) },
        { id: "diff", action: "Open the diff", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
      ],
    },
    {
      id: "panels-and-tabs",
      title: "Panels and tabs",
      intro: "Show or hide panels, adjust the view, and move between repository tabs without reaching for the mouse.",
      shortcuts: [
        { id: "fullscreen", action: "Toggle fullscreen", keys: combo(platforms, ["F11"], ["Ctrl", "Cmd", "F"]) },
        { id: "zoom-in", action: "Zoom in", keys: combo(platforms, ["Ctrl", "="], ["Cmd", "="]) },
        { id: "zoom-out", action: "Zoom out", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "reset-zoom", action: "Reset zoom", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
        { id: "left-panel", action: "Show or hide the left panel", keys: combo(platforms, ["Ctrl", "J"], ["Cmd", "J"]) },
        { id: "commit-detail", action: "Show commit details", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "close-panel", action: "Close the current panel", keys: combo(platforms, ["Esc"]) },
        { id: "new-tab", action: "Open a new tab", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "next-tab", action: "Select the next tab", keys: combo(platforms, ["Ctrl", "Tab"]) },
        { id: "previous-tab", action: "Select the previous tab", keys: combo(platforms, ["Ctrl", "Shift", "Tab"]) },
      ],
    },
  ],
};

export default gitkraken;
