import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

export const gnome: AppShortcuts = {
  slug: "gnome",
  name: "Linux GNOME",
  category: "Desktop environment",
  platforms: ["linux"],
  intro:
    "GNOME's Super-key shortcuts connect the desktop shell to the work inside its windows. This list moves through Activities, workspaces, windows, screenshots, text editing, and system controls.",
  versionContext:
    "GNOME desktop defaults from the stable GNOME Help documentation. Some shortcuts involve the Super key and can vary by distribution.",
  sourceUrl: "https://help.gnome.org/users/gnome-help/stable/shell-keyboard-shortcuts.html.en",
  sourceLabel: "official GNOME Help shortcut list",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "desktop-navigation",
      title: "Desktop navigation",
      intro: "The Super key usually sits next to Alt and opens the Activities overview.",
      shortcuts: [
        {
          id: "activities-overview",
          action: "Switch between the Activities overview and the desktop",
          keys: [{ platform: "linux", keys: ["Super"] }],
          note: "Start typing in the overview to search apps, contacts, and documents.",
        },
        {
          id: "show-applications",
          action: "Show the list of applications",
          keys: [{ platform: "linux", keys: ["Super", "A"] }],
        },
        {
          id: "switch-applications",
          action: "Quickly switch between windows",
          keys: [{ platform: "linux", keys: ["Super", "Tab"] }],
          note: "Hold Shift for reverse order.",
        },
        {
          id: "switch-windows-same-app",
          action: "Switch between windows of the same application",
          keys: [{ platform: "linux", keys: ["Super", "`"] }],
          note: "On non-US keyboards this is Super plus the key above Tab.",
        },
        {
          id: "switch-windows-directly",
          action: "Switch between windows in the current workspace",
          keys: [{ platform: "linux", keys: ["Alt", "Esc"] }],
        },
        {
          id: "run-command-prompt",
          action: "Pop up the run command prompt",
          keys: [{ platform: "linux", keys: ["Alt", "F2"] }],
          note: "Arrow keys recall previously run commands.",
        },
      ],
    },
    {
      id: "workspaces",
      title: "Workspaces",
      intro: "Move between workspaces, send the current window to another one, and keep the desktop arranged.",
      shortcuts: [
        {
          id: "workspace-left",
          action: "Switch to the workspace on the left",
          keys: [{ platform: "linux", keys: ["Super", "Page Up"] }],
        },
        {
          id: "workspace-right",
          action: "Switch to the workspace on the right",
          keys: [{ platform: "linux", keys: ["Super", "Page Down"] }],
        },
        {
          id: "move-window-workspace-left",
          action: "Move the window one workspace left",
          keys: [{ platform: "linux", keys: ["Shift", "Super", "Page Up"] }],
        },
        {
          id: "move-window-workspace-right",
          action: "Move the window one workspace right",
          keys: [{ platform: "linux", keys: ["Shift", "Super", "Page Down"] }],
        },
      ],
    },
    {
      id: "window-management",
      title: "Window management",
      intro:
        "These are the documented GNOME defaults from Keyboard settings; a few are disabled by default on some versions and distributions.",
      shortcuts: [
        { id: "maximize-window", action: "Maximize window", keys: [{ platform: "linux", keys: ["Super", "Up"] }] },
        { id: "restore-window", action: "Restore window", keys: [{ platform: "linux", keys: ["Super", "Down"] }] },
        { id: "split-left", action: "View split on left", keys: [{ platform: "linux", keys: ["Super", "Left"] }] },
        { id: "split-right", action: "View split on right", keys: [{ platform: "linux", keys: ["Super", "Right"] }] },
        { id: "close-window", action: "Close window", keys: [{ platform: "linux", keys: ["Alt", "F4"] }] },
        { id: "hide-window", action: "Hide window", keys: [{ platform: "linux", keys: ["Super", "H"] }] },
        {
          id: "move-window",
          action: "Start moving the focused window with the keyboard",
          keys: [{ platform: "linux", keys: ["Alt", "F7"] }],
        },
        {
          id: "resize-window",
          action: "Start resizing the focused window with the keyboard",
          keys: [{ platform: "linux", keys: ["Alt", "F8"] }],
        },
      ],
    },
    {
      id: "screenshots",
      title: "Screenshots and recording",
      intro: "Capture the screen, a window, or a selected area, then start or stop a screen recording.",
      shortcuts: [
        {
          id: "screenshot-tool",
          action: "Launch the interactive screenshot tool",
          keys: [{ platform: "linux", keys: ["Print"] }],
        },
        {
          id: "screenshot-window",
          action: "Save a screenshot of a window",
          keys: [{ platform: "linux", keys: ["Alt", "Print"] }],
        },
        {
          id: "screenshot-full-screen",
          action: "Save a screenshot of the entire screen",
          keys: [{ platform: "linux", keys: ["Shift", "Print"] }],
        },
        {
          id: "screencast-record",
          action: "Start and stop screencast recording",
          keys: [{ platform: "linux", keys: ["Ctrl", "Alt", "Shift", "R"] }],
        },
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Use the desktop's common text-editing keys in fields and applications that follow GTK defaults.",
      shortcuts: [
        { id: "copy", action: "Copy selected text or items", keys: [{ platform: "linux", keys: ["Ctrl", "C"] }] },
        { id: "paste", action: "Paste the clipboard contents", keys: [{ platform: "linux", keys: ["Ctrl", "V"] }] },
        { id: "undo", action: "Undo the last action", keys: [{ platform: "linux", keys: ["Ctrl", "Z"] }] },
        {
          id: "terminal-copy",
          action: "Copy highlighted text in the Terminal",
          keys: [{ platform: "linux", keys: ["Ctrl", "Shift", "C"] }],
        },
        {
          id: "terminal-paste",
          action: "Paste into the Terminal",
          keys: [{ platform: "linux", keys: ["Ctrl", "Shift", "V"] }],
        },
      ],
    },
    {
      id: "system",
      title: "System",
      intro: "Open system menus, lock the screen, adjust media, and reach accessibility controls.",
      shortcuts: [
        { id: "lock-screen", action: "Lock the screen", keys: [{ platform: "linux", keys: ["Super", "L"] }] },
        {
          id: "power-off-dialog",
          action: "Show the Power Off dialog",
          keys: [{ platform: "linux", keys: ["Ctrl", "Alt", "Delete"] }],
        },
        {
          id: "notification-list",
          action: "Show the notification list",
          keys: [{ platform: "linux", keys: ["Super", "V"] }],
          note: "Press again or Esc to close.",
        },
      ],
    },
  ],
};
