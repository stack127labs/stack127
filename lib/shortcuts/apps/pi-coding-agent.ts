import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

function bindings(keys: string[], alternatives: string[][] = []) {
  return platforms.map((platform) => ({
    platform,
    keys,
    ...(alternatives.length > 0 ? { alternatives } : {}),
  }));
}

export const piCodingAgent: AppShortcuts = {
  slug: "pi-coding-agent",
  name: "Pi coding agent",
  category: "AI coding agent",
  platforms: [...platforms],
  intro:
    "Pi's keyboard model separates the prompt you are writing from the agent work already running. This reference covers the current editor, queue, session, model, thinking, transcript, tree, and application defaults.",
  versionContext:
    "Current defaults from Pi's official coding-agent README and keybindings guide in August 2026. Bindings can be replaced in ~/.pi/agent/keybindings.json and reloaded with /reload. Native Windows and WSL have a few terminal-specific differences.",
  sourceUrl: "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/keybindings.md",
  sourceLabel: "official Pi keybindings guide",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "application",
      title: "Application control",
      intro: "Clear, interrupt, quit, suspend, open an external editor, and move clipboard content into the current Pi session.",
      shortcuts: [
        { id: "clear-or-quit", action: "Clear the editor, or quit on the second press", keys: combo(platforms, ["Ctrl", "C"]) },
        { id: "quit-empty", action: "Quit when the editor is empty", keys: combo(platforms, ["Ctrl", "D"]) },
        { id: "interrupt", action: "Cancel autocomplete or abort streaming", keys: combo(platforms, ["Esc"]) },
        { id: "suspend", action: "Suspend Pi to the background", keys: perPlatform(platforms, { macos: ["Ctrl", "Z"], linux: ["Ctrl", "Z"] }), note: "Native Windows has no default suspend binding. WSL follows the Linux behavior; use fg to resume on Unix-like shells." },
        { id: "external-editor", action: "Open the prompt in an external editor", keys: combo(platforms, ["Ctrl", "G"]), note: "Uses externalEditor, VISUAL, EDITOR, Notepad on Windows, or nano elsewhere." },
        { id: "paste", action: "Paste text or an image", keys: bindings(["Ctrl", "V"], [["Alt", "V"]]), note: "Alt+V is the Windows and WSL fallback." },
        { id: "copy-message", action: "Copy the last assistant message", keys: combo(platforms, ["Ctrl", "X"]) },
      ],
    },
    {
      id: "models-and-thinking",
      title: "Models, thinking, and tools",
      intro: "Choose a model, cycle a scoped model list, change thinking level, and control how tool output or thinking blocks are shown.",
      shortcuts: [
        { id: "model-selector", action: "Open the model selector", keys: combo(platforms, ["Ctrl", "L"]) },
        { id: "model-forward", action: "Cycle scoped models forward", keys: combo(platforms, ["Ctrl", "P"]), note: "Shift+Ctrl+P cycles backward. Alt+P is the Windows and WSL backward binding." },
        { id: "model-backward", action: "Cycle scoped models backward", keys: bindings(["Shift", "Ctrl", "P"], [["Alt", "P"]]) },
        { id: "thinking-level", action: "Cycle the thinking level", keys: combo(platforms, ["Shift", "Tab"]) },
        { id: "thinking-blocks", action: "Collapse or expand thinking blocks", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "tool-output", action: "Collapse or expand tool output", keys: combo(platforms, ["Ctrl", "O"]) },
      ],
    },
    {
      id: "editor-cursor",
      title: "Prompt cursor and history",
      intro: "Move through the prompt by character, word, line, page, or history entry while preserving the distinction between editing and sending.",
      shortcuts: [
        { id: "cursor-up", action: "Move up or browse older history at the top", keys: combo(platforms, ["Up"]) },
        { id: "cursor-down", action: "Move down or browse newer history at the bottom", keys: combo(platforms, ["Down"]) },
        { id: "cursor-left", action: "Move left one character", keys: bindings(["Left"], [["Ctrl", "B"]]) },
        { id: "cursor-right", action: "Move right one character", keys: bindings(["Right"], [["Ctrl", "F"]]) },
        { id: "cursor-word-left", action: "Move left one word", keys: bindings(["Alt", "Left"], [["Ctrl", "Left"], ["Alt", "B"]]) },
        { id: "cursor-word-right", action: "Move right one word", keys: bindings(["Alt", "Right"], [["Ctrl", "Right"], ["Alt", "F"]]) },
        { id: "cursor-line-start", action: "Move to the line start", keys: bindings(["Home"], [["Ctrl", "Home"], ["Ctrl", "A"]]) },
        { id: "cursor-line-end", action: "Move to the line end", keys: bindings(["End"], [["Ctrl", "End"], ["Ctrl", "E"]]) },
        { id: "jump-forward", action: "Jump forward to a character", keys: combo(platforms, ["Ctrl", "]"]) },
        { id: "jump-backward", action: "Jump backward to a character", keys: combo(platforms, ["Ctrl", "Alt", "]"]) },
        { id: "page-up", action: "Scroll the editor up by a page", keys: bindings(["PageUp"], [["Ctrl", "PageUp"]]) },
        { id: "page-down", action: "Scroll the editor down by a page", keys: bindings(["PageDown"], [["Ctrl", "PageDown"]]) },
      ],
    },
    {
      id: "editing-and-queue",
      title: "Editing, queue, and multiline input",
      intro: "Delete text, use the kill ring, insert new lines, complete paths, and decide whether a message steers the current run or follows it.",
      shortcuts: [
        { id: "delete-backward", action: "Delete the previous character", keys: combo(platforms, ["Backspace"]) },
        { id: "delete-forward", action: "Delete the next character", keys: bindings(["Delete"], [["Ctrl", "D"]]) },
        { id: "delete-word-backward", action: "Delete the previous word", keys: bindings(["Ctrl", "W"], [["Alt", "Backspace"]]) },
        { id: "delete-word-forward", action: "Delete the next word", keys: bindings(["Alt", "D"], [["Alt", "Delete"]]) },
        { id: "delete-line-start", action: "Delete to the line start", keys: combo(platforms, ["Ctrl", "U"]) },
        { id: "delete-line-end", action: "Delete to the line end", keys: combo(platforms, ["Ctrl", "K"]) },
        { id: "yank", action: "Paste the most recently deleted text", keys: combo(platforms, ["Ctrl", "Y"]) },
        { id: "yank-pop", action: "Cycle through deleted text after yanking", keys: combo(platforms, ["Alt", "Y"]) },
        { id: "undo", action: "Undo the last edit", keys: perPlatform(platforms, { windows: ["Ctrl", "Z"], macos: ["Ctrl", "-"], linux: ["Ctrl", "-"] }), note: "Alt+Z is the documented WSL fallback." },
        { id: "new-line", action: "Insert a line without submitting", keys: bindings(["Shift", "Enter"], [["Ctrl", "J"], ["Ctrl", "Enter"]]), note: "Windows Terminal may need Ctrl+Enter instead of Shift+Enter." },
        { id: "complete-path", action: "Complete a path or accept autocomplete", keys: combo(platforms, ["Tab"]) },
        { id: "send-steering", action: "Send now, or queue a steering message while busy", keys: combo(platforms, ["Enter"]) },
        { id: "queue-follow-up", action: "Queue a follow-up after the current work finishes", keys: bindings(["Alt", "Enter"], [["Ctrl", "Q"]]), note: "Ctrl+Q is the Windows and WSL binding. Windows Terminal may reserve Alt+Enter for full-screen." },
        { id: "restore-queued", action: "Restore queued messages to the editor", keys: bindings(["Alt", "Up"], [["Alt", "Q"]]), note: "Alt+Q is the Windows and WSL binding." },
      ],
    },
    {
      id: "fullscreen-transcript",
      title: "Fullscreen transcript",
      intro: "When fullscreen TUI mode is active, use these transcript bindings to search rendered output and jump between marked prompts.",
      shortcuts: [
        { id: "transcript-page-up", action: "Scroll the transcript up by a page", keys: combo(platforms, ["PageUp"]) },
        { id: "transcript-page-down", action: "Scroll the transcript down by a page", keys: combo(platforms, ["PageDown"]) },
        { id: "previous-prompt", action: "Jump to the previous marked prompt", keys: perPlatform(platforms, { windows: ["Ctrl", "Up"], macos: ["Ctrl", "Shift", "Up"], linux: ["Ctrl", "Shift", "Up"] }) },
        { id: "next-prompt", action: "Jump to the next marked prompt", keys: perPlatform(platforms, { windows: ["Ctrl", "Down"], macos: ["Ctrl", "Shift", "Down"], linux: ["Ctrl", "Shift", "Down"] }) },
        { id: "transcript-search", action: "Search the rendered transcript", keys: perPlatform(platforms, { windows: ["Ctrl", "F"], macos: ["Ctrl", "Shift", "F"], linux: ["Ctrl", "Shift", "F"] }) },
        { id: "search-next", action: "Select the next transcript search match", keys: bindings(["Enter"], [["Ctrl", "G"]]) },
        { id: "search-previous", action: "Select the previous transcript search match", keys: bindings(["Shift", "Enter"], [["Ctrl", "Shift", "G"]]) },
        { id: "search-close", action: "Close transcript search", keys: combo(platforms, ["Esc"]) },
        { id: "transcript-top", action: "Scroll to the start of the transcript", keys: combo(platforms, ["Home"]) },
        { id: "transcript-bottom", action: "Scroll to the end and follow new output", keys: combo(platforms, ["End"]) },
      ],
    },
    {
      id: "sessions-and-tree",
      title: "Session tree and filters",
      intro: "Use the session tree and its filters to move between branches, label entries, and control which messages or tool results remain visible.",
      shortcuts: [
        { id: "toggle-path", action: "Toggle session path display", keys: combo(platforms, ["Ctrl", "P"]) },
        { id: "toggle-sort", action: "Toggle session sort mode", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "toggle-named-filter", action: "Toggle the named-only session filter", keys: combo(platforms, ["Ctrl", "N"]) },
        { id: "tree-fold-up", action: "Fold a branch segment or jump to its previous start", keys: bindings(["Ctrl", "Left"], [["Alt", "Left"]]) },
        { id: "tree-unfold-down", action: "Unfold a branch segment or jump to its next end", keys: bindings(["Ctrl", "Right"], [["Alt", "Right"]]) },
        { id: "tree-label", action: "Edit the selected tree label", keys: combo(platforms, ["Shift", "L"]) },
        { id: "tree-timestamp", action: "Toggle tree label timestamps", keys: combo(platforms, ["Shift", "T"]) },
        { id: "tree-filter-default", action: "Use the default tree filter", keys: combo(platforms, ["Ctrl", "D"]) },
        { id: "tree-filter-tools", action: "Toggle the no-tools tree filter", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "tree-filter-user", action: "Toggle the user-only tree filter", keys: combo(platforms, ["Ctrl", "U"]) },
        { id: "tree-filter-labeled", action: "Toggle the labeled-only tree filter", keys: combo(platforms, ["Ctrl", "L"]) },
        { id: "tree-filter-all", action: "Show all tree entries", keys: combo(platforms, ["Ctrl", "A"]) },
        { id: "tree-filter-cycle", action: "Cycle tree filters forward", keys: combo(platforms, ["Ctrl", "O"]) },
        { id: "tree-filter-cycle-back", action: "Cycle tree filters backward", keys: combo(platforms, ["Ctrl", "Shift", "O"]) },
      ],
    },
    {
      id: "scoped-models",
      title: "Scoped model selector",
      intro: "Inside the scoped-models selector, save the selection, toggle providers, and reorder the models used by the cycling shortcut.",
      shortcuts: [
        { id: "scoped-save", action: "Save the current model selection", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "scoped-enable-all", action: "Enable all matching models", keys: combo(platforms, ["Ctrl", "A"]) },
        { id: "scoped-clear-all", action: "Clear all matching models", keys: combo(platforms, ["Ctrl", "X"]) },
        { id: "scoped-provider", action: "Toggle all models for the provider", keys: combo(platforms, ["Ctrl", "P"]) },
        { id: "scoped-reorder-up", action: "Move the selected model up", keys: combo(platforms, ["Alt", "Up"]) },
        { id: "scoped-reorder-down", action: "Move the selected model down", keys: combo(platforms, ["Alt", "Down"]) },
      ],
    },
  ],
};

export default piCodingAgent;
