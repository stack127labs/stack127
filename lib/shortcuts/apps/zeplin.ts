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

export const zeplin: AppShortcuts = {
  slug: "zeplin",
  name: "Zeplin",
  category: "Design handoff",
  platforms: [...platforms],
  versionContext:
    "Zeplin keyboard shortcut article checked September 1, 2026. The article also lists a Web app table, while this record uses the published Mac and Windows app maps.",
  sourceUrl: "https://support.zeplin.io/en/articles/9685993-keyboard-shortcuts",
  sourceLabel: "official Zeplin keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Open common Zeplin areas and move through projects, screens, and sections.",
      shortcuts: [
        dual("search", "Open global search", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("new-project", "Create a new project or styleguide", ["Ctrl", "N"], ["Cmd", "N"]),
        dual("workspace", "Open workspace switcher", ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]),
        dual("dashboard", "Open the dashboard", ["Alt", "A"], ["Option", "A"]),
        dual("styleguide", "Open the styleguide", ["Alt", "S"], ["Option", "S"]),
        dual("flows", "Open flows", ["Alt", "L"], ["Option", "L"]),
        dual("collapse", "Collapse the current section", ["Ctrl", "Alt", "Up Arrow"], ["Ctrl", "Cmd", "Up Arrow"]),
        dual("expand", "Expand the current section", ["Ctrl", "Alt", "Down Arrow"], ["Ctrl", "Cmd", "Down Arrow"]),
        dual("new-section", "Create a new section", ["Ctrl", "Shift", "N"], ["Ctrl", "Cmd", "N"]),
        dual("search-screen", "Search screens", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("next-screen", "Open the next screen", ["Right Arrow"], ["Right Arrow"]),
        dual("previous-screen", "Open the previous screen", ["Left Arrow"], ["Left Arrow"]),
      ],
    },
    {
      id: "screens-and-layers",
      title: "Screens and layers",
      intro: "Rename, remove, and inspect screens or layers with these commands.",
      shortcuts: [
        dual("clip-thumbnails", "Clip screen thumbnails", ["Ctrl", "Alt", "T"], ["Ctrl", "Option", "T"]),
        dual("tags", "Open tags", ["Ctrl", "T"], ["Cmd", "T"]),
        dual("rename", "Rename the selected item", ["Alt", "R"], ["Option", "R"]),
        dual("delete", "Delete the selected item", ["Ctrl", "Backspace"], ["Cmd", "Backspace"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        shared("escape", "Clear the current selection", ["Escape"]),
        shared("select", "Select the focused item", ["Space"]),
        shared("move-focus", "Move focus through items", ["Tab"]),
        shared("move-focus-back", "Move focus backward through items", ["Shift", "Tab"]),
        shared("confirm", "Confirm the current field", ["Enter"], "The Mac app also documents Cmd+Return for committing a form."),
      ],
    },
    {
      id: "zoom",
      title: "Zoom and layout",
      intro: "Change the canvas zoom or show the grid for the selected screen.",
      shortcuts: [
        dual("zoom-in", "Zoom in", ["Ctrl", "+"], ["Cmd", ":"]),
        dual("zoom-out", "Zoom out", ["Ctrl", "-"], ["Cmd", "-"]),
        dual("zoom-actual", "Set zoom to actual size", ["Ctrl", "0"], ["Cmd", "0"]),
        dual("zoom-fit", "Fit the screen to the window", ["Ctrl", "1"], ["Cmd", "1"]),
        dual("zoom-selection", "Zoom to the selected layer", ["Ctrl", "2"], ["Cmd", "2"]),
        dual("grid", "Show or hide the grid", ["Ctrl", "Alt", "G"], ["Cmd", "Option", "G"]),
      ],
    },
  ],
};

export default zeplin;
