import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["linux"] as const;

export const linuxKdePlasma: AppShortcuts = {
  slug: "linux-kde-plasma",
  name: "KDE Plasma",
  category: "Desktop environment",
  platforms: [...platforms],
  versionContext:
    "Defaults from the current KDE Plasma 6 Fundamentals and Plasma Desktop handbooks, checked September 1, 2026. Global shortcuts are configurable in System Settings, and distributions or user profiles can change them. The handbooks disagree on the direction of one Meta-plus zoom binding, so that conflicting zoom pair is omitted.",
  sourceUrl: "https://docs.kde.org/stable_kf6/en/khelpcenter/fundamentals/fundamentals.pdf",
  sourceLabel: "KDE Plasma 6 Fundamentals keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "windows",
      title: "Windows and applications",
      intro: "Switch, move, resize, minimize, and close windows from the Plasma desktop.",
      shortcuts: [
        { id: "application-launcher", action: "Open the application launcher", keys: combo(platforms, ["Meta"]) },
        { id: "run-command", action: "Open the run-command interface", keys: combo(platforms, ["Alt", "F2"]) },
        { id: "window-operations", action: "Open the window operations menu", keys: combo(platforms, ["Alt", "F3"]) },
        { id: "switch-windows", action: "Switch between windows", keys: combo(platforms, ["Alt", "Tab"]) },
        { id: "switch-windows-reverse", action: "Switch between windows in reverse", keys: combo(platforms, ["Alt", "Shift", "Tab"]) },
        { id: "close-window", action: "Close the active window", keys: combo(platforms, ["Alt", "F4"]) },
        { id: "quit-application", action: "Quit the active application", keys: combo(platforms, ["Ctrl", "Q"]) },
        { id: "force-quit", action: "Force-quit an application", keys: combo(platforms, ["Ctrl", "Alt", "Esc"]) },
        { id: "system-activity", action: "Open System Activity", keys: combo(platforms, ["Ctrl", "Esc"]) },
        { id: "maximize-restore", action: "Maximize or restore the active window", keys: combo(platforms, ["Meta", "Page Up"]) },
        { id: "minimize", action: "Minimize the active window", keys: combo(platforms, ["Meta", "Page Down"]) },
        { id: "switch-window-left", action: "Switch to the window on the left", keys: combo(platforms, ["Meta", "Alt", "Left"]) },
        { id: "switch-window-right", action: "Switch to the window on the right", keys: combo(platforms, ["Meta", "Alt", "Right"]) },
        { id: "switch-window-up", action: "Switch to the window above", keys: combo(platforms, ["Meta", "Alt", "Up"]) },
        { id: "switch-window-down", action: "Switch to the window below", keys: combo(platforms, ["Meta", "Alt", "Down"]) },
      ],
    },
    {
      id: "workspaces-and-activities",
      title: "Workspaces and activities",
      intro: "Move across virtual desktops and activities, then send the active window to another workspace or monitor.",
      shortcuts: [
        { id: "desktop-1", action: "Switch to desktop 1", keys: combo(platforms, ["Ctrl", "F1"]) },
        { id: "desktop-2", action: "Switch to desktop 2", keys: combo(platforms, ["Ctrl", "F2"]) },
        { id: "desktop-3", action: "Switch to desktop 3", keys: combo(platforms, ["Ctrl", "F3"]) },
        { id: "desktop-4", action: "Switch to desktop 4", keys: combo(platforms, ["Ctrl", "F4"]) },
        { id: "next-activity", action: "Switch to the next activity", keys: combo(platforms, ["Meta", "Tab"]) },
        { id: "previous-activity", action: "Switch to the previous activity", keys: combo(platforms, ["Meta", "Shift", "Tab"]) },
        { id: "manage-activities", action: "Open Activities management", keys: combo(platforms, ["Meta", "Q"]) },
        { id: "move-monitor-left", action: "Move the active window to the left monitor", keys: combo(platforms, ["Shift", "Meta", "Left"]) },
        { id: "move-monitor-right", action: "Move the active window to the right monitor", keys: combo(platforms, ["Shift", "Meta", "Right"]) },
        { id: "move-monitor-up", action: "Move the active window to the monitor above", keys: combo(platforms, ["Shift", "Meta", "Up"]) },
        { id: "move-monitor-down", action: "Move the active window to the monitor below", keys: combo(platforms, ["Shift", "Meta", "Down"]) },
      ],
    },
    {
      id: "desktop",
      title: "Plasma desktop",
      intro: "Use the documented Alt+D sequences to manage widgets, activities, and desktop settings without opening System Settings.",
      shortcuts: [
        { id: "add-widget", action: "Add widgets", keys: combo(platforms, ["Alt", "D", "then", "A"]) },
        { id: "remove-widget", action: "Remove a widget", keys: combo(platforms, ["Alt", "D", "then", "R"]) },
        { id: "lock-widgets", action: "Lock or unlock widgets", keys: combo(platforms, ["Alt", "D", "then", "L"]) },
        { id: "next-widget", action: "Focus the next widget", keys: combo(platforms, ["Alt", "D", "then", "N"]) },
        { id: "previous-widget", action: "Focus the previous widget", keys: combo(platforms, ["Alt", "D", "then", "P"]) },
        { id: "widget-settings", action: "Open widget settings", keys: combo(platforms, ["Alt", "D", "then", "S"]) },
        { id: "activity-settings", action: "Open activity settings", keys: combo(platforms, ["Alt", "D", "then", "Alt", "S"]) },
        { id: "remove-activity", action: "Remove the current activity", keys: combo(platforms, ["Alt", "D", "then", "Alt", "R"]) },
        { id: "add-activity", action: "Open Activities management", keys: combo(platforms, ["Alt", "D", "then", "Alt", "A"]) },
        { id: "associated-application", action: "Run the associated application", keys: combo(platforms, ["Alt", "D", "then", "T"]) },
        { id: "peek-desktop", action: "Peek at the desktop", keys: combo(platforms, ["Ctrl", "F12"]) },
      ],
    },
    {
      id: "common-editing",
      title: "Common document and file actions",
      intro: "These KDE handbook defaults apply in many standard document and file views, subject to the active application.",
      shortcuts: [
        { id: "refresh", action: "Refresh the current view", keys: combo(platforms, ["F5"]) },
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"]) },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"]) },
        { id: "new", action: "Create a new document or item", keys: combo(platforms, ["Ctrl", "N"]) },
        { id: "print", action: "Print", keys: combo(platforms, ["Ctrl", "P"]) },
        { id: "save", action: "Save", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "close", action: "Close the current document or view", keys: combo(platforms, ["Ctrl", "W"]) },
        { id: "help", action: "Open Help", keys: combo(platforms, ["F1"]) },
        { id: "whats-this", action: "Open What's This help", keys: combo(platforms, ["Shift", "F1"]) },
      ],
    },
  ],
};

export default linuxKdePlasma;
