import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, keys: string[], macos?: string[], note?: string];
const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, keys, macos = keys.map((key) => (key === "Ctrl" ? "Cmd" : key === "Alt" ? "Option" : key)), note]) => ({
    id,
    action,
    keys: [
      { platform: "windows", keys },
      { platform: "linux", keys },
      { platform: "macos", keys: macos },
    ],
    ...(note ? { note } : {}),
  }));

export const audacity: AppShortcuts = {
  slug: "audacity",
  name: "Audacity",
  category: "Audio editor",
  platforms: ["windows", "macos", "linux"],
  versionContext:
    "Current Audacity Development Manual checked August 31, 2026. This record includes the default Standard set only. The manual maps Ctrl to Command and Alt to Option on macOS, with explicit Mac exceptions preserved. Users can customize or replace the defaults in Shortcuts Preferences.",
  sourceUrl: "https://manual.audacityteam.org/man/keyboard_shortcut_reference.html",
  sourceLabel: "Audacity commands and keyboard shortcut reference",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "projects-files",
      title: "Projects and audio files",
      intro:
        "Create, open, close, save, import, and export Audacity projects and audio files without leaving the main project window.",
      shortcuts: rows([
        ["new", "Create a new project", ["Ctrl", "N"]],
        ["open", "Open a project or audio file", ["Ctrl", "O"]],
        ["close", "Close the current project window", ["Ctrl", "W"]],
        ["save", "Save the current AUP3 project", ["Ctrl", "S"]],
        ["export", "Export audio", ["Ctrl", "Shift", "E"]],
        ["import-audio", "Import audio into the current project", ["Ctrl", "Shift", "I"]],
        ["exit", "Exit Audacity", ["Ctrl", "Q"]],
      ]),
    },
    {
      id: "editing-clips",
      title: "Editing audio and clips",
      intro:
        "Undo changes, use Audacity's clipboard, remove or silence audio, preserve timeline gaps, split clips, and repeat the last effect.",
      shortcuts: rows([
        ["undo", "Undo the most recent edit", ["Ctrl", "Z"]],
        ["redo", "Redo the most recently undone edit", ["Ctrl", "Y"]],
        ["cut", "Cut the selection to the Audacity clipboard", ["Ctrl", "X"]],
        ["delete", "Delete the selection and close the gap", ["Ctrl", "K"]],
        ["copy", "Copy the selection to the Audacity clipboard", ["Ctrl", "C"]],
        ["paste", "Paste from the Audacity clipboard", ["Ctrl", "V"]],
        ["duplicate", "Duplicate the selection into a new track", ["Ctrl", "D"]],
        ["cut-gap", "Cut the selection and leave a gap", ["Ctrl", "Alt", "X"]],
        ["delete-gap", "Delete the selection and leave a gap", ["Ctrl", "Alt", "K"]],
        ["silence", "Replace the selected audio with silence", ["Ctrl", "L"]],
        ["trim", "Trim audio outside the selection", ["Ctrl", "T"]],
        ["split", "Split the current clip at the cursor or selection", ["Ctrl", "I"]],
        ["labeled-cut-gap", "Cut labeled audio and leave a gap", ["Alt", "Shift", "X"]],
        ["labeled-delete-gap", "Delete labeled audio and leave a gap", ["Alt", "Shift", "K"]],
        ["labeled-copy", "Copy labeled audio", ["Alt", "Shift", "C"]],
        ["labeled-detach", "Detach labeled audio at silences", ["Alt", "Shift", "J"]],
        ["repeat-effect", "Repeat the last effect with its previous settings", ["Ctrl", "R"]],
      ]),
    },
    {
      id: "selection-labels",
      title: "Selections, labels, and clips",
      intro:
        "Select project audio, extend a selection through tracks, set boundaries during playback, move by clip, and add labels at exact positions.",
      shortcuts: rows([
        ["select-all", "Select all audio in all tracks", ["Ctrl", "A"]],
        ["zero-crossings", "Move selection edges to rising zero crossings", ["Z"]],
        ["all-tracks", "Extend the selection into all tracks", ["Ctrl", "Shift", "K"]],
        ["sync-tracks", "Extend the selection into all sync-locked tracks", ["Ctrl", "Shift", "Y"]],
        ["left-boundary", "Set the left selection boundary at playback", ["["]],
        ["right-boundary", "Set the right selection boundary at playback", ["]"]],
        ["track-start-selection", "Select from the track start to the cursor", ["Shift", "J"]],
        ["track-end-selection", "Select from the cursor to the track end", ["Shift", "K"]],
        ["previous-clip", "Move the selection to the previous clip", ["Alt", ","]],
        ["next-clip", "Move the selection to the next clip", ["Alt", "."]],
        ["add-label", "Add a label at the selection", ["Ctrl", "B"]],
        ["add-label-playback", "Add a label at the playback or recording position", ["Ctrl", "M"], ["Cmd", "."]],
      ]),
    },
    {
      id: "view-zoom",
      title: "Timeline view and track size",
      intro:
        "Change horizontal zoom, fit the project or tracks to the window, collapse track controls, and scroll across the project timeline.",
      shortcuts: rows([
        ["zoom-in", "Zoom in on the timeline", ["Ctrl", "1"]],
        ["zoom-normal", "Return to the normal timeline zoom", ["Ctrl", "2"]],
        ["zoom-out", "Zoom out on the timeline", ["Ctrl", "3"]],
        ["zoom-selection", "Zoom the timeline to the selection", ["Ctrl", "E"]],
        ["zoom-toggle", "Toggle between two preset zoom levels", ["Shift", "Z"]],
        ["fit-width", "Fit the entire project width in the window", ["Ctrl", "F"]],
        ["fit-height", "Fit all track heights in the project window", ["Ctrl", "Shift", "F"]],
        ["collapse-tracks", "Collapse all tracks", ["Ctrl", "Shift", "C"]],
        ["expand-tracks", "Restore all collapsed tracks", ["Ctrl", "Shift", "X"]],
        ["scroll-right", "Scroll the project right", ["Page Up"]],
        ["scroll-left", "Scroll the project left", ["Page Down"]],
      ]),
    },
    {
      id: "transport",
      title: "Playback, recording, and looping",
      intro:
        "Start and stop playback, preserve or move the restart cursor, record into an existing or new track, and set or clear the loop region.",
      shortcuts: rows([
        ["play-stop", "Start or stop playback", ["Space"]],
        ["play-stop-cursor", "Play or stop and set the cursor at the stop point", ["X"]],
        ["play-once", "Play the looping region once", ["Shift", "Space"]],
        ["pause", "Pause playback or recording", ["P"]],
        ["record", "Record at the end of the selected track", ["R"]],
        ["record-new", "Record into a new track", ["Shift", "R"]],
        ["timer-record", "Open Timer Record", ["Shift", "T"]],
        ["punch-roll", "Start Punch and Roll recording", ["Shift", "D"]],
        ["selection-start", "Move the cursor to the selection start", ["Left"]],
        ["selection-end", "Move the cursor to the selection end", ["Right"]],
        ["track-start", "Move the cursor to the selected track start", ["J"]],
        ["track-end", "Move the cursor to the selected track end", ["K"]],
        ["project-start", "Move the cursor to the project start", ["Home"]],
        ["project-end", "Move the cursor to the project end", ["End"]],
        ["loop-toggle", "Turn playback looping on or off", ["L"]],
        ["loop-clear", "Clear the looping region", ["Shift", "Alt", "L"]],
        ["loop-selection", "Set the loop to the current selection", ["Shift", "L"]],
      ]),
    },
    {
      id: "tracks-preferences",
      title: "Track mute controls and preferences",
      intro:
        "Mute or unmute all audio tracks or only the selected tracks, then open the platform-specific Audacity Preferences command.",
      shortcuts: rows([
        ["mute-all", "Mute all audio tracks", ["Ctrl", "U"]],
        ["unmute-all", "Unmute all audio tracks", ["Ctrl", "Shift", "U"]],
        ["mute-selected", "Mute the selected tracks", ["Ctrl", "Alt", "U"]],
        ["unmute-selected", "Unmute the selected tracks", ["Ctrl", "Alt", "Shift", "U"]],
        ["preferences", "Open Preferences", ["Ctrl", "P"], ["Cmd", ","]],
      ]),
    },
  ],
};

export default audacity;
