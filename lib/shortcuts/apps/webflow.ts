import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const desktop = (id: string, action: string, macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { macos, windows: macos.map((key) => (key === "Cmd" ? "Ctrl" : key === "Option" ? "Alt" : key)) }),
  ...(note ? { note } : {}),
});

const same = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: keys }),
  ...(note ? { note } : {}),
});

export const webflow: AppShortcuts = {
  slug: "webflow",
  name: "Webflow",
  category: "Design tool",
  platforms: [...platforms],
  versionContext:
    "Webflow Help Center keyboard shortcuts updated August 24, 2026 and checked September 1, 2026. Some entries are context-sensitive, such as timeline and canvas commands; this record excludes mouse-only gestures while retaining the keyboard part of combined actions.",
  sourceUrl: "https://help.webflow.com/hc/en-us/articles/33961359609875-Keyboard-shortcuts-in-Webflow",
  sourceLabel: "official Webflow keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "general-and-view",
      title: "General and view",
      intro: "Open Webflow's shortcut cheatsheet, save snapshots, publish or export code, change canvas modes, and show comments.",
      shortcuts: [
        same("cheatsheet", "Show the shortcut cheatsheet", ["Shift", "/"]),
        desktop("snapshot", "Save a snapshot", ["Shift", "Cmd", "S"]),
        same("escape", "Deselect the current element or exit", ["Esc"]),
        same("delete", "Delete the selected element", ["Backspace"], "Delete is also documented."),
        desktop("publish", "Open the publish dialog", ["Shift", "Cmd", "P"]),
        desktop("export-code", "Open the code export dialog", ["Shift", "Cmd", "E"]),
        same("edit-element", "Edit the selected element", ["Enter"]),
        desktop("quick-find", "Open Quick Find", ["Cmd", "E"], "Cmd+K is an additional documented binding."),
        desktop("ai-assistant", "Open the AI Assistant", ["Option", "A"]),
        desktop("preview", "Toggle preview mode", ["Shift", "Cmd", "P"]),
        desktop("guide-overlay", "Toggle the guide overlay", ["Shift", "Cmd", "G"]),
        desktop("element-edges", "Show element edges", ["Shift", "Cmd", "E"]),
        desktop("xray", "Toggle X-ray mode", ["Shift", "Cmd", "X"]),
        same("comment-mode", "Toggle comment mode", ["C"]),
        same("comments", "Show or hide on-canvas comments", ["Shift", "C"]),
      ],
    },
    {
      id: "editing-and-breakpoints",
      title: "Editing and breakpoints",
      intro: "Copy, cut, paste, duplicate, undo, redo, and switch between Webflow's desktop, tablet, and mobile breakpoints.",
      shortcuts: [
        desktop("copy", "Copy", ["Cmd", "C"]),
        desktop("cut", "Cut", ["Cmd", "X"]),
        desktop("paste", "Paste", ["Cmd", "V"]),
        desktop("duplicate", "Duplicate the selected element", ["Cmd", "D"]),
        desktop("undo", "Undo", ["Cmd", "Z"]),
        desktop("redo", "Redo", ["Shift", "Cmd", "Z"]),
        same("desktop-breakpoint", "Switch to desktop view", ["1"]),
        same("tablet-breakpoint", "Switch to tablet view", ["2"]),
        same("mobile-landscape", "Switch to mobile landscape view", ["3"]),
        same("mobile-portrait", "Switch to mobile portrait view", ["4"]),
      ],
    },
    {
      id: "panels-and-components",
      title: "Panels and components",
      intro: "Open Webflow's left and right panels, expand panel sections, and create or rename components from the designer.",
      shortcuts: [
        same("add-panel", "Open the Add panel", ["A"]),
        same("pages-panel", "Open the Pages panel", ["P"]),
        same("navigator-panel", "Open the Navigator panel", ["Z"]),
        same("properties-panel", "Open the Properties panel", ["K"]),
        desktop("components-panel", "Open the Components panel", ["Shift", "Cmd", "A"]),
        same("assets-panel", "Show the Assets panel", ["J"]),
        same("style-panel", "Open the Style panel", ["S"]),
        same("element-settings", "Open Element settings", ["D"]),
        same("style-selectors", "Open Style selectors", ["G"]),
        same("interactions-panel", "Open the Interactions panel", ["H"]),
        desktop("make-component", "Make the selected element a component", ["Cmd", "Shift", "A"]),
        desktop("rename-component", "Rename a selected component instance", ["Option", "R"], "F2 is the Windows binding."),
        desktop("add-class", "Add a class to the selected element", ["Cmd", "Enter"]),
        desktop("rename-class", "Rename the last class", ["Cmd", "Shift", "Enter"]),
        desktop("duplicate-class", "Duplicate the last class", ["Cmd", "Option", "Enter"]),
        desktop("remove-class", "Remove the last class", ["Option", "Shift", "Enter"]),
      ],
    },
    {
      id: "canvas-and-layout",
      title: "Canvas and layout",
      intro: "Select related elements, toggle content editors, wrap elements in flex containers, and move elements through the canvas hierarchy.",
      shortcuts: [
        same("select-parent", "Select the parent element", ["Up Arrow"]),
        same("select-child", "Select the child element", ["Down Arrow"]),
        same("select-sibling", "Select a sibling element", ["Left Arrow"], "Right Arrow selects the other sibling direction."),
        desktop("select-next", "Select the next or previous element", ["Option", "Left Arrow"], "Right Arrow selects the opposite direction."),
        desktop("content-editor", "Toggle content editors", ["Cmd", "Shift", "L"]),
        desktop("wrap-horizontal", "Wrap the element in horizontal flex", ["Option", "G"]),
        desktop("wrap-vertical", "Wrap the element in vertical flex", ["Cmd", "G"]),
        desktop("unwrap", "Unwrap the element", ["Cmd", "Shift", "G"]),
        same("move-previous", "Move before the previous element", ["["] , "Command+Down is an additional documented binding."),
        same("move-next", "Move after the previous element", ["]"] , "Command+Up is an additional documented binding."),
        desktop("move-within-parent-left", "Move before a sibling within its parent", ["Cmd", "["] , "Cmd+Left is an additional documented binding."),
        desktop("move-within-parent-right", "Move after a sibling within its parent", ["Cmd", "]"] , "Cmd+Right is an additional documented binding."),
        desktop("move-before-parent", "Move before the parent element", ["Cmd", "Shift", "Up"]),
        desktop("move-after-parent", "Move after the parent element", ["Cmd", "Shift", "Down"]),
      ],
    },
    {
      id: "interactions",
      title: "Interactions timeline",
      intro: "Edit a selected action in the interactions timeline, move it by milliseconds, select multiple actions, and duplicate or paste timeline work.",
      shortcuts: [
        same("timeline-delete", "Delete the selected action", ["Backspace"], "Delete is also documented."),
        same("timeline-hand", "Enable the timeline hand tool", ["H"]),
        desktop("timeline-zoom-in", "Zoom the timeline in", ["Option", "="]),
        desktop("timeline-zoom-out", "Zoom the timeline out", ["Option", "-"]),
        desktop("timeline-forward-10", "Move an action forward by 10 milliseconds", ["Option", "."]),
        desktop("timeline-back-10", "Move an action back by 10 milliseconds", ["Option", ","]),
        same("timeline-forward-100", "Jump an action forward by 100 milliseconds", ["Shift", "."]),
        same("timeline-back-100", "Jump an action back by 100 milliseconds", ["Shift", ","]),
        desktop("timeline-select-all", "Select all timeline actions", ["Cmd", "A"]),
        desktop("timeline-copy", "Copy selected actions", ["Cmd", "C"]),
        desktop("timeline-paste", "Paste selected actions", ["Cmd", "V"]),
        desktop("timeline-duplicate", "Duplicate the selected action", ["Cmd", "D"]),
      ],
    },
  ],
};

export default webflow;
