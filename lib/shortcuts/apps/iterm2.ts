import type { AppShortcuts } from "../types.ts";

const mac = (keys: string[]) => [{ platform: "macos" as const, keys }];

export const iterm2: AppShortcuts = {
  slug: "iterm2",
  name: "iTerm2",
  category: "Terminal emulator",
  platforms: ["macos"],
  intro:
    "iTerm2's shortcuts are about keeping several terminal jobs visible at once. Work across panes and tabs, search scrollback, recover paste history, mark useful output, broadcast input, and open the less obvious terminal tools.",
  versionContext:
    "Default bindings documented on iTerm2's official one-page documentation checked in August 2026. Many bindings can be changed in Preferences, Keys, so a local key mapping can differ from these defaults.",
  sourceUrl: "https://iterm2.com/documentation-one-page.html",
  sourceLabel: "official iTerm2 documentation",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "panes",
      title: "Panes",
      intro: "Split the terminal, move focus between panes, maximize the active pane, and close the surface you are using.",
      shortcuts: [
        { id: "split-vertical", action: "Split the pane vertically", keys: mac(["Cmd", "D"]) },
        { id: "split-horizontal", action: "Split the pane horizontally", keys: mac(["Cmd", "Shift", "D"]) },
        { id: "next-pane", action: "Move to the next pane", keys: mac(["Cmd", "]"]), note: "Cmd+[ moves to the previous pane." },
        { id: "pane-by-direction", action: "Move to a pane by direction", keys: mac(["Cmd", "Option", "Right"]), note: "Use the corresponding arrow for left, up, or down." },
        { id: "maximize-pane", action: "Maximize or restore the current pane", keys: mac(["Cmd", "Shift", "Enter"]) },
        { id: "close-pane", action: "Close the current pane or tab", keys: mac(["Cmd", "W"]) },
      ],
    },
    {
      id: "tabs-and-windows",
      title: "Tabs and windows",
      intro: "Create, close, switch, and jump among iTerm2 tabs and windows without leaving the current terminal session.",
      shortcuts: [
        { id: "new-tab", action: "Open a new tab", keys: mac(["Cmd", "T"]) },
        { id: "new-window", action: "Open a new window", keys: mac(["Cmd", "N"]) },
        { id: "next-tab", action: "Switch to the next tab", keys: mac(["Cmd", "Right"]), note: "Cmd+Left switches to the previous tab. Cmd+{ and Cmd+} are also documented." },
        { id: "tab-by-number", action: "Jump to a tab by number", keys: mac(["Cmd", "1"]), note: "Use the corresponding digit for the target tab." },
        { id: "window-by-number", action: "Jump to a window by number", keys: mac(["Cmd", "Option", "1"]), note: "Use the corresponding digit for the target window." },
        { id: "fullscreen", action: "Enter or leave fullscreen", keys: mac(["Cmd", "Enter"]) },
      ],
    },
    {
      id: "search-and-replay",
      title: "Search and replay",
      intro: "Search scrollback, reuse the current selection, enter Instant Replay, and move through terminal output from an earlier point in time.",
      shortcuts: [
        { id: "find", action: "Open the find bar", keys: mac(["Cmd", "F"]) },
        { id: "use-selection-for-find", action: "Use the selection as the find query", keys: mac(["Cmd", "E"]) },
        { id: "find-next", action: "Find the next match", keys: mac(["Cmd", "G"]), note: "Cmd+Shift+G finds the previous match." },
        { id: "instant-replay", action: "Open Instant Replay", keys: mac(["Cmd", "Option", "B"]) },
        { id: "replay-back", action: "Move backward in Instant Replay", keys: mac(["Left"]), note: "Right moves forward; Escape exits replay." },
        { id: "highlight-cursor", action: "Temporarily highlight the cursor", keys: mac(["Cmd", "/"]) },
        { id: "clear-buffer", action: "Clear the terminal buffer", keys: mac(["Cmd", "K"]) },
      ],
    },
    {
      id: "clipboard-and-input",
      title: "Clipboard and input",
      intro: "Use selection tools, paste history, autocomplete, and broadcast input to keep command entry efficient across sessions.",
      shortcuts: [
        { id: "mouseless-selection", action: "Start mouseless selection mode", keys: mac(["Tab"]), note: "Shift+Tab changes the selection direction; arrow keys extend it." },
        { id: "paste-history", action: "Open paste history", keys: mac(["Cmd", "Shift", "H"]) },
        { id: "autocomplete", action: "Open autocomplete suggestions", keys: mac(["Cmd", ";"]) },
        { id: "broadcast-input", action: "Broadcast input to every pane in the tab", keys: mac(["Cmd", "Option", "I"]), note: "Every pane receives the same typed input until broadcast is turned off." },
        { id: "open-quickly", action: "Open the Open Quickly panel", keys: mac(["Cmd", "Shift", "O"]) },
      ],
    },
    {
      id: "marks-and-tools",
      title: "Marks and tools",
      intro: "Mark important output, jump back to it, open preferences, and restore terminal presentation when a session needs attention.",
      shortcuts: [
        { id: "set-mark", action: "Set a mark at the current output position", keys: mac(["Cmd", "Shift", "M"]) },
        { id: "jump-mark", action: "Jump to the previous mark", keys: mac(["Cmd", "Shift", "J"]) },
        { id: "preferences", action: "Open iTerm2 preferences", keys: mac(["Cmd", ","]) },
        { id: "restore-transparency", action: "Re-enable a transparent window", keys: mac(["Cmd", "U"]) },
        { id: "show-toolbelt", action: "Show or hide the toolbelt", keys: mac(["Cmd", "Shift", "B"]) },
      ],
    },
  ],
};
