import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "linux", "macos"] as const;

export const pycharm: AppShortcuts = {
  slug: "pycharm",
  name: "PyCharm",
  category: "Code editor",
  platforms: [...platforms],
  versionContext:
    "PyCharm 2026.2 keymap reference checked September 1, 2026. JetBrains lets users choose and customize a keymap, so these entries describe the published default reference actions and not every plugin shortcut.",
  sourceUrl: "https://www.jetbrains.com/help/pycharm/keymap-reference.html",
  sourceLabel: "official PyCharm keymap reference",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "search-and-navigation",
      title: "Search and navigation",
      intro: "Search commands find actions, files, symbols, and recent work without leaving the editor. These are the fastest way to move through a large project.",
      shortcuts: [
        { id: "search-everywhere", action: "Search Everywhere", keys: combo(platforms, ["Shift", "Shift"], ["Shift", "Shift"]) },
        { id: "find-action", action: "Find Action", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "project-window", action: "Show the Project window", keys: combo(platforms, ["Alt", "1"], ["Cmd", "1"]) },
        { id: "recent-files", action: "Open Recent Files", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "find-usages", action: "Find Usages", keys: combo(platforms, ["Alt", "F7"], ["Option", "F7"]) },
        { id: "select-in", action: "Select In", keys: combo(platforms, ["Alt", "F1"], ["Option", "F1"]) },
        { id: "settings", action: "Open Settings", keys: combo(platforms, ["Ctrl", "Alt", "S"], ["Cmd", ","]) },
        { id: "vcs-popup", action: "Open the VCS Operations popup", keys: combo(platforms, ["Alt", "`"], ["Ctrl", "V"]) },
      ],
    },
    {
      id: "editing",
      title: "Basic editing",
      intro: "Basic editing keys apply to the current selection or line. PyCharm's keymap can change them, especially when another installed keymap is active.",
      shortcuts: [
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "paste-history", action: "Paste from History", keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]) },
        { id: "save-all", action: "Save All", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
        { id: "indent", action: "Indent selection", keys: combo(platforms, ["Tab"], ["Tab"]) },
        { id: "unindent", action: "Unindent line or selection", keys: combo(platforms, ["Shift", "Tab"], ["Shift", "Tab"]) },
        { id: "auto-indent", action: "Auto-indent lines", keys: combo(platforms, ["Ctrl", "Alt", "I"], ["Ctrl", "Option", "I"]) },
        { id: "new-line", action: "Start a new line", keys: combo(platforms, ["Shift", "Enter"], ["Shift", "Enter"]) },
        { id: "new-line-before", action: "Start a new line before the current line", keys: combo(platforms, ["Ctrl", "Alt", "Enter"], ["Cmd", "Option", "Enter"]) },
        { id: "delete-line", action: "Delete line", keys: combo(platforms, ["Ctrl", "Y"], ["Cmd", "Backspace"]) },
        { id: "join-lines", action: "Join lines", keys: combo(platforms, ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]) },
        { id: "duplicate-line", action: "Duplicate line or selection", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "toggle-case", action: "Toggle case", keys: combo(platforms, ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]) },
      ],
    },
    {
      id: "code-actions",
      title: "Code actions and project work",
      intro: "These commands generate code, reformat it, rebuild a project, and open the actions that change the current symbol or selection.",
      shortcuts: [
        { id: "rebuild", action: "Rebuild", keys: combo(platforms, ["Ctrl", "Shift", "F9"], ["Cmd", "Shift", "F9"]) },
        { id: "intention", action: "Show Intention Actions", keys: combo(platforms, ["Alt", "Enter"], ["Option", "Enter"]) },
        { id: "generate", action: "Generate", keys: combo(platforms, ["Alt", "Insert"], ["Cmd", "N"]) },
        { id: "run-anything", action: "Run Anything", keys: combo(platforms, ["Ctrl", "Ctrl"], ["Ctrl", "Ctrl"]) },
        { id: "debug", action: "Debug", keys: combo(platforms, ["Alt", "Shift", "F9"], ["Ctrl", "Option", "D"]) },
        { id: "breakpoints", action: "View Breakpoints", keys: combo(platforms, ["Ctrl", "Shift", "F8"], ["Cmd", "Shift", "F8"]) },
        { id: "attach", action: "Attach to Process", keys: combo(platforms, ["Ctrl", "Alt", "F5"], ["Cmd", "Option", "F5"]) },
        { id: "refactor", action: "Refactor This", keys: combo(platforms, ["Ctrl", "Alt", "Shift", "T"], ["Ctrl", "Option", "Shift", "T"]) },
        { id: "reformat", action: "Reformat Code", keys: combo(platforms, ["Ctrl", "Alt", "L"], ["Cmd", "Option", "L"]) },
        { id: "build", action: "Build Project", keys: combo(platforms, ["Ctrl", "F9"], ["Cmd", "F9"]) },
        { id: "new-directory", action: "Create new item in the current directory", keys: combo(platforms, ["Ctrl", "Alt", "Insert"], ["Cmd", "Option", "N"]) },
        { id: "copy-path", action: "Copy Paths", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
      ],
    },
    {
      id: "editor-navigation",
      title: "Editor navigation",
      intro: "Editor navigation keeps the code pane in focus while changing windows, tabs, and the active editor area.",
      shortcuts: [
        { id: "maximize-editor", action: "Maximize the editor pane", keys: combo(platforms, ["Ctrl", "Shift", "F12"], ["Cmd", "Shift", "F12"]) },
        { id: "editor-focus", action: "Switch focus to the editor", keys: combo(platforms, ["Escape"], ["Escape"]) },
        { id: "scratch-file", action: "Create a scratch file", keys: combo(platforms, ["Ctrl", "Alt", "Shift", "Insert"], ["Cmd", "Option", "Shift", "Insert"]) },
        { id: "source-new-window", action: "Open source in a new window", keys: combo(platforms, ["Shift", "F4"], ["Shift", "F4"]) },
        { id: "font-larger", action: "Increase font size in all editors", keys: combo(platforms, ["Alt", "Shift", "."], ["Option", "Shift", "."]) },
        { id: "font-smaller", action: "Decrease font size in all editors", keys: combo(platforms, ["Alt", "Shift", ","], ["Option", "Shift", ","]) },
      ],
    },
  ],
};

export default pycharm;
