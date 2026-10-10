import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (
  id: string,
  action: string,
  windows: string[],
  macos: string[],
  note?: string,
): Shortcut => ({
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

export const wondershareFilmora: AppShortcuts = {
  slug: "wondershare-filmora",
  name: "Wondershare Filmora",
  category: "Video editing",
  platforms: [...platforms],
  versionContext:
    "Filmora V15 release notes and current Windows and Mac shortcut lists checked September 1, 2026. Filmora lets users edit or switch shortcut presets.",
  sourceUrl: "https://filmora.wondershare.com/guide/keyboard-shortcuts-on-windows.html",
  sourceLabel: "official Wondershare Filmora keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "file-and-edit",
      title: "Files and editing",
      intro: "Use these commands to manage projects and apply common edits in the Filmora timeline.",
      shortcuts: [
        dual("new-project", "Create a new project", ["Ctrl", "N"], ["Cmd", "N"]),
        dual("open-project", "Open a project", ["Ctrl", "O"], ["Cmd", "O"]),
        dual("save-project", "Save the project", ["Ctrl", "S"], ["Cmd", "S"]),
        dual("save-as", "Save the project as", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        dual("import-media", "Import media", ["Ctrl", "I"], ["Cmd", "I"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Y"], ["Cmd", "Shift", "Z"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        shared("delete", "Delete the selected clip", ["Delete"], "Filmora also documents separate ripple-delete commands."),
        shared("ripple-delete", "Ripple-delete the selected clip", ["Shift", "Delete"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("duplicate", "Duplicate the selected clip", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("split", "Split at the playhead", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("link-unlink", "Link or unlink selected clips", ["Ctrl", "Alt", "S"], ["Cmd", "Option", "S"]),
      ],
    },
    {
      id: "timeline",
      title: "Timeline and tools",
      intro: "These commands move clips, open editing tools, and control timeline views.",
      shortcuts: [
        dual("select-tool", "Select tool", ["V"], ["V"]),
        dual("trim-start", "Trim the clip start to the playhead", ["Alt", "["], ["Option", "["]),
        dual("trim-end", "Trim the clip end to the playhead", ["Alt", "]"], ["Option", "]"]),
        dual("move-clip-left", "Move the selected clip left", ["Alt", "Left Arrow"], ["Option", "Left Arrow"]),
        dual("move-clip-right", "Move the selected clip right", ["Alt", "Right Arrow"], ["Option", "Right Arrow"]),
        dual("audio-mixer", "Open the audio mixer", ["Alt", "E"], ["Option", "E"]),
        dual("crop", "Open crop and zoom", ["Alt", "C"], ["Option", "C"]),
        dual("group", "Group selected clips", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("ungroup", "Ungroup selected clips", ["Ctrl", "Alt", "G"], ["Cmd", "Option", "G"]),
        dual("render-preview", "Render a preview", ["Enter"], ["Enter"]),
        dual("rename", "Rename the selected item", ["F2"], ["F2"]),
        dual("reveal", "Reveal the selected item in the media panel", ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        dual("favorite", "Add the selected item to favorites", ["Shift", "F"], ["Shift", "F"]),
        dual("shortcut-panel", "Open the keyboard shortcuts panel", ["Ctrl", "Alt", "K"], ["Cmd", "Option", "K"]),
      ],
    },
    {
      id: "playback-and-view",
      title: "Playback and view",
      intro: "Use these controls to play the timeline, move the playhead, and change the timeline zoom.",
      shortcuts: [
        shared("play-pause", "Play or pause", ["Space"]),
        dual("stop", "Stop playback", ["Ctrl", "/"], ["Cmd", "/"]),
        dual("fullscreen", "Enter or leave full screen", ["Alt", "Enter"], ["Cmd", "Option", "Enter"]),
        shared("previous-frame", "Move to the previous frame", ["Left Arrow"]),
        shared("next-frame", "Move to the next frame", ["Right Arrow"]),
        shared("previous-second", "Move backward by one second", ["Shift", "Left Arrow"]),
        shared("next-second", "Move forward by one second", ["Shift", "Right Arrow"]),
        shared("start", "Go to the start of the project", ["Home"]),
        shared("end", "Go to the end of the project", ["End"]),
        dual("zoom-in", "Zoom in on the timeline", ["Ctrl", "="], ["Cmd", "="]),
        dual("zoom-out", "Zoom out of the timeline", ["Ctrl", "-"], ["Cmd", "-"]),
        shared("fit-timeline", "Fit the timeline to the window", ["Shift", "Z"]),
        dual("previous-clip", "Select the previous clip", ["Ctrl", "Left Arrow"], ["Cmd", "Left Arrow"]),
        dual("next-clip", "Select the next clip", ["Ctrl", "Right Arrow"], ["Cmd", "Right Arrow"]),
      ],
    },
    {
      id: "markers-and-export",
      title: "Markers and export",
      intro: "Mark a range, add a marker, open the export view, and edit marker details.",
      shortcuts: [
        shared("mark-in", "Set the mark-in point", ["I"]),
        shared("mark-out", "Set the mark-out point", ["O"]),
        dual("clear-markers", "Clear the marked range", ["Ctrl", "Shift", "X"], ["Cmd", "Shift", "X"]),
        shared("add-marker", "Add a marker", ["M"]),
        shared("edit-marker", "Edit a marker", ["Shift", "M"]),
        dual("export", "Open the export view", ["Ctrl", "E"], ["Cmd", "E"]),
        dual("help", "Open help", ["F1"], ["F1"]),
      ],
    },
  ],
};

export default wondershareFilmora;
