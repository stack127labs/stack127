import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, windows: string[][], macos?: string[][], note?: string];

const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos = windows, note]) => ({
    id,
    action,
    keys: [
      { platform: "windows", keys: windows[0], ...(windows.length > 1 ? { alternatives: windows.slice(1) } : {}) },
      { platform: "macos", keys: macos[0], ...(macos.length > 1 ? { alternatives: macos.slice(1) } : {}) },
    ],
    ...(note ? { note } : {}),
  }));

export const adobeAudition: AppShortcuts = {
  slug: "adobe-audition",
  name: "Adobe Audition",
  category: "Audio editor",
  platforms: ["windows", "macos"],
  intro:
    "Audition's published defaults cover transport and zoom, markers, Waveform Editor processing, spectral editing, and Multitrack clip or mixer adjustments. Editor-specific commands stay separate so a binding is not mistaken for an application-wide action.",
  versionContext:
    "Adobe's current expert-selected default list, updated June 17, 2026 and checked August 31, 2026. Adobe labels the web reference as partial and directs users to Edit > Keyboard Shortcuts for the complete installed keymap. CD-authoring commands removed in Audition 26.3 are not included, and custom shortcut sets are outside this reference.",
  sourceUrl: "https://helpx.adobe.com/audition/desktop/keyboard-shortcuts/default-keyboard-shortcuts.html",
  sourceLabel: "Adobe Audition default keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "playback-zoom-markers",
      title: "Playback, zoom, and markers",
      intro: "These defaults work across the Waveform and Multitrack editors unless the active control consumes the same key first.",
      shortcuts: rows([
        ["switch-editor", "Switch between Waveform and Multitrack Editor", [["1"]]],
        ["play-stop", "Start or stop playback", [["Space"]]],
        ["timeline-start", "Move the current-time indicator to the timeline start", [["Home"]]],
        ["timeline-end", "Move the current-time indicator to the timeline end", [["End"]]],
        ["previous-edge", "Move to the previous marker, clip, or selection edge", [["Ctrl", "Left"]], [["Cmd", "Left"]]],
        ["next-edge", "Move to the next marker, clip, or selection edge", [["Ctrl", "Right"]], [["Cmd", "Right"]]],
        ["return-cti", "Toggle Return CTI To Start Position On Stop", [["Shift", "X"]]],
        ["zoom-horizontal-in", "Zoom in horizontally", [["="]]],
        ["zoom-vertical-in", "Zoom in vertically", [["Alt", "="]], [["Option", "="]]],
        ["zoom-horizontal-out", "Zoom out horizontally", [["-"]]],
        ["zoom-vertical-out", "Zoom out vertically", [["Alt", "-"]], [["Option", "-"]]],
        ["add-marker", "Add a marker", [["M"], ["*"]]],
        ["previous-marker", "Move to the previous marker", [["Ctrl", "Alt", "Left"]], [["Cmd", "Option", "Left"]]],
        ["next-marker", "Move to the next marker", [["Ctrl", "Alt", "Right"]], [["Cmd", "Option", "Right"]]],
      ]),
    },
    {
      id: "waveform-editor",
      title: "Waveform Editor",
      intro: "These commands only apply in the Waveform Editor. The spectral adjustments move in both directions with the same modifier chord.",
      shortcuts: rows([
        ["repeat-confirm", "Repeat the previous command and confirm its dialog", [["Shift", "R"]]],
        ["repeat-dialog", "Repeat the previous command and leave its dialog open", [["Ctrl", "R"]], [["Cmd", "R"]]],
        ["convert-sample-type", "Open Convert Sample Type", [["Shift", "T"]]],
        ["noise-profile", "Capture a Noise Reduction noise profile", [["Shift", "P"]]],
        ["left-channel", "Activate the left stereo channel for editing", [["Up"]]],
        ["right-channel", "Activate the right stereo channel for editing", [["Down"]]],
        ["spectral-scale", "Make the spectral display more logarithmic or linear", [["Ctrl", "Alt", "Up/Down"]], [["Option", "Cmd", "Up/Down"]]],
        ["spectral-scale-full", "Make the spectral display fully logarithmic or linear", [["Ctrl", "Alt", "Page Up/Down"]], [["Option", "Cmd", "Page Up/Down"]]],
        ["spectral-resolution", "Increase or decrease spectral resolution", [["Ctrl", "Shift", "Up/Down"]], [["Cmd", "Shift", "Up/Down"]]],
      ]),
    },
    {
      id: "multitrack-editor",
      title: "Multitrack Editor",
      intro: "Mixer modifier clicks apply the same change across audio tracks. Clip nudges move the selected clip without changing its duration.",
      shortcuts: rows([
        ["same-routing", "Select the same input or output for every audio track", [["Ctrl", "Shift", "Select"]], [["Cmd", "Shift", "Select"]]],
        ["toggle-track-controls", "Toggle Mute, Solo, Arm, or Monitor Input across all tracks", [["Ctrl", "Shift", "Click"]], [["Cmd", "Shift", "Click"]]],
        ["knob-large", "Adjust a knob in large increments", [["Shift", "Drag"]]],
        ["knob-small", "Adjust a knob in small increments", [["Ctrl", "Drag"]], [["Cmd", "Drag"]]],
        ["nudge-clip-left", "Nudge the selected clip left", [["Alt", ","]], [["Option", ","]]],
        ["nudge-clip-right", "Nudge the selected clip right", [["Alt", "."]]],
        ["nudge-clip-up", "Nudge the selected clip up", [["Alt", "Up"]], [["Option", "Up"]]],
        ["nudge-clip-down", "Nudge the selected clip down", [["Alt", "Down"]], [["Option", "Down"]]],
      ]),
    },
  ],
};

export default adobeAudition;
