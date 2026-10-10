import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "linux", "macos"] as const;

export const obsStudio: AppShortcuts = {
  slug: "obs-studio",
  name: "OBS Studio",
  category: "Streaming and recording",
  platforms: [...platforms],
  versionContext:
    "The official OBS keyboard reference was last updated August 25, 2021 and was checked again September 1, 2026. OBS lets users assign or change hotkeys in Settings, so these entries describe the published defaults rather than a user's custom profile.",
  sourceUrl: "https://obsproject.com/kb/keyboard-shortcuts",
  sourceLabel: "official OBS Studio keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "general",
      title: "General",
      intro: "General commands work across the OBS Studio interface. Windows and Linux share the documented bindings, while macOS uses the Command key in the same actions.",
      shortcuts: [
        { id: "quit", action: "Quit OBS Studio", keys: combo(platforms, ["Ctrl", "Q"], ["Cmd", "Q"]) },
        { id: "undo", action: "Undo edit", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo edit", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
      ],
    },
    {
      id: "sources",
      title: "Sources list",
      intro: "Source-list commands require a source to be selected. They copy, remove, reorder, and transform the selected source in the scene.",
      shortcuts: [
        { id: "copy-source", action: "Copy source", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste-source", action: "Paste source", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "remove-source", action: "Remove source", keys: combo(platforms, ["Delete"], ["Delete"]) },
        { id: "move-source-up", action: "Move source up in the list", keys: combo(platforms, ["Ctrl", "Up"], ["Cmd", "Up"]) },
        { id: "move-source-down", action: "Move source down in the list", keys: combo(platforms, ["Ctrl", "Down"], ["Cmd", "Down"]) },
        { id: "move-source-top", action: "Move source to the top", keys: combo(platforms, ["Ctrl", "Home"], ["Cmd", "Fn", "Left"]) },
        { id: "move-source-bottom", action: "Move source to the bottom", keys: combo(platforms, ["Ctrl", "End"], ["Cmd", "Fn", "Right"]) },
        { id: "edit-transform", action: "Edit transform", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "reset-transform", action: "Reset transform", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
        { id: "fit-screen", action: "Fit to screen", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "stretch-screen", action: "Stretch to screen", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "center-screen", action: "Center to screen", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
      ],
    },
    {
      id: "preview",
      title: "Preview window",
      intro: "Preview commands apply when a source bounding box is selected or when the preview uses fixed scaling. Drag-based actions are shown as a key plus the documented pointer gesture.",
      shortcuts: [
        { id: "nudge-up", action: "Nudge source up", keys: combo(platforms, ["Up"], ["Up"]) },
        { id: "nudge-down", action: "Nudge source down", keys: combo(platforms, ["Down"], ["Down"]) },
        { id: "nudge-left", action: "Nudge source left", keys: combo(platforms, ["Left"], ["Left"]) },
        { id: "nudge-right", action: "Nudge source right", keys: combo(platforms, ["Right"], ["Right"]) },
        { id: "crop", action: "Crop a source", keys: combo(platforms, ["Alt", "drag"], ["Option", "drag"]) },
        { id: "stretch", action: "Stretch a source", keys: combo(platforms, ["Shift", "drag"], ["Shift", "drag"]) },
        { id: "disable-snapping", action: "Temporarily disable source snapping", keys: combo(platforms, ["Ctrl", "drag"], ["Cmd", "drag"]) },
        { id: "move-preview", action: "Move the preview", keys: combo(platforms, ["Space", "drag"], ["Space", "drag"]) },
        { id: "zoom-preview", action: "Zoom the preview", keys: combo(platforms, ["Space", "scroll"], ["Space", "scroll"]) },
      ],
    },
  ],
};

export default obsStudio;
