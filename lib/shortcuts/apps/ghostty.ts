import { perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["macos", "linux"] as const;

export const ghostty: AppShortcuts = {
  slug: "ghostty",
  name: "Ghostty",
  category: "Terminal emulator",
  platforms: [...platforms],
  versionContext:
    "Current default bindings from Ghostty's official keybind documentation and repository source checked in August 2026. Ghostty is supported on macOS and Linux, every keybind is remappable, and ghostty +list-keybinds --default prints the complete build-specific list.",
  sourceUrl: "https://ghostty.org/docs/config/keybind",
  sourceLabel: "official Ghostty keybind documentation",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "splits",
      title: "Splits and pane focus",
      intro: "Create splits, move between them by direction, zoom the focused split, and adjust the layout without leaving the terminal.",
      shortcuts: [
        { id: "split-right", action: "Create a split to the right", keys: perPlatform(platforms, { macos: ["Cmd", "D"], linux: ["Ctrl", "Shift", "O"] }) },
        { id: "split-down", action: "Create a split below", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "D"], linux: ["Ctrl", "Shift", "E"] }) },
        { id: "focus-previous-split", action: "Focus the previous split", keys: perPlatform(platforms, { macos: ["Cmd", "["], linux: ["Ctrl", "Super", "["] }) },
        { id: "focus-next-split", action: "Focus the next split", keys: perPlatform(platforms, { macos: ["Cmd", "]"], linux: ["Ctrl", "Super", "]"] }) },
        { id: "focus-split-direction", action: "Focus the split in a direction", keys: perPlatform(platforms, { macos: ["Cmd", "Option", "Up"], linux: ["Ctrl", "Alt", "Up"] }), note: "Use the corresponding arrow for down, left, or right." },
        { id: "toggle-split-zoom", action: "Zoom the focused split to fill the tab", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "Enter"], linux: ["Ctrl", "Shift", "Enter"] }) },
        { id: "resize-split", action: "Resize the focused split", keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "Up"], linux: ["Cmd", "Ctrl", "Shift", "Up"] }), note: "Use the corresponding arrow for down, left, or right. Ghostty's Linux source calls Super the Cmd key." },
        { id: "equalize-splits", action: "Equalize split sizes", keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "="] , linux: ["Ctrl", "Shift", "="] }) },
        { id: "close-surface", action: "Close the focused surface", keys: perPlatform(platforms, { macos: ["Cmd", "W"], linux: ["Ctrl", "Shift", "W"] }), note: "A surface may be a split, tab, or window depending on the current layout." },
      ],
    },
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Open, close, switch, and jump among terminal tabs and windows while preserving each running process.",
      shortcuts: [
        { id: "new-tab", action: "Open a new tab", keys: perPlatform(platforms, { macos: ["Cmd", "T"], linux: ["Ctrl", "Shift", "T"] }) },
        { id: "new-window", action: "Open a new window", keys: perPlatform(platforms, { macos: ["Cmd", "N"], linux: ["Ctrl", "Shift", "N"] }) },
        { id: "next-tab", action: "Switch to the next tab", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "]"], linux: ["Ctrl", "Tab"] }), note: "Linux also documents Ctrl+Page Down and Ctrl+Shift+Right." },
        { id: "previous-tab", action: "Switch to the previous tab", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "["], linux: ["Ctrl", "Shift", "Tab"] }), note: "Linux also documents Ctrl+Page Up and Ctrl+Shift+Left." },
        { id: "last-tab", action: "Jump to the last tab", keys: perPlatform(platforms, { macos: ["Cmd", "9"], linux: ["Alt", "9"] }) },
        { id: "tab-by-number", action: "Jump to a tab by number", keys: perPlatform(platforms, { macos: ["Cmd", "1"], linux: ["Alt", "1"] }), note: "Use the corresponding digit for tabs one through eight; 9 is the last tab." },
        { id: "close-tab", action: "Close the current tab and its splits", keys: perPlatform(platforms, { macos: ["Cmd", "Option", "W"], linux: ["Ctrl", "Shift", "W"] }), note: "On macOS Cmd+W closes only the focused surface." },
        { id: "close-window", action: "Close the current window", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "W"], linux: ["Alt", "F4"] }) },
        { id: "quit", action: "Quit Ghostty", keys: perPlatform(platforms, { macos: ["Cmd", "Q"], linux: ["Ctrl", "Shift", "Q"] }) },
      ],
    },
    {
      id: "clipboard-search-and-scrollback",
      title: "Clipboard, search, and scrollback",
      intro: "Copy terminal output, search the current surface, select text, and move through scrollback or shell-integrated prompts.",
      shortcuts: [
        { id: "copy", action: "Copy the selection", keys: perPlatform(platforms, { macos: ["Cmd", "C"], linux: ["Ctrl", "Shift", "C"] }) },
        { id: "paste", action: "Paste from the clipboard", keys: perPlatform(platforms, { macos: ["Cmd", "V"], linux: ["Ctrl", "Shift", "V"] }) },
        { id: "paste-selection", action: "Paste from the selection clipboard", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "V"], linux: ["Shift", "Insert"] }) },
        { id: "select-all", action: "Select all visible terminal text", keys: perPlatform(platforms, { macos: ["Cmd", "A"], linux: ["Ctrl", "Shift", "A"] }) },
        { id: "find", action: "Open terminal search", keys: perPlatform(platforms, { macos: ["Cmd", "F"], linux: ["Ctrl", "Shift", "F"] }), note: "Cmd+Shift+F ends search; Cmd+G and Cmd+Shift+G move to the next or previous match on macOS. Cmd+F or Ctrl+F searches the current selection when configured by the platform." },
        { id: "end-search", action: "Close terminal search", keys: perPlatform(platforms, { macos: ["Esc"], linux: ["Esc"] }) },
        { id: "scroll-page-up", action: "Scroll up one page", keys: perPlatform(platforms, { macos: ["Cmd", "Page Up"], linux: ["Shift", "Page Up"] }) },
        { id: "scroll-page-down", action: "Scroll down one page", keys: perPlatform(platforms, { macos: ["Cmd", "Page Down"], linux: ["Shift", "Page Down"] }) },
        { id: "scroll-top", action: "Scroll to the top of scrollback", keys: perPlatform(platforms, { macos: ["Cmd", "Home"], linux: ["Shift", "Home"] }) },
        { id: "scroll-bottom", action: "Scroll to the bottom of scrollback", keys: perPlatform(platforms, { macos: ["Cmd", "End"], linux: ["Shift", "End"] }) },
        { id: "previous-prompt", action: "Jump to the previous shell prompt", keys: perPlatform(platforms, { macos: ["Cmd", "Up"], linux: ["Ctrl", "Shift", "Page Up"] }), note: "Shell integration is required." },
        { id: "next-prompt", action: "Jump to the next shell prompt", keys: perPlatform(platforms, { macos: ["Cmd", "Down"], linux: ["Ctrl", "Shift", "Page Down"] }), note: "Shell integration is required." },
      ],
    },
    {
      id: "view-and-configuration",
      title: "View and configuration",
      intro: "Change font size, clear or inspect the terminal, open the action palette, toggle fullscreen, and reload configuration.",
      shortcuts: [
        { id: "font-size-up", action: "Increase font size", keys: perPlatform(platforms, { macos: ["Cmd", "+"], linux: ["Ctrl", "+"] }), note: "The = form also increases size." },
        { id: "font-size-down", action: "Decrease font size", keys: perPlatform(platforms, { macos: ["Cmd", "-"], linux: ["Ctrl", "-"] }) },
        { id: "font-size-reset", action: "Reset font size", keys: perPlatform(platforms, { macos: ["Cmd", "0"], linux: ["Ctrl", "0"] }) },
        { id: "clear-screen", action: "Clear the screen and scrollback", keys: perPlatform(platforms, { macos: ["Cmd", "K"], linux: ["Ctrl", "L"] }) },
        { id: "toggle-fullscreen", action: "Toggle fullscreen", keys: perPlatform(platforms, { macos: ["Cmd", "Ctrl", "F"], linux: ["Ctrl", "Enter"] }), note: "Cmd+Enter is also a macOS default." },
        { id: "open-config", action: "Open the Ghostty config file", keys: perPlatform(platforms, { macos: ["Cmd", ","], linux: ["Ctrl", ","] }) },
        { id: "reload-config", action: "Reload configuration", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", ","], linux: ["Ctrl", "Shift", ","] }) },
        { id: "command-palette", action: "Open the command palette", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "P"], linux: ["Ctrl", "Shift", "P"] }) },
        { id: "inspector", action: "Toggle the terminal inspector", keys: perPlatform(platforms, { macos: ["Cmd", "Option", "I"], linux: ["Ctrl", "Shift", "I"] }) },
        { id: "write-screen", action: "Write the visible screen to a file or paste it", keys: perPlatform(platforms, { macos: ["Cmd", "Shift", "J"], linux: ["Ctrl", "Shift", "J"] }), note: "The action can be configured to copy, open, or paste the exported screen." },
      ],
    },
  ],
};

export default ghostty;
