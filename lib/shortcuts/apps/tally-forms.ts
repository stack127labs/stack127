import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const tallyForms: AppShortcuts = {
  slug: "tally-forms",
  name: "Tally Forms",
  category: "Forms",
  platforms: [...platforms],
  intro:
    "Tally's official keyboard shortcut guide covers form editing, block movement, formatting, command menus, and Markdown-style input. The shared web shortcuts are paired across Windows, macOS, and Linux.",
  versionContext:
    "Tally keyboard shortcuts checked September 1, 2026. The source describes shortcuts for the Tally editor and uses Cmd on macOS and Ctrl on Windows or Linux.",
  sourceUrl: "https://tally.so/help/keyboard-shortcuts",
  sourceLabel: "official Tally keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editing",
      title: "Editing and block movement",
      intro: "Editing shortcuts select, open, move, duplicate, copy, paste, and delete blocks while a form is being built.",
      shortcuts: [
        { id: "escape", action: "Select the current block", keys: combo(platforms, ["Esc"], ["Esc"]) },
        { id: "edit-block", action: "Edit the selected block", keys: combo(platforms, ["Enter"], ["Return"]) },
        { id: "select-up", action: "Select the block above", keys: combo(platforms, ["Up"], ["Up"]) },
        { id: "select-down", action: "Select the block below", keys: combo(platforms, ["Down"], ["Down"]) },
        { id: "move-up", action: "Move a block up", keys: combo(platforms, ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]) },
        { id: "move-down", action: "Move a block down", keys: combo(platforms, ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]) },
        { id: "delete", action: "Delete a block or selection", keys: combo(platforms, ["Backspace"], ["Backspace"]) },
        { id: "copy", action: "Copy a block", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "paste", action: "Paste a block", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "duplicate", action: "Duplicate a block", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
      ],
    },
    {
      id: "text-and-commands",
      title: "Text and commands",
      intro: "Text shortcuts insert lines and formatting, open the block menu or command menu, and apply common Markdown-style constructs.",
      shortcuts: [
        { id: "new-line", action: "Insert a line break", keys: combo(platforms, ["Shift", "Enter"], ["Shift", "Return"]) },
        { id: "bold", action: "Bold selected text", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "italic", action: "Italicize selected text", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
        { id: "underline", action: "Underline selected text", keys: combo(platforms, ["Ctrl", "U"], ["Cmd", "U"]) },
        { id: "link", action: "Add or edit a link", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "block-menu", action: "Open the block menu", keys: combo(platforms, ["/"], ["/"]) },
        { id: "command-menu", action: "Open the command menu", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "heading-1", action: "Create a heading 1 with Markdown input", keys: combo(platforms, ["#", "Space"], ["#", "Space"]) },
        { id: "heading-2", action: "Create a heading 2 with Markdown input", keys: combo(platforms, ["#", "#", "Space"], ["#", "#", "Space"]) },
        { id: "checklist", action: "Create a checklist with Markdown input", keys: combo(platforms, ["[", "]", "Space"], ["[", "]", "Space"]) },
        { id: "mention", action: "Open the mention picker", keys: combo(platforms, ["@"], ["@"]) },
      ],
    },
    {
      id: "block-options",
      title: "Block options",
      intro: "Block option shortcuts open the required, hidden, and logic controls documented for Tally's editor workflow.",
      shortcuts: [
        { id: "required", action: "Toggle the required option", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]) },
        { id: "hidden", action: "Toggle the hidden option", keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Cmd", "Shift", "H"]) },
        { id: "logic", action: "Open logic settings", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]) },
      ],
    },
  ],
};

export default tallyForms;
