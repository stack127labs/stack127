import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, windows: string[][], macos?: string[][] | null, note?: string];

const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos = windows, note]) => ({
    id,
    action,
    keys: [
      { platform: "windows", keys: windows[0], ...(windows.length > 1 ? { alternatives: windows.slice(1) } : {}) },
      ...(macos ? [{ platform: "macos" as const, keys: macos[0], ...(macos.length > 1 ? { alternatives: macos.slice(1) } : {}) }] : []),
    ],
    ...(note ? { note } : {}),
  }));

export const adobePremiereRush: AppShortcuts = {
  slug: "adobe-premiere-rush",
  name: "Adobe Premiere Rush",
  category: "Video editing",
  platforms: ["windows", "macos"],
  versionContext:
    "Final desktop defaults from Adobe's June 11, 2026 reference, checked August 31, 2026. Adobe discontinued Premiere Rush and removed it from download after September 30, 2025, but existing installations can still use these documented shortcuts.",
  sourceUrl: "https://helpx.adobe.com/premiere-rush/desktop/introduction/keyboard-shortcuts.html",
  sourceLabel: "Adobe Premiere Rush keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "projects-and-editing",
      title: "Projects and editing",
      intro: "Project commands manage Rush files and exports. Cut, copy, and paste in this group apply only to text inside titles.",
      shortcuts: rows([
        ["new-project", "Create a new project", [["Ctrl", "N"]], [["Cmd", "N"]]],
        ["new-sequence", "Create a new sequence", [["Ctrl", "Alt", "N"]], [["Option", "Cmd", "N"]]],
        ["close-project", "Close the project", [["Ctrl", "W"]], [["Cmd", "W"]]],
        ["share", "Open Share", [["Ctrl", "E"]], [["Cmd", "E"]]],
        ["quit", "Quit Premiere Rush", [["Alt", "F4"]], [["Cmd", "Q"]]],
        ["undo", "Undo", [["Ctrl", "Z"]], [["Cmd", "Z"]]],
        ["redo", "Redo", [["Ctrl", "Shift", "Z"]], [["Shift", "Cmd", "Z"]]],
        ["cut-title-text", "Cut selected title text", [["Ctrl", "X"]], [["Cmd", "X"]]],
        ["copy-title-text", "Copy selected title text", [["Ctrl", "C"]], [["Cmd", "C"]]],
        ["paste-title-text", "Paste title text", [["Ctrl", "V"]], [["Cmd", "V"]]],
        ["select-all", "Select all", [["Ctrl", "A"]], [["Cmd", "A"]]],
        ["deselect-all", "Deselect all", [["Shift", "Ctrl", "A"]], [["Shift", "Cmd", "A"]]],
      ]),
    },
    {
      id: "clips-and-sequence",
      title: "Clips and sequence",
      intro: "These commands change the selected clip or the active sequence, including timeline panels and snapping behavior.",
      shortcuts: rows([
        ["separate-audio", "Separate audio from the selected clip", [["E"]]],
        ["split-clip", "Split the selected clip at the playhead", [["S"]]],
        ["duplicate-clip", "Duplicate the selected clip", [["D"]]],
        ["delete-clip", "Delete the selected clip", [["Backspace"], ["Delete"]], [["Delete"]]],
        ["apply-transition", "Apply the default transition", [["Ctrl", "D"]], [["Cmd", "D"]]],
        ["add-graphics", "Open Add Graphics", [["G"]]],
        ["add-voiceover", "Open Add Voiceover", [["U"]]],
        ["add-media", "Open Add Media", [["Y"]]],
        ["zoom-timeline-in", "Zoom in on the timeline", [["="]]],
        ["zoom-timeline-out", "Zoom out on the timeline", [["-"]]],
        ["zoom-timeline-fit", "Fit the sequence in the timeline", [["\\"]]],
        ["toggle-snapping", "Toggle snapping", [["Ctrl", "Y"]], [["Cmd", "Y"]]],
        ["scrub-audio", "Toggle audio while scrubbing", [["A"]]],
        ["loop", "Toggle loop playback", [["Ctrl", "L"]], [["Cmd", "L"]]],
      ]),
    },
    {
      id: "panels-and-view",
      title: "Panels and view",
      intro: "Numbered commands open the corresponding adjustment panel. The arrow commands move among those tools rather than across timeline edits.",
      shortcuts: rows([
        ["maximize-preview", "Maximize or restore the preview", [["`"]]],
        ["graphics-panel", "Open the Graphics panel", [["Ctrl", "1"]], [["Cmd", "1"]]],
        ["transitions-panel", "Open the Transitions panel", [["Ctrl", "2"]], [["Cmd", "2"]]],
        ["color-panel", "Open the Color panel", [["Ctrl", "3"]], [["Cmd", "3"]]],
        ["speed-panel", "Open the Speed panel", [["Ctrl", "4"]], [["Cmd", "4"]]],
        ["audio-panel", "Open the Audio panel", [["Ctrl", "5"]], [["Cmd", "5"]]],
        ["transform-panel", "Open the Transform panel", [["Ctrl", "6"]], [["Cmd", "6"]]],
        ["next-tool", "Move to the next adjustment tool", [["Ctrl", "Right"]], [["Cmd", "Right"]]],
        ["previous-tool", "Move to the previous adjustment tool", [["Ctrl", "Left"]], [["Cmd", "Left"]]],
        ["track-controls", "Show or hide track controls", [["Ctrl", "T"]], [["Cmd", "T"]]],
        ["expand-audio", "Expand or collapse audio", [["Ctrl", "R"]], [["Cmd", "R"]]],
      ]),
    },
    {
      id: "timeline-playback",
      title: "Timeline playback and navigation",
      intro: "Timeline navigation follows edit points, frames, and sequence bounds. J, K, and L provide shuttle playback controls.",
      shortcuts: rows([
        ["next-edit", "Go to the next edit", [["Down"]]],
        ["previous-edit", "Go to the previous edit", [["Up"]]],
        ["sequence-end", "Go to the end of the sequence", [["Ctrl", "Down"]], [["Cmd", "Down"]]],
        ["sequence-start", "Go to the start of the sequence", [["Ctrl", "Up"]], [["Cmd", "Up"]]],
        ["play-pause", "Play or pause", [["Space"]]],
        ["shuttle-left", "Shuttle left", [["J"]]],
        ["stop", "Stop shuttle playback", [["K"]]],
        ["shuttle-right", "Shuttle right", [["L"]]],
        ["frame-forward", "Move forward one frame", [["Right"]]],
        ["frame-back", "Move back one frame", [["Left"]]],
        ["full-screen-preview", "Enter or leave full-screen preview", [["`"]]],
        ["timeline-fit", "Fit the sequence in the Timeline", [["\\"]]],
        ["timeline-split", "Split the selected Timeline clip at the playhead", [["S"]]],
        ["timeline-transition", "Apply the default transition in the Timeline", [["Ctrl", "D"]], [["Cmd", "D"]]],
        ["timeline-snapping", "Toggle Timeline snapping", [["Ctrl", "Y"]], [["Cmd", "Y"]]],
      ]),
    },
    {
      id: "large-preview",
      title: "Large Preview",
      intro: "These commands apply while inspecting a source in Large Preview before adding it to the timeline.",
      shortcuts: rows([
        ["mark-in", "Set the In point", [["I"]]],
        ["mark-out", "Set the Out point", [["O"]]],
        ["clear-in", "Clear the In point", [["Alt", "I"]], [["Option", "I"]]],
        ["clear-out", "Clear the Out point", [["Alt", "O"]], [["Option", "O"]]],
        ["clear-in-out", "Clear both In and Out points", [["Alt", "X"]], [["Option", "X"]]],
        ["deselect-preview", "Deselect all media", [["Esc"]]],
        ["return-grid", "Return to the media grid", [["Enter"]]],
        ["add-preview", "Add the selected media to the timeline", [["Ctrl", "Enter"]], [["Cmd", "Enter"]]],
      ]),
    },
    {
      id: "media-browser",
      title: "Media Browser",
      intro: "Media Browser shortcuts move focus through assets, change their selection state, and send the current selection to the timeline.",
      shortcuts: rows([
        ["move-media-focus", "Move keyboard focus among media assets", [["Arrow keys"]]],
        ["clear-media-selection", "Deselect the current media selection", [["Esc"]]],
        ["open-large-preview", "Open the focused asset in Large Preview", [["Enter"]]],
        ["toggle-asset", "Select or deselect the focused asset", [["Z"]]],
        ["select-all-media", "Select all media", [["Ctrl", "A"]], [["Cmd", "A"]]],
        ["deselect-all-media", "Deselect all media", [["Ctrl", "Shift", "A"]], [["Cmd", "Shift", "A"]]],
        ["add-media-selection", "Add selected media to the timeline", [["Ctrl", "Enter"]], [["Cmd", "Enter"]]],
      ]),
    },
  ],
};

export default adobePremiereRush;
