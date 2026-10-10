import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const squarespace: AppShortcuts = {
  slug: "squarespace",
  name: "Squarespace",
  category: "Website builder",
  platforms: [...platforms],
  versionContext:
    "Squarespace keyboard shortcuts checked September 1, 2026. The official guide was updated November 5, 2025 and warns that some shortcuts do not work in products or panels outside direct site editing.",
  sourceUrl: "https://support.squarespace.com/hc/en-us/articles/214491097-Squarespace-keyboard-shortcuts-and-tips",
  sourceLabel: "official Squarespace keyboard shortcuts and tips",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "navigation",
      title: "Site navigation",
      intro: "Site navigation shortcuts open preview, search panels, and the accessible focus order used while editing a Squarespace site.",
      shortcuts: [
        { id: "preview", action: "Open or close the full preview", keys: perPlatform(platforms, { windows: ["Esc"], macos: ["Esc"] }) },
        { id: "search-panel", action: "Search for a panel", keys: perPlatform(platforms, { windows: ["/"], macos: ["/"] }), note: "The source also lists question mark. Browser search behavior can intercept this key." },
        { id: "next-element", action: "Highlight the next element", keys: perPlatform(platforms, { windows: ["Tab"], macos: ["Tab"] }) },
        { id: "previous-element", action: "Move to the previous highlighted element", keys: perPlatform(platforms, { windows: ["Shift", "Tab"], macos: ["Shift", "Tab"] }) },
        { id: "select-element", action: "Select highlighted content", keys: perPlatform(platforms, { windows: ["Space"], macos: ["Space"] }) },
        { id: "open-block-menu", action: "Open the menu for a selected block", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"] }) },
      ],
    },
    {
      id: "fluid-engine",
      title: "Fluid Engine",
      intro: "Fluid Engine shortcuts select, move, resize, duplicate, copy, paste, hide, and arrange blocks in the current browser width.",
      shortcuts: [
        { id: "select-all-blocks", action: "Select all blocks in a section", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "delete-block", action: "Delete selected blocks", keys: perPlatform(platforms, { windows: ["Delete"], macos: ["Delete"] }) },
        { id: "move-block", action: "Move a block", keys: perPlatform(platforms, { windows: ["Arrow keys"], macos: ["Arrow keys"] }) },
        { id: "resize-block", action: "Resize a block", keys: combo(platforms, ["Ctrl", "Arrow keys"], ["Cmd", "Arrow keys"]) },
        { id: "symmetric-resize", action: "Resize a block symmetrically", keys: combo(platforms, ["Ctrl", "Shift", "Arrow keys"], ["Cmd", "Shift", "Arrow keys"]) },
        { id: "move-forward", action: "Move a block forward or backward", keys: perPlatform(platforms, { windows: ["Shift", "Up/Down"], macos: ["Shift", "Up/Down"] }) },
        { id: "duplicate-block", action: "Duplicate a block", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "copy-block", action: "Copy a block", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste-block", action: "Paste a block", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "hide-block", action: "Hide a selected block at the current browser width", keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]) },
        { id: "show-grid", action: "Show the grid", keys: perPlatform(platforms, { windows: ["G"], macos: ["G"] }) },
      ],
    },
    {
      id: "text-formatting",
      title: "Text formatting",
      intro: "Text formatting shortcuts add links, set heading levels, align text, change indentation, and undo or redo edits.",
      shortcuts: [
        { id: "link", action: "Add a link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "normal-text", action: "Set Paragraph 2 or Normal text", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "1"], macos: ["Cmd", "Option", "1"] }) },
        { id: "heading-1", action: "Set Heading 1", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "6"], macos: ["Cmd", "Option", "6"] }) },
        { id: "heading-2", action: "Set Heading 2", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "5"], macos: ["Cmd", "Option", "5"] }) },
        { id: "heading-3", action: "Set Heading 3", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "4"], macos: ["Cmd", "Option", "4"] }) },
        { id: "bold", action: "Bold", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italic", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "align-left", action: "Align left", keys: perPlatform(platforms, { windows: ["Shift", "Ctrl", "L"], macos: ["Shift", "Cmd", "L"] }) },
        { id: "align-center", action: "Align center", keys: perPlatform(platforms, { windows: ["Shift", "Ctrl", "E"], macos: ["Shift", "Cmd", "E"] }) },
        { id: "align-right", action: "Align right", keys: perPlatform(platforms, { windows: ["Shift", "Ctrl", "R"], macos: ["Shift", "Cmd", "R"] }) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: perPlatform(platforms, { windows: ["Ctrl", "Y"], macos: ["Cmd", "Y"] }) },
        { id: "paste-plain", action: "Paste as plain text", keys: combo(platforms, ["Ctrl", "Shift", "V"], ["Cmd", "Shift", "V"]) },
        { id: "indent-more", action: "Increase text indent", keys: combo(platforms, ["Ctrl", "]"], ["Cmd", "]"]) },
        { id: "indent-less", action: "Decrease text indent", keys: combo(platforms, ["Ctrl", "["], ["Cmd", "["]) },
      ],
    },
  ],
};

export default squarespace;
