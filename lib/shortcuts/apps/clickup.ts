import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, windows: string[], macos?: string[], note?: string];
const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos = windows, note]) => ({
    id,
    action,
    keys: [
      { platform: "windows", keys: windows },
      { platform: "macos", keys: macos },
    ],
    ...(note ? { note } : {}),
  }));

export const clickup: AppShortcuts = {
  slug: "clickup",
  name: "ClickUp",
  category: "Project management",
  platforms: ["windows", "macos"],
  intro:
    "ClickUp's official shortcut set covers workspace navigation, task creation, text editing, Chat, Inbox triage, views, SyncUps, and desktop-wide capture commands.",
  versionContext:
    "Current ClickUp Help shortcut table checked August 31, 2026. Workspace shortcuts are disabled by default and must be enabled in personal settings. Most global commands require focus outside a text field. Chat and SyncUps commands depend on those ClickApps being available.",
  sourceUrl: "https://help.clickup.com/hc/en-us/articles/6309030550167-Use-keyboard-shortcuts",
  sourceLabel: "ClickUp keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "global-navigation",
      title: "Global actions and navigation",
      intro:
        "Create work, open search and ClickUp Brain, control the sidebar, and move to the main Home, Inbox, or Dashboards destinations.",
      shortcuts: [
        ...rows([
          ["create-task", "Create a task", ["T"]],
          ["create-reminder", "Create a reminder", ["R"]],
          ["search", "Open Search or the AI Command Bar", ["Ctrl", "K"], ["Cmd", "K"]],
          ["brain", "Open ClickUp Brain", ["Ctrl", "O"], ["Cmd", "O"]],
          ["saved-prompts", "Search saved prompts in ClickUp Brain", ["Alt", "K"], ["Option", "K"], "ClickUp Brain must already be open."],
          ["sidebar", "Show or hide the sidebar", ["Ctrl", "\\"], ["Cmd", "\\"]],
          ["sidebar-position", "Scroll to the current position in the left Sidebar", ["Ctrl", "I"], ["Cmd", "I"]],
          ["home", "Go to Home", ["H"]],
          ["inbox", "Go to Inbox", ["I"]],
          ["dashboards", "Go to Dashboards", ["D"]],
          ["close", "Close the active task or window", ["Esc"]],
        ]),
        {
          id: "search-single-key",
          action: "Open Search or the AI Command Bar with the single-key binding",
          keys: [
            { platform: "windows", keys: ["S"] },
            { platform: "macos", keys: ["S"] },
          ],
        },
        {
          id: "notepad",
          action: "Open Notepad",
          keys: [
            { platform: "windows", keys: ["N"], alternatives: [["P"]] },
            { platform: "macos", keys: ["N"], alternatives: [["P"]] },
          ],
        },
      ],
    },
    {
      id: "text-editor",
      title: "Text editor",
      intro:
        "Use these bindings in ClickUp comments, Docs, Whiteboards, columns, Chat, Dashboard text cards, and Notepad editing fields.",
      shortcuts: rows([
        ["slash-commands", "Open Slash Commands", ["/"]],
        ["mention-user", "Mention a user", ["@"]],
        ["mention-task", "Mention a task", ["@", "@"]],
        ["mention-doc", "Mention a Doc", ["@", "@", "@"]],
        ["edit-comment", "Edit the most recent comment while in the comment editor", ["Up"]],
        ["emoji", "Add an emoji while in the text editor", [":"]],
        ["paste", "Paste text or images", ["Ctrl", "V"], ["Cmd", "V"]],
        ["hyperlink", "Link the selected text", ["Ctrl", "K"], ["Cmd", "K"]],
        ["highlight", "Apply the last used highlighting color", ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]],
        ["duplicate-text", "Duplicate selected text", ["Ctrl", "D"], ["Cmd", "D"]],
        ["align-left", "Align text to the left", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]],
        ["align-right", "Align text to the right", ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]],
        ["align-center", "Align text to the center", ["Ctrl", "Shift", "E"], ["Cmd", "Shift", "E"]],
        ["inline-code", "Apply inline code formatting", ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]],
        ["bulleted-list", "Create a bulleted list", ["Ctrl", "Shift", "9"], ["Cmd", "Shift", "9"]],
        ["checklist", "Create a checklist", ["Ctrl", "Shift", "8"], ["Cmd", "Shift", "8"]],
        ["numbered-list", "Create a numbered list", ["Ctrl", "Shift", "7"], ["Cmd", "Shift", "7"]],
        ["heading", "Create a level 1 through 4 heading", ["Alt", "Ctrl", "1-4"], ["Option", "Cmd", "1-4"]],
        ["toggle-item", "Toggle the current item", ["Ctrl", "Shift", "6"], ["Cmd", "Shift", "6"]],
        ["toggle-all", "Toggle all items", ["Alt", "Ctrl", "6"], ["Option", "Cmd", "6"]],
      ]),
    },
    {
      id: "tasks",
      title: "Tasks and subtasks",
      intro:
        "Change common task fields, assign ownership, start a timer, create a subtask, or move between tasks in the current List.",
      shortcuts: [
        ...rows([
          ["task-status", "Open the task Status field", ["Shift", "S"]],
          ["task-comment", "Open the task Comment field", ["Shift", "M"]],
          ["task-date", "Open the task Date field", ["Shift", "D"]],
          ["task-assignee", "Open the task Assignee field", ["Shift", "A"]],
          ["assign-self", "Assign the task to yourself", ["M"]],
          ["task-priorities", "Add the task to Priorities", ["Alt", "A"], ["Option", "A"]],
          ["task-timer", "Open the task Timer", ["Shift", "."]],
          ["task-tag", "Open the task Tag field", ["Shift", "L"]],
          ["task-subtask", "Create a subtask", ["Shift", "T"]],
          ["task-priority", "Open the task Priority field", ["Shift", "P"]],
        ]),
        {
          id: "create-open-subtask",
          action: "Create and open a subtask",
          keys: [
            { platform: "windows", keys: ["Cmd", "Enter"], note: "ClickUp's current source labels this combination for PC." },
            { platform: "macos", keys: ["Ctrl", "Return"], note: "ClickUp's current source labels this combination for Mac." },
          ],
        },
        {
          id: "navigate-tasks",
          action: "Navigate between tasks in a List",
          keys: [
            { platform: "windows", keys: ["Ctrl", "Shift", "Left"], alternatives: [["Ctrl", "Shift", "Right"]] },
            { platform: "macos", keys: ["Ctrl", "Shift", "Left"], alternatives: [["Ctrl", "Shift", "Right"]] },
          ],
        },
      ],
    },
    {
      id: "chat",
      title: "Chat",
      intro:
        "Compose and search messages, jump to unread work, or act on the message or Channel whose context menu is currently open.",
      shortcuts: rows([
        ["chat-compose", "Compose a message", ["Ctrl", "G"], ["Cmd", "G"]],
        ["chat-edit", "Edit the selected message", ["E"], undefined, "The message context menu must be open."],
        ["chat-unread", "Mark the selected message read or unread", ["U"], undefined, "The message context menu must be open."],
        ["chat-copy", "Copy a link to the selected message", ["C"], undefined, "The message context menu must be open."],
        ["chat-delete", "Delete the selected message", ["Delete"], undefined, "The message context menu must be open."],
        ["channel-unread", "Mark the selected Channel read or unread", ["U"], undefined, "The Channel context menu must be open."],
        ["channel-copy", "Copy a link to the selected Channel", ["C"], undefined, "The Channel context menu must be open."],
        ["chat-search", "Search for messages", ["Ctrl", "F"], ["Cmd", "F"]],
        ["first-unread", "Jump to the first unread message in the conversation", ["Ctrl", "Shift", "J"], ["Cmd", "Shift", "J"]],
      ]),
    },
    {
      id: "inbox",
      title: "Inbox triage",
      intro:
        "Switch Inbox tabs and filters, open notifications, move through the queue, clear or snooze work, and update watch and Tray state.",
      shortcuts: [
        ...rows([
          ["inbox-all", "Go to the All tab", ["Shift", "A"]],
          ["inbox-primary", "Go to the Primary or Important tab", ["Shift", "P"]],
          ["inbox-other", "Go to the Other tab", ["Shift", "O"]],
          ["inbox-snoozed", "Go to the Snoozed tab", ["Shift", "Z"]],
          ["inbox-cleared", "Go to the Cleared tab", ["Shift", "C"]],
          ["filter-assigned", "Toggle the Assigned filter", ["Shift", "1"]],
          ["filter-mentions", "Toggle the @Mentions filter", ["Shift", "2"]],
          ["filter-unread", "Toggle the Unread filter", ["Shift", "3"]],
          ["close-notification", "Close the active notification", ["Esc"]],
          ["details", "Open or close the Details sidebar", ["]"]],
          ["inbox-top", "Jump to the top of Inbox", ["Shift", "Up"]],
          ["inbox-bottom", "Jump to the bottom of Inbox", ["Shift", "Down"]],
          ["inbox-refresh", "Refresh Inbox", ["Space"]],
          ["clear", "Clear or unclear the notification", ["E"]],
          ["clear-all", "Clear all notifications", ["Shift", "E"]],
          ["snooze", "Snooze the notification", ["Z"]],
          ["undo-inbox", "Undo the last clear, unclear, or snooze", ["Ctrl", "Z"], ["Cmd", "Z"]],
          ["mark-unread", "Mark the notification read or unread", ["U"]],
          ["watch", "Watch or stop watching", ["W"]],
          ["tray", "Add or remove the item from Tray", ["Ctrl", "Windows", "T"], ["Ctrl", "Cmd", "T"]],
        ]),
        {
          id: "open-notification",
          action: "Open or close the selected notification",
          keys: [
            { platform: "windows", keys: ["O"], alternatives: [["Enter"]] },
            { platform: "macos", keys: ["O"], alternatives: [["Return"]] },
          ],
        },
        {
          id: "next-notification",
          action: "Go to the next notification",
          keys: [
            { platform: "windows", keys: ["J"], alternatives: [["Down"]] },
            { platform: "macos", keys: ["J"], alternatives: [["Down"]] },
          ],
        },
        {
          id: "previous-notification",
          action: "Go to the previous notification",
          keys: [
            { platform: "windows", keys: ["K"], alternatives: [["Up"]] },
            { platform: "macos", keys: ["K"], alternatives: [["Up"]] },
          ],
        },
      ],
    },
    {
      id: "views-syncups",
      title: "Views and SyncUps",
      intro:
        "Change the current task view, then control calls, media, recording, screen sharing, and participant or thread panels during a SyncUp.",
      shortcuts: rows([
        ["view-assign-self", "Assign the selected view task to yourself", ["M"]],
        ["view-priorities", "Add the selected view task to Priorities", ["A"]],
        ["clear-filters", "Clear the current view filters", ["-"]],
        ["list-view", "Navigate to List view", ["L"]],
        ["board-view", "Navigate to Board view", ["B"]],
        ["calendar-view", "Navigate to Calendar view", ["C"]],
        ["team-view", "Navigate to Team view", ["X"]],
        ["syncup-call", "Toggle the SyncUp call", ["Alt", "Ctrl", "H"], ["Option", "Cmd", "H"]],
        ["syncup-mic", "Toggle the microphone", ["Alt", "Ctrl", "Shift", "M"], ["Option", "Cmd", "Shift", "M"]],
        ["syncup-camera", "Toggle the camera", ["Alt", "Ctrl", "O"], ["Option", "Cmd", "O"]],
        ["syncup-sharing", "Toggle screen sharing", ["Alt", "Ctrl", "Shift", "S"], ["Option", "Cmd", "Shift", "S"]],
        ["syncup-thread", "Toggle the thread sidebar", ["Alt", "Ctrl", "Shift", "C"], ["Option", "Cmd", "Shift", "C"]],
        ["syncup-participants", "Toggle the participants sidebar", ["Alt", "Ctrl", "Shift", "P"], ["Option", "Cmd", "Shift", "P"]],
        ["syncup-fullscreen", "Open full-screen mode", ["Alt", "Ctrl", "N"], ["Option", "Cmd", "N"]],
        ["syncup-invite", "Invite participants", ["Alt", "Ctrl", "Shift", "E"], ["Option", "Cmd", "Shift", "E"]],
        ["syncup-record", "Start or stop recording", ["Alt", "Ctrl", "R"], ["Option", "Cmd", "R"]],
        ["syncup-unmute", "Temporarily unmute yourself", ["Space"], undefined, "Available only while the SyncUp is full-screen."],
      ]),
    },
    {
      id: "desktop",
      title: "Desktop-wide commands",
      intro:
        "Use these system-wide commands from another app while the ClickUp desktop app is running, or change them in desktop app settings.",
      shortcuts: rows([
        ["desktop-task", "Create a new task from any app", ["Ctrl", "E"], ["Cmd", "E"]],
        ["desktop-command-center", "Open Command Center from any app", ["Ctrl", "J"], ["Cmd", "J"]],
      ]),
    },
  ],
};

export default clickup;
