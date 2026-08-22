import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

export const windows: AppShortcuts = {
  slug: "windows",
  name: "Windows 11",
  category: "Operating system",
  platforms: ["windows"],
  intro:
    "Windows 11 puts window management and desktop movement on the Windows key. This reference covers snapping, virtual desktops, screenshots, text editing, and the system tools that are easy to forget.",
  versionContext:
    "Applies to Windows 11; the same Microsoft page also lists Windows 10 differences. Some entries such as snap layouts and clipboard history are Windows 11 features.",
  sourceUrl:
    "https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec",
  sourceLabel: "official Microsoft shortcut list",
  lastVerified: "2026-08-21",
  groups: [
    {
      id: "window-management",
      title: "Window management",
      intro: "Switch, snap, resize, minimize, maximize, and close the windows on the desktop.",
      shortcuts: [
        { id: "snap-left", action: "Snap the window to the left half", keys: [{ platform: "windows", keys: ["Win", "Left"] }] },
        { id: "snap-right", action: "Snap the window to the right half", keys: [{ platform: "windows", keys: ["Win", "Right"] }] },
        { id: "maximize", action: "Maximize the active window", keys: [{ platform: "windows", keys: ["Win", "Up"] }] },
        { id: "minimize", action: "Minimize the active window", keys: [{ platform: "windows", keys: ["Win", "Down"] }] },
        {
          id: "snap-layouts",
          action: "Open snap layouts",
          keys: [{ platform: "windows", keys: ["Win", "Z"] }],
          note: "Windows 11 feature for picking a snap arrangement.",
        },
        {
          id: "snap-top-half",
          action: "Snap the window to the top half",
          keys: [{ platform: "windows", keys: ["Win", "Alt", "Up"] }],
        },
        {
          id: "move-window-monitor-left",
          action: "Move the window to the monitor on the left",
          keys: [{ platform: "windows", keys: ["Win", "Shift", "Left"] }],
          note: "Win+Shift+Right moves it to the right monitor.",
        },
        {
          id: "switch-windows",
          action: "Switch between open windows",
          keys: [{ platform: "windows", keys: ["Alt", "Tab"] }],
          note: "Keep holding Alt and press Tab repeatedly to cycle.",
        },
        {
          id: "close-app",
          action: "Close the active window or app",
          keys: [{ platform: "windows", keys: ["Alt", "F4"] }],
        },
        { id: "show-desktop", action: "Display and hide the desktop", keys: [{ platform: "windows", keys: ["Win", "D"] }] },
        { id: "switch-windows-backward", action: "Switch through open windows in reverse", keys: [{ platform: "windows", keys: ["Alt", "Shift", "Tab"] }] },
        { id: "switch-windows-order", action: "Cycle through windows in the order they opened", keys: [{ platform: "windows", keys: ["Alt", "Esc"] }] },
        { id: "window-menu", action: "Open the active window menu", keys: [{ platform: "windows", keys: ["Alt", "Space"] }] },
        { id: "minimize-rest", action: "Minimize every window except the active one", keys: [{ platform: "windows", keys: ["Win", "Home"] }] },
        { id: "stretch-vertical", action: "Stretch the active window vertically", keys: [{ platform: "windows", keys: ["Win", "Shift", "Up"] }] },
        { id: "move-window-right", action: "Move the window to the monitor on the right", keys: [{ platform: "windows", keys: ["Win", "Shift", "Right"] }] },
      ],
    },
    {
      id: "virtual-desktops",
      title: "Virtual desktops",
      intro: "Create, switch, close, and move windows across virtual desktops.",
      shortcuts: [
        { id: "task-view", action: "Open Task view", keys: [{ platform: "windows", keys: ["Win", "Tab"] }] },
        { id: "new-desktop", action: "Create another desktop", keys: [{ platform: "windows", keys: ["Win", "Ctrl", "D"] }] },
        {
          id: "next-desktop",
          action: "Switch to the virtual desktop on the right",
          keys: [{ platform: "windows", keys: ["Win", "Ctrl", "Right"] }],
        },
        {
          id: "previous-desktop",
          action: "Switch to the virtual desktop on the left",
          keys: [{ platform: "windows", keys: ["Win", "Ctrl", "Left"] }],
        },
        {
          id: "close-desktop",
          action: "Close the desktop you are using",
          keys: [{ platform: "windows", keys: ["Win", "Ctrl", "F4"] }],
        },
      ],
    },
    {
      id: "screenshots",
      title: "Screenshots and recording",
      intro: "Capture the screen, a window, or a region, then open the recording and gaming controls.",
      shortcuts: [
        {
          id: "snip-region",
          action: "Capture a region of the screen to the clipboard",
          keys: [{ platform: "windows", keys: ["Win", "Shift", "S"] }],
          note: "Opens Snipping Tool for markup and sharing.",
        },
        {
          id: "screenshot-save-file",
          action: "Save a full screen screenshot to the Screenshots folder",
          keys: [{ platform: "windows", keys: ["Win", "PrtScn"] }],
        },
        {
          id: "screenshot-active-window",
          action: "Capture the active window to the clipboard",
          keys: [{ platform: "windows", keys: ["Alt", "PrtScn"] }],
        },
        {
          id: "record-screen-region",
          action: "Record a video of a selected screen region",
          keys: [{ platform: "windows", keys: ["Win", "Shift", "R"] }],
          note: "Saves an MP4 through Snipping Tool.",
        },
      ],
    },
    {
      id: "text-editing",
      title: "Text editing",
      intro: "Use the common Windows editing keys for selection, clipboard work, undo, and cursor movement.",
      shortcuts: [
        { id: "undo", action: "Undo the previous action", keys: [{ platform: "windows", keys: ["Ctrl", "Z"] }] },
        { id: "redo", action: "Redo the previous action", keys: [{ platform: "windows", keys: ["Ctrl", "Y"] }] },
        { id: "cut", action: "Cut the selection", keys: [{ platform: "windows", keys: ["Ctrl", "X"] }] },
        { id: "copy", action: "Copy the selection", keys: [{ platform: "windows", keys: ["Ctrl", "C"] }] },
        { id: "paste", action: "Paste from the clipboard", keys: [{ platform: "windows", keys: ["Ctrl", "V"] }] },
        { id: "select-all", action: "Select all content", keys: [{ platform: "windows", keys: ["Ctrl", "A"] }] },
        {
          id: "paste-plain-text",
          action: "Paste as plain text",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "V"] }],
          note: "May not work in every application.",
        },
        {
          id: "delete-word-left",
          action: "Delete words to the left of the cursor",
          keys: [{ platform: "windows", keys: ["Ctrl", "Backspace"] }],
        },
        { id: "find-text", action: "Find text", keys: [{ platform: "windows", keys: ["Ctrl", "F"] }] },
      ],
    },
    {
      id: "system-tools",
      title: "System and tools",
      intro: "Open Settings, Search, File Explorer, Run, clipboard history, accessibility, and system menus.",
      shortcuts: [
        { id: "file-explorer", action: "Open File Explorer", keys: [{ platform: "windows", keys: ["Win", "E"] }] },
        { id: "settings", action: "Open Settings", keys: [{ platform: "windows", keys: ["Win", "I"] }] },
        { id: "run", action: "Open the Run dialog", keys: [{ platform: "windows", keys: ["Win", "R"] }] },
        { id: "search", action: "Open Search", keys: [{ platform: "windows", keys: ["Win", "S"] }] },
        { id: "quick-link", action: "Open the Quick Link menu", keys: [{ platform: "windows", keys: ["Win", "X"] }] },
        { id: "action-center", action: "Open the notification center", keys: [{ platform: "windows", keys: ["Win", "A"] }] },
        { id: "dictation", action: "Start dictation", keys: [{ platform: "windows", keys: ["Win", "H"] }] },
        { id: "connect", action: "Open the Connect quick action", keys: [{ platform: "windows", keys: ["Win", "K"] }] },
        { id: "lock-pc", action: "Lock the computer", keys: [{ platform: "windows", keys: ["Win", "L"] }] },
        {
          id: "clipboard-history",
          action: "Open the clipboard history",
          keys: [{ platform: "windows", keys: ["Win", "V"] }],
          note: "Clipboard history must be turned on the first time you use this.",
        },
        {
          id: "task-manager",
          action: "Open Task Manager",
          keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Esc"] }],
        },
      ],
    },
  ],
};
