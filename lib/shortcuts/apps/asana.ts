import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, windows: string[][], macos?: string[][], note?: string];

const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos = windows, note]) => ({
    id,
    action,
    keys: [
      { platform: "windows", keys: windows[0], ...(windows.length > 1 ? { alternatives: windows.slice(1) } : {}) },
      { platform: "macos", keys: macos[0], ...(macos.length > 1 ? { alternatives: macos.slice(1) } : {}) },
    ],
    ...(note ? { note } : {}),
  }));

export const asana: AppShortcuts = {
  slug: "asana",
  name: "Asana",
  category: "Work management",
  platforms: ["windows", "macos"],
  intro:
    "Asana combines Inbox keys, task actions, Tab-key chords, selection controls, and native desktop-window shortcuts. The list-view field-navigation command is different: Asana explicitly documents it as two Right Arrow presses.",
  versionContext:
    "Current defaults from Asana's official Help Center, checked August 31, 2026. Some shortcuts may not work with non-English keyboard input. Desktop-window commands apply to the Asana desktop app. Tab+B requires the Tab-B hack to be enabled in Settings.",
  sourceUrl: "https://help.asana.com/s/article/keyboard-shortcuts",
  sourceLabel: "Asana keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "inbox",
      title: "Inbox",
      intro: "Inbox shortcuts work while the Inbox list has focus and move among messages, tabs, and archive states.",
      shortcuts: rows([
        ["inbox-up", "Move up in Inbox", [["K"]]],
        ["inbox-down", "Move down in Inbox", [["J"]]],
        ["activity-tab", "Open the Activity tab", [["A"]]],
        ["archive-tab", "Open the Archive tab", [["D"]]],
        ["join-leave-inbox", "Join or leave the task", [["F"]]],
        ["archive", "Archive the Inbox item", [["I"], ["E"]]],
        ["move-inbox", "Move the item to Inbox", [["U"]]],
      ]),
    },
    {
      id: "task-details",
      title: "Task details",
      intro: "Asana documents product actions such as Tab+Q and Tab+D as Tab-key chords. Return and Escape open or close the selected task's detail view.",
      shortcuts: rows([
        ["quick-add", "Quick-add a task", [["Tab", "Q"]]],
        ["delete-task", "Delete selected tasks", [["Tab", "Delete"]]],
        ["complete-task", "Complete selected tasks", [["Ctrl", "Return"]], [["Cmd", "Return"]]],
        ["open-details", "Open task details", [["Tab", "Return"]]],
        ["close-details", "Close task details", [["Esc"]]],
        ["due-date", "Set the due date", [["Tab", "D"]]],
        ["assign-me", "Assign the task to yourself", [["Tab", "M"]]],
        ["description", "Move to the task description", [["Tab", "R"]]],
        ["like", "Like the selected task", [["Tab", "K"]]],
        ["comment", "Comment on the task", [["Tab", "C"]]],
        ["collaborators", "Add collaborators", [["Tab", "F"]]],
        ["join", "Join the task", [["Tab", "J"]]],
        ["leave", "Leave the task", [["Tab", "L"]]],
        ["tag", "Add a tag", [["Tab", "T"]]],
        ["project", "Add tasks to a project", [["Tab", "P"]]],
        ["subtask", "Add subtasks", [["Tab", "S"]]],
        ["focus-mode", "View the task full screen", [["Tab", "X"]]],
      ]),
    },
    {
      id: "task-list-actions",
      title: "Task-list actions",
      intro: "These commands create, select, reorder, copy, and paste tasks in a project list. Arrow pairs preserve their separate up and down alternatives.",
      shortcuts: rows([
        ["new-task", "Create a new task", [["Return"]]],
        ["new-task-above", "Create a task above the current task", [["Shift", "Return"]]],
        ["new-section", "Create a section", [["Tab", "N"]]],
        ["follow-up", "Create a follow-up task", [["Shift", "Ctrl", "F"]], [["Shift", "Tab", "F"]]],
        ["change-task", "Select the previous or next task", [["Up"], ["Down"]]],
        ["move-task", "Move selected tasks up or down", [["Ctrl", "Up"], ["Ctrl", "Down"]], [["Cmd", "Up"], ["Cmd", "Down"]]],
        ["move-section", "Move selected tasks to the previous or next section", [["Ctrl", "Shift", "Up"], ["Ctrl", "Shift", "Down"]], [["Cmd", "Shift", "Up"], ["Cmd", "Shift", "Down"]]],
        ["copy-tasks", "Copy selected tasks", [["Ctrl", "C"]], [["Cmd", "C"]]],
        ["paste-tasks", "Paste tasks, one per line", [["Ctrl", "V"]], [["Cmd", "V"]]],
      ]),
    },
    {
      id: "navigation",
      title: "Navigation",
      intro: "Navigation uses documented Tab-key chords. Press Right Arrow twice to enable list-view field navigation.",
      shortcuts: rows([
        ["my-tasks", "Go to My Tasks", [["Tab", "Z"]]],
        ["inbox", "Go to Inbox", [["Tab", "I"]]],
        ["home", "Go to Home", [["Tab", "H"]]],
        ["sidebar", "Collapse or expand the sidebar", [["Tab", "O"]]],
        ["assign-selected", "Assign the selected task", [["Tab", "A"]]],
        ["focus-subtasks", "Focus the selected task's subtasks", [["Tab", "S"]]],
        ["search", "Search for a project, tag, person, or task", [["Tab", "/"]]],
        ["field-navigation", "Enable list-view field navigation", [["Right"]], undefined, "Press Right Arrow twice."],
      ]),
    },
    {
      id: "selection-and-application",
      title: "Selection and application",
      intro: "Selection commands move or extend the current task selection. Application commands expose the shortcut overlay and comment submission behavior.",
      shortcuts: rows([
        ["selection-up", "Move selection up", [["Up"]]],
        ["selection-down", "Move selection down", [["Down"]]],
        ["select-range-up", "Extend the selection upward", [["Shift", "Up"]]],
        ["select-range-down", "Extend the selection downward", [["Shift", "Down"]]],
        ["shortcut-overlay", "Show the keyboard shortcut list", [["Ctrl", "/"]], [["Cmd", "/"]]],
        ["collapse-right-pane", "Collapse the right pane", [["Esc"]]],
        ["post-comment", "Post from the comment field", [["Tab", "Return"]]],
        ["tab-b", "Trigger the Tab-B hack", [["Tab", "B"]], undefined, "Requires the Tab-B hack to be enabled in Settings."],
      ]),
    },
    {
      id: "desktop-app",
      title: "Desktop app windows and tabs",
      intro: "These commands apply to Asana's desktop application rather than the browser-hosted product. Tab switching differs between Windows and macOS.",
      shortcuts: rows([
        ["new-window", "Open a new window", [["Ctrl", "N"]], [["Cmd", "N"]]],
        ["new-tab", "Open a new tab", [["Ctrl", "T"]], [["Cmd", "T"]]],
        ["close-tab", "Close the current tab", [["Ctrl", "W"]], [["Cmd", "W"]]],
        ["close-window", "Close the current window", [["Ctrl", "Shift", "W"]], [["Cmd", "Shift", "W"]]],
        ["reopen-tab", "Reopen the closed tab", [["Ctrl", "Shift", "T"]], [["Cmd", "Shift", "T"]]],
        ["next-tab", "Move to the next tab", [["Ctrl", "Tab"]], [["Cmd", "Option", "Right"]]],
        ["previous-tab", "Move to the previous tab", [["Ctrl", "Shift", "Tab"]], [["Cmd", "Option", "Left"]]],
        ["move-tab-right", "Move the current tab right", [["Ctrl", "Shift", "Page Up"]]],
        ["move-tab-left", "Move the current tab left", [["Ctrl", "Shift", "Page Down"]]],
        ["minimize", "Minimize the window", [["Ctrl", "M"]], [["Cmd", "M"]]],
        ["hide", "Hide Asana", [["Ctrl", "H"]], [["Cmd", "H"]]],
        ["quit", "Quit Asana", [["Ctrl", "Q"]], [["Cmd", "Q"]]],
      ]).concat({
        id: "create-task-desktop",
        action: "Create a task",
        keys: [{ platform: "windows" as const, keys: ["Ctrl", "Shift", "+"] }],
        note: "Asana's current English source prints the macOS binding as 'Command-Shif-+', so the malformed macOS row is not reproduced.",
      }),
    },
  ],
};

export default asana;
