import { combo } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["macos", "linux"] as const;

const prefix = (id: string, action: string, command: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, ["Ctrl", "B", "then", ...command]),
  ...(note ? { note } : {}),
});

export const tmux: AppShortcuts = {
  slug: "tmux",
  name: "tmux",
  category: "Terminal",
  platforms: [...platforms],
  intro:
    "tmux's default prefix map controls sessions, windows, panes, copy mode, and terminal layout without leaving a shell. The entries use tmux's default Ctrl-B prefix and preserve the distinction between a prefix chord and the command key that follows it.",
  versionContext:
    "Default key bindings from the current tmux master manual and Getting Started guide checked September 1, 2026. A user's tmux.conf can replace or remove any binding, and copy-mode or status-line bindings can change when vi mode is enabled.",
  sourceUrl: "https://github.com/tmux/tmux/blob/master/tmux.1",
  sourceLabel: "official tmux default key bindings",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "sessions-and-windows",
      title: "Sessions and windows",
      intro: "Create, rename, select, detach, and inspect tmux sessions and windows with the default prefix commands.",
      shortcuts: [
        prefix("send-prefix", "Send the prefix key through to the application", ["Ctrl", "B"]),
        prefix("rename-session", "Rename the current session", ["$"]),
        prefix("previous-session", "Switch to the previous session", ["("]),
        prefix("next-session", "Switch to the next session", [")"]),
        prefix("last-session", "Switch the client back to the last session", ["L"]),
        prefix("select-window-index", "Select a window by index", ["0"], "Use the corresponding number from 0 through 9."),
        prefix("select-window-prompt", "Prompt for a window index to select", ["'"]),
        prefix("new-window", "Create a new window", ["c"]),
        prefix("kill-window", "Kill the current window", ["&"]),
        prefix("previous-window", "Move to the previously selected window", ["l"]),
        prefix("next-window", "Change to the next window", ["n"]),
        prefix("previous-window-bell", "Move to the previous window with a bell or activity marker", ["Alt", "P"]),
        prefix("next-window-bell", "Move to the next window with a bell or activity marker", ["Alt", "N"]),
        prefix("choose-window", "Choose the current window interactively", ["w"]),
        prefix("choose-fuzzy-window", "Choose a window and session by fuzzy matching", ["Tab"]),
        prefix("rename-window", "Rename the current window", [","]),
        prefix("move-window", "Prompt for an index to move the current window", ["."]),
        prefix("window-info", "Display information about the current window", ["i"]),
        prefix("detach", "Detach the current client", ["d"]),
        prefix("choose-client-detach", "Choose a client to detach", ["D"]),
        prefix("choose-session", "Select a new session interactively", ["s"]),
      ],
    },
    {
      id: "panes",
      title: "Panes and layout",
      intro: "Split, select, move, resize, mark, zoom, and rearrange panes in the current tmux window.",
      shortcuts: [
        prefix("split-horizontal", "Split the current pane into top and bottom panes", ["\""]),
        prefix("split-vertical", "Split the current pane into left and right panes", ["%"]),
        prefix("break-pane", "Break the current pane out of the window", ["!"]),
        prefix("new-floating-pane", "Create a new floating pane", ["*"]),
        prefix("select-pane-next", "Select the next pane", ["o"]),
        prefix("select-pane-up", "Select the pane above", ["Up Arrow"]),
        prefix("select-pane-down", "Select the pane below", ["Down Arrow"]),
        prefix("select-pane-left", "Select the pane to the left", ["Left Arrow"]),
        prefix("select-pane-right", "Select the pane to the right", ["Right Arrow"]),
        prefix("last-pane", "Move to the previously active pane", [";"]),
        prefix("mark-pane", "Mark the current pane", ["m"]),
        prefix("clear-mark", "Clear the marked pane", ["M"]),
        prefix("kill-pane", "Kill the current pane", ["x"]),
        prefix("zoom-pane", "Toggle the zoom state of the current pane", ["z"]),
        prefix("swap-pane-previous", "Swap the current pane with the previous pane", ["{"]),
        prefix("swap-pane-next", "Swap the current pane with the next pane", ["}"]),
        prefix("rotate-panes", "Rotate panes forwards", ["Ctrl", "O"]),
        prefix("rotate-panes-backward", "Rotate panes backwards", ["Alt", "O"]),
        prefix("layout-next", "Arrange the window in the next preset layout", ["Space"]),
        prefix("layout-preset", "Arrange panes using a preset layout", ["Alt", "1"], "Use Alt+1 through Alt+7 for the seven preset layouts."),
        prefix("move-floating-pane", "Move a floating pane to a corner or edge", ["g", "1"], "Use g with 1 through 4 or an arrow key for the other positions. Meta also resizes the pane."),
        prefix("resize-one-cell", "Resize the current pane by one cell", ["Ctrl", "Up Arrow"], "Use the corresponding arrow direction."),
        prefix("resize-five-cells", "Resize the current pane by five cells", ["Alt", "Up Arrow"], "Use the corresponding arrow direction."),
      ],
    },
    {
      id: "copy-and-command",
      title: "Copy mode and commands",
      intro: "Enter copy mode, manage paste buffers, search terminal history, open the command prompt, and inspect the active tmux client.",
      shortcuts: [
        prefix("copy-mode", "Enter copy mode", ["["]),
        prefix("paste-buffer", "Paste the most recently copied buffer", ["]"]),
        prefix("choose-buffer", "Choose a paste buffer interactively", ["="]),
        prefix("list-buffers", "List all paste buffers", ["#"]),
        prefix("delete-buffer", "Delete the most recently copied buffer", ["-"]),
        prefix("search-text", "Search for text in open windows", ["f"]),
        prefix("command-prompt", "Open the tmux command prompt", [":"]),
        prefix("list-keys", "List all key bindings", ["?"]),
        prefix("show-time", "Show the time", ["t"]),
        prefix("show-messages", "Show previous tmux messages", ["~"]),
        prefix("pane-indexes", "Briefly display pane indexes", ["q"]),
        prefix("redraw", "Force a redraw of the attached client", ["r"]),
        prefix("pane-title", "Change the current pane title", ["T"]),
        prefix("suspend-client", "Suspend the tmux client", ["Ctrl", "Z"]),
        prefix("page-up-copy-mode", "Enter copy mode and scroll one page up", ["Page Up"]),
      ],
    },
  ],
};

export default tmux;
