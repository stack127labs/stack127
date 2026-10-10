import type { AppShortcuts, Shortcut } from "../types.ts";

const mac = (items: Array<[string, string, string[], string?]>): Shortcut[] =>
  items.map(([id, action, combination, note]) => ({
    id,
    action,
    keys: [{ platform: "macos", keys: combination }],
    ...(note ? { note } : {}),
  }));

export const alfred: AppShortcuts = {
  slug: "alfred",
  name: "Alfred",
  category: "Productivity launcher",
  platforms: ["macos"],
  versionContext:
    "Default Alfred 5 hotkeys from the current official cheatsheet checked August 31, 2026. Alfred lets users change hotkeys, so modified installations can differ. Universal Actions, File System Navigation, Clipboard History, snippets, contacts, email, workflows, and the Music Mini Player require the Powerpack where noted.",
  sourceUrl: "https://www.alfredapp.com/help/getting-started/cheatsheet/",
  sourceLabel: "Alfred 5 cheatsheet",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "search-and-results",
      title: "Search window and results",
      intro:
        "Open Alfred, move through its result list, act on a specific result, expose alternate actions, preview items, and dismiss or resize the current view.",
      shortcuts: [
        ...mac([
          ["show", "Show Alfred", ["Option", "Space"]],
          ["next-result", "Select the next result", ["Down"]],
          ["previous-result", "Select the previous result", ["Up"]],
          ["action-result", "Action the selected result", ["Return"]],
          ["action-number", "Action result 1 through 9 directly", ["Cmd", "1-9"]],
          ["open-default", "Open a file or application in its default application", ["Cmd", "O"]],
          ["preferences", "Open Alfred Preferences", ["Cmd", ","]],
          ["finder-search", "Search the typed query in Finder", ["Option", "Return"]],
          ["web-search", "Search the typed query with the default web search", ["Control", "Return"]],
          ["reveal", "Reveal a local-file result in Finder", ["Cmd", "Return"]],
          ["actions", "Show the available Actions list", ["Option", "Cmd", "\\"], "Requires the Powerpack's Universal Actions feature."],
          ["hide", "Hide Alfred or go back in a stacked view", ["Esc"]],
          ["hide-all", "Hide Alfred and ignore stacked views", ["Cmd", "Esc"]],
          ["maximum-height", "Toggle maximum height in supported views", ["Cmd", "0"]],
          ["zoom-in", "Zoom in within supported views", ["Cmd", "+"]],
          ["zoom-out", "Zoom out within supported views", ["Cmd", "-"]],
        ]),
        {
          id: "quick-look",
          action: "Preview the selected result in Quick Look",
          keys: [
            { platform: "macos", keys: ["Shift"], alternatives: [["Cmd", "Y"]] },
          ],
        },
      ],
    },
    {
      id: "file-navigation",
      title: "File System Navigation and File Buffer",
      intro:
        "The folder-browsing controls require the Powerpack's File System Navigation feature. The File Buffer controls collect several files for one later action.",
      shortcuts: [
        ...mac([
          ["home", "Navigate to the home folder", ["~"]],
          ["root", "Navigate to the root folder", ["/"]],
          ["last-path", "Go to the last browsed file-system path", ["Option", "Cmd", "/"]],
          ["browse-folder", "Browse the selected folder", ["Cmd", "Down"]],
          ["enter-folder", "Enter the selected folder", ["Return"]],
          ["up-folder", "Go up one folder", ["Backspace"]],
          ["autocomplete", "Autocomplete the current path or selection", ["Tab"]],
          ["hidden-files", "Show hidden files", ["."]],
          ["buffer-add-next", "Add to the File Buffer and move to the next item", ["Option", "Down"]],
          ["buffer-toggle", "Add or remove the selected File Buffer item", ["Option", "Up"]],
          ["buffer-remove-last", "Remove the last item from the File Buffer", ["Option", "Left"]],
          ["buffer-action", "Action all items in the File Buffer", ["Option", "Right"]],
        ]),
        {
          id: "file-actions",
          action: "Show Actions for the selected file-system item",
          keys: [
            {
              platform: "macos",
              keys: ["Right"],
              alternatives: [["Fn"], ["Control"]],
            },
          ],
        },
      ],
    },
    {
      id: "clipboard-powerpack",
      title: "Clipboard History and snippets",
      intro:
        "These Powerpack bindings open Clipboard History, copy or delete an entry, and save the selected clipboard item as a reusable snippet.",
      shortcuts: mac([
        ["clipboard", "Open Clipboard History", ["Option", "Cmd", "C"]],
        ["clipboard-copy", "Copy the selected history entry to the current clipboard", ["Cmd", "C"]],
        ["snippet-save", "Save the selected clipboard entry as a snippet", ["Cmd", "S"]],
        ["clipboard-delete", "Delete the selected Clipboard History entry", ["Fn", "Backspace"]],
      ]),
    },
    {
      id: "music-powerpack",
      title: "Music Mini Player",
      intro:
        "These Powerpack bindings open Alfred's Music Mini Player, control playback, rate the current track, browse upward, and rebuild the music index.",
      shortcuts: mac([
        ["music-show", "Show the Music Mini Player", ["Control", "Cmd", "Return"]],
        ["music-play-pause", "Play or pause", ["Control", "Cmd", "Down"]],
        ["music-next", "Play the next track", ["Control", "Cmd", "Right"]],
        ["music-back", "Play the previous track", ["Control", "Cmd", "Left"]],
        ["music-random", "Play a random album", ["Control", "Cmd", "Up"]],
        ["music-rate", "Rate the current track from zero to five stars", ["Control", "Cmd", "0-5"]],
        ["music-up-folder", "Go up one folder in the Mini Player", ["Backspace"]],
        ["music-reindex", "Reindex the music library", ["Cmd", "R"]],
      ]),
    },
  ],
};

export default alfred;
