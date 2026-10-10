import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

export const riversideFm: AppShortcuts = {
  slug: "riverside-fm",
  name: "Riverside.fm",
  category: "Video and audio",
  platforms: [...platforms],
  versionContext:
    "Riverside Help Center editor hotkeys checked September 1, 2026. The source documents Windows and macOS modifier variants for editing commands, while arrow, letter, and timeline controls are published as shared editor keys.",
  sourceUrl: "https://support.riverside.com/hc/en-us/articles/6279202420253-Editor-hotkeys-and-keyboard-shortcuts",
  sourceLabel: "official Riverside editor shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation-and-playback",
      title: "Navigation and playback",
      intro: "Search the editor, play the preview, move through transcript text, and change the timeline view with these keys.",
      shortcuts: [
        shared("global-search", "Open global search", ["Ctrl", "K"]),
        shared("play-pause", "Play or pause the video preview", ["Space"]),
        shared("transcript-up-down", "Scroll up or down on the transcript", ["Up Arrow"], "Down Arrow moves in the opposite direction."),
        shared("transcript-page", "Scroll one page on the transcript", ["Page Up"], "Page Down moves one page in the opposite direction."),
        shared("transcript-start-end", "Scroll to the start or end of the transcript", ["Home"], "End moves to the opposite boundary."),
        shared("timeline-zoom", "Increase or decrease timeline zoom", ["+"] , "Use - to move in the opposite direction."),
        shared("frame-step", "Jump one frame forward or backward", ["Right Arrow"], "Left Arrow moves in the opposite direction."),
        shared("five-second-jump", "Jump five seconds forward or backward", ["L"], "J jumps five seconds in the opposite direction."),
      ],
    },
    {
      id: "selection-and-search",
      title: "Selection and search",
      intro: "Extend transcript selections, search the recording, and move between matching results from the Riverside editor.",
      shortcuts: [
        shared("extend-selection", "Extend the current selection word by word", ["Shift", "Right Arrow"], "Shift+Left Arrow extends the selection in the opposite direction."),
        dual("find", "Search the recording transcript", ["Ctrl", "F"], ["Cmd", "F"]),
        shared("find-next", "Go to the next search result", ["Enter"]),
        shared("find-previous", "Go to the previous search result", ["Shift", "Enter"]),
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "Undo, restore, split, correct, and remove transcript or timeline selections with Riverside's editor commands.",
      shortcuts: [
        dual("undo", "Undo the last change", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo the last change", ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]),
        shared("delete", "Delete the selected item", ["Delete"], "Backspace is also documented."),
        shared("restore", "Restore or revert the selection", ["R"]),
        shared("split-recording", "Split the selected recording at the playhead", ["S"]),
        shared("correct-word", "Correct selected transcript words", ["C"]),
        shared("split-transcript", "Split the transcript and timeline", ["Enter"]),
        dual("cut", "Cut selected text or timeline selection", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("copy", "Copy selected text or timeline selection", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste the selection", ["Ctrl", "V"], ["Cmd", "V"]),
      ],
    },
    {
      id: "tracks-and-comments",
      title: "Tracks and comments",
      intro: "Change track visibility, add scenes or comments, and submit a comment from the active Riverside editor selection.",
      shortcuts: [
        shared("toggle-tracks", "Expand or collapse individual timeline tracks", ["Shift", "E"]),
        shared("new-scene", "Create a new scene", ["Shift", "S"]),
        shared("add-comment", "Add a comment", ["Shift", "C"]),
        dual("submit", "Submit", ["Ctrl", "Enter"], ["Cmd", "Enter"]),
      ],
    },
  ],
};

export default riversideFm;
