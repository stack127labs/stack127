import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, windows: string[][] | null, macos: string[][] | null];

const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos]) => ({
    id,
    action,
    keys: [
      ...(windows ? [{ platform: "windows" as const, keys: windows[0], ...(windows.length > 1 ? { alternatives: windows.slice(1) } : {}) }] : []),
      ...(macos ? [{ platform: "macos" as const, keys: macos[0], ...(macos.length > 1 ? { alternatives: macos.slice(1) } : {}) }] : []),
    ],
  }));

export const arcBrowser: AppShortcuts = {
  slug: "arc-browser",
  name: "Arc",
  category: "Web browser",
  platforms: ["windows", "macos"],
  versionContext:
    "Default shortcuts from Arc's current official Help Center article, checked August 31, 2026. Arc's article metadata reports an update on November 5, 2024. Arc lets users remap shortcuts in Settings, so this reference covers documented defaults only.",
  sourceUrl: "https://resources.arc.net/hc/en-us/articles/20595231349911-Keyboard-Shortcuts",
  sourceLabel: "Arc Browser keyboard shortcuts",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "These commands create, close, restore, pin, and copy tabs or open browser windows. Little Arc has no Windows binding in Arc's reference.",
      shortcuts: rows([
        ["new-tab", "Open a new tab", [["Ctrl", "T"]], [["Cmd", "T"]]],
        ["new-window", "Open a new window", [["Ctrl", "N"]], [["Cmd", "N"]]],
        ["new-incognito", "Open a new incognito window", [["Ctrl", "Shift", "N"]], [["Cmd", "Shift", "N"]]],
        ["close", "Close the current tab or window", [["Ctrl", "W"]], [["Cmd", "W"]]],
        ["little-arc", "Open Little Arc", null, [["Cmd", "Option", "N"]]],
        ["reopen", "Reopen the last closed tab", [["Ctrl", "Shift", "T"]], [["Cmd", "Shift", "T"]]],
        ["pin", "Pin or unpin the current tab", [["Ctrl", "D"]], [["Cmd", "D"]]],
        ["copy-url", "Copy the current tab URL", [["Ctrl", "Shift", "C"]], [["Cmd", "Shift", "C"]]],
        ["copy-markdown", "Copy the current tab URL as Markdown", [["Ctrl", "Shift", "Alt", "C"]], [["Cmd", "Shift", "Option", "C"]]],
        ["edit-url", "Change the current tab URL", [["Ctrl", "L"], ["Alt", "D"]], [["Cmd", "L"]]],
        ["sidebar", "Show or hide the sidebar", [["Ctrl", "S"]], [["Cmd", "S"]]],
        ["clear-unpinned", "Clear unpinned tabs", [["Ctrl", "Shift", "K"]], [["Cmd", "Shift", "K"]]],
      ]),
    },
    {
      id: "tabs-and-spaces-navigation",
      title: "Tab and Space navigation",
      intro: "Number keys target tabs or Spaces depending on the modifier. Up and Down cycle tabs, while Left and Right cycle Spaces.",
      shortcuts: rows([
        ["tab-number", "Go directly to tab 1 through 9", [["Ctrl", "1-9"]], [["Cmd", "1-9"]]],
        ["space-number", "Focus Space 1 through 9", [["Alt", "1-9"]], [["Control", "1-9"]]],
        ["recent-tabs", "Toggle between recent tabs", [["Ctrl", "Tab"]], [["Control", "Tab"]]],
        ["previous-tab", "Switch to the previous tab", [["Ctrl", "Alt", "Up"]], [["Cmd", "Option", "Up"]]],
        ["next-tab", "Switch to the next tab", [["Alt", "Ctrl", "Down"]], [["Option", "Cmd", "Down"]]],
        ["previous-space", "Switch to the previous Space", [["Ctrl", "Alt", "Left"]], [["Cmd", "Option", "Left"]]],
        ["next-space", "Switch to the next Space", [["Alt", "Ctrl", "Right"]], [["Option", "Cmd", "Right"]]],
        ["history-forward", "Go forward in tab history", [["Alt", "Right"]], [["Cmd", "Right"], ["Cmd", "]"]]],
        ["history-back", "Go back in tab history", [["Alt", "Left"]], [["Cmd", "Left"], ["Cmd", "["]]],
      ]),
    },
    {
      id: "split-view",
      title: "Split View",
      intro: "Split View uses the same Control+Shift bindings on Windows and macOS, including numbered focus targets.",
      shortcuts: rows([
        ["add-split", "Add a Split View", [["Ctrl", "Shift", "+"]], [["Control", "Shift", "+"]]],
        ["close-split", "Close Split View", [["Ctrl", "Shift", "-"]], [["Control", "Shift", "-"]]],
        ["focus-split", "Focus Split View pane 1 through 9", [["Ctrl", "Shift", "1-9"]], [["Control", "Shift", "1-9"]]],
      ]),
    },
    {
      id: "page-and-history",
      title: "Page and history",
      intro: "These browser commands open history or change the current page's zoom, reload state, and text search.",
      shortcuts: rows([
        ["history", "View history", [["Ctrl", "H"]], [["Cmd", "Y"]]],
        ["zoom-in", "Zoom in on the webpage", [["Ctrl", "+"]], [["Cmd", "+"]]],
        ["zoom-out", "Zoom out on the webpage", [["Ctrl", "-"]], [["Cmd", "-"]]],
        ["zoom-reset", "Reset webpage zoom", [["Ctrl", "0"]], [["Cmd", "0"]]],
        ["reload", "Reload the webpage", [["Ctrl", "R"]], [["Cmd", "R"]]],
        ["find", "Find in the webpage", [["Ctrl", "F"]], [["Cmd", "F"]]],
      ]),
    },
  ],
};

export default arcBrowser;
