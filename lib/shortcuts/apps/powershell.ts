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

export const powershell: AppShortcuts = {
  slug: "powershell",
  name: "PowerShell",
  category: "Shell",
  platforms: [...platforms],
  intro:
    "PowerShell's interactive keyboard layer comes from PSReadLine. This reference covers its Windows, Emacs, and Vi modes across cursor movement, line editing, history, completion, selection, and multiline input.",
  versionContext:
    "Current PSReadLine functions and key handlers documented by Microsoft in August 2026. The active edit mode controls many defaults: Windows mode is common on Windows, while Emacs is the default on non-Windows. Check Get-PSReadLineKeyHandler for the exact local map.",
  sourceUrl: "https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline_functions?view=powershell-7.6",
  sourceLabel: "official Microsoft PSReadLine functions",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "cursor-movement",
      title: "Cursor movement",
      intro: "Move by character, word, line, page, brace, or numeric argument while editing the current PowerShell command.",
      shortcuts: [
        { id: "backward-char", action: "Move left one character", keys: bindings(["Left"], [["Ctrl", "B"]]), note: "Ctrl+B is the Emacs binding; Left works in Windows and Vi insert modes." },
        { id: "forward-char", action: "Move right one character", keys: bindings(["Right"], [["Ctrl", "F"]]), note: "Ctrl+F is the Emacs binding; Right works in Windows and Vi insert modes." },
        { id: "backward-word", action: "Move back one word", keys: bindings(["Ctrl", "Left"], [["Alt", "B"]]), note: "Alt+B is the Emacs binding. Vi insert and command modes also use Ctrl+Left." },
        { id: "forward-word", action: "Move forward one word", keys: bindings(["Ctrl", "Right"], [["Alt", "F"]]), note: "Alt+F is the Emacs binding." },
        { id: "line-start", action: "Move to the start of the line", keys: bindings(["Home"], [["Ctrl", "A"]]) },
        { id: "line-end", action: "Move to the end of the line", keys: bindings(["End"], [["Ctrl", "E"]]) },
        { id: "buffer-start", action: "Move to the start of the input", keys: combo(platforms, ["Ctrl", "Home"]) },
        { id: "buffer-end", action: "Move to the end of the input", keys: combo(platforms, ["Ctrl", "End"]) },
        { id: "goto-brace", action: "Go to the matching brace, parenthesis, or bracket", keys: combo(platforms, ["Ctrl", "]"]) },
        { id: "first-nonblank", action: "Move to the first non-blank character", keys: combo(platforms, ["^"]), note: "Vi command mode; underscore is an alternative." },
        { id: "digit-argument", action: "Start a numeric argument for the next action", keys: combo(platforms, ["Alt", "0"]), note: "Alt+0 through Alt+9 and Alt+- set the argument in Windows and Emacs modes." },
      ],
    },
    {
      id: "editing",
      title: "Editing the command line",
      intro: "Delete, insert, transform, transpose, accept, or cancel text before PowerShell evaluates the command.",
      shortcuts: [
        { id: "backward-delete-char", action: "Delete the character before the cursor", keys: bindings(["Backspace"], [["Ctrl", "H"]]), note: "Ctrl+H is the Emacs binding." },
        { id: "delete-char", action: "Delete the character under the cursor", keys: combo(platforms, ["Delete"]) },
        { id: "delete-char-or-exit", action: "Delete a character, or exit on an empty line", keys: combo(platforms, ["Ctrl", "D"]), note: "Emacs mode." },
        { id: "backward-kill-word", action: "Delete the previous word into the kill ring", keys: bindings(["Ctrl", "Backspace"], [["Ctrl", "W"], ["Alt", "Backspace"]]), note: "Ctrl+Backspace and Ctrl+W are Windows mode; Alt+Backspace and Escape+Backspace are Emacs mode." },
        { id: "kill-word", action: "Delete the next word into the kill ring", keys: bindings(["Alt", "D"], [["Ctrl", "Delete"]]), note: "Alt+D is Windows and Emacs mode; Ctrl+Delete is also bound in Windows and Vi modes." },
        { id: "backward-kill-input", action: "Delete from the start of input to the cursor", keys: combo(platforms, ["Ctrl", "U"]), note: "Emacs mode; Ctrl+X then Backspace is an alternative." },
        { id: "kill-line", action: "Delete from the cursor to the end of input", keys: combo(platforms, ["Ctrl", "K"]), note: "Emacs mode." },
        { id: "forward-delete-input", action: "Delete from the cursor to the end of input without the kill ring", keys: combo(platforms, ["Ctrl", "End"]), note: "Windows and Vi insert modes." },
        { id: "copy", action: "Copy the selected region, or the whole line", keys: combo(platforms, ["Ctrl", "C"]), note: "Windows mode. In Emacs mode Ctrl+C copies when text is selected or cancels the line otherwise." },
        { id: "cut", action: "Cut the selected region", keys: combo(platforms, ["Ctrl", "X"]), note: "Windows mode." },
        { id: "paste", action: "Paste from the system clipboard", keys: bindings(["Ctrl", "V"], [["Shift", "Insert"]]), note: "Windows mode; Vi insert mode uses Ctrl+V." },
        { id: "undo", action: "Undo the previous edit", keys: bindings(["Ctrl", "Z"], [["Ctrl", "_"], ["Ctrl", "X", "Ctrl", "U"]]), note: "Ctrl+Z is Windows and Vi mode; the alternatives are Emacs mode." },
        { id: "redo", action: "Redo an undone edit", keys: combo(platforms, ["Ctrl", "Y"]), note: "Windows and Vi modes." },
        { id: "swap-characters", action: "Swap the current character with the previous one", keys: combo(platforms, ["Ctrl", "T"]), note: "Emacs and Vi insert modes." },
        { id: "capitalize-word", action: "Capitalize the next word", keys: combo(platforms, ["Alt", "C"]), note: "Emacs mode. Escape+C is an alternative." },
        { id: "upcase-word", action: "Convert the next word to uppercase", keys: combo(platforms, ["Alt", "U"]), note: "Emacs mode. Escape+U is an alternative." },
        { id: "downcase-word", action: "Convert the next word to lowercase", keys: combo(platforms, ["Alt", "L"]), note: "Emacs mode. Escape+L is an alternative." },
        { id: "accept-line", action: "Accept and run the current line", keys: bindings(["Enter"], [["Ctrl", "M"]]) },
        { id: "insert-line-above", action: "Insert a blank line above", keys: combo(platforms, ["Ctrl", "Enter"]), note: "Windows mode." },
        { id: "insert-line-below", action: "Insert a blank line below", keys: combo(platforms, ["Ctrl", "Shift", "Enter"]), note: "Windows mode." },
        { id: "add-line", action: "Insert a new line in multiline input", keys: combo(platforms, ["Shift", "Enter"]) },
      ],
    },
    {
      id: "history",
      title: "History",
      intro: "Recall, search, clear, and move through PowerShell history without retyping commands you already composed.",
      shortcuts: [
        { id: "previous-history", action: "Load the previous history entry", keys: bindings(["Up"], [["Ctrl", "P"]]), note: "Ctrl+P is the Emacs alternative. Vi command mode also supports K and minus." },
        { id: "next-history", action: "Load the next history entry", keys: bindings(["Down"], [["Ctrl", "N"]]), note: "Ctrl+N is the Emacs alternative. Vi command mode also supports J and plus." },
        { id: "reverse-search", action: "Search history backward incrementally", keys: combo(platforms, ["Ctrl", "R"]) },
        { id: "forward-search", action: "Search history forward incrementally", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "history-search-backward", action: "Find the previous history entry matching the current prefix", keys: combo(platforms, ["F8"]), note: "Windows mode." },
        { id: "history-search-forward", action: "Find the next history entry matching the current prefix", keys: combo(platforms, ["Shift", "F8"]), note: "Windows mode." },
        { id: "beginning-history", action: "Move to the first history item", keys: combo(platforms, ["Alt", "<"]), note: "Emacs mode." },
        { id: "end-history", action: "Move to the current input at the end of history", keys: combo(platforms, ["Alt", ">"]), note: "Emacs mode." },
        { id: "clear-history", action: "Clear PSReadLine history", keys: combo(platforms, ["Alt", "F7"]), note: "Windows mode. This does not clear PowerShell's persisted history." },
      ],
    },
    {
      id: "completion-and-display",
      title: "Completion and display",
      intro: "Complete commands, show a menu of possible completions, inspect parameter help, clear the screen, and capture text.",
      shortcuts: [
        { id: "complete", action: "Complete the text around the cursor", keys: combo(platforms, ["Tab"]), note: "Emacs mode. Windows mode uses Tab for TabCompleteNext." },
        { id: "menu-complete", action: "Show completion options in a menu", keys: bindings(["Ctrl", "Space"], [["Ctrl", "@"]]), note: "Emacs mode uses Ctrl+Space. Windows mode uses Ctrl+Spacebar or Ctrl+@." },
        { id: "possible-completions", action: "Display possible completions", keys: bindings(["Alt", "="], [["Ctrl", "Space"]]), note: "Alt+= is Emacs mode; Ctrl+Space is Vi insert and command mode." },
        { id: "complete-next", action: "Select the next completion", keys: combo(platforms, ["Tab"]), note: "Windows mode and Vi command mode." },
        { id: "complete-previous", action: "Select the previous completion", keys: combo(platforms, ["Shift", "Tab"]), note: "Windows mode and Vi insert or command mode." },
        { id: "parameter-help", action: "Show dynamic parameter help", keys: combo(platforms, ["Alt", "H"]) },
        { id: "clear-screen", action: "Clear the screen and redraw the current line", keys: combo(platforms, ["Ctrl", "L"]) },
        { id: "capture-screen", action: "Start interactive screen capture", keys: [], note: "The function is unbound by default. Bind it with Set-PSReadLineKeyHandler if you need it." },
      ],
    },
    {
      id: "selection-and-vi",
      title: "Selection and Vi mode",
      intro: "Select text, move through visual ranges, and use the mode-specific bindings that only appear in PSReadLine's Vi command layer.",
      shortcuts: [
        { id: "select-left", action: "Select one character left", keys: combo(platforms, ["Shift", "Left"]) },
        { id: "select-right", action: "Select one character right", keys: combo(platforms, ["Shift", "Right"]) },
        { id: "select-line", action: "Select to the end of the line", keys: combo(platforms, ["Shift", "End"]) },
        { id: "select-next-word", action: "Select the next word", keys: combo(platforms, ["Shift", "Ctrl", "Right"]), note: "Windows mode." },
        { id: "select-forward-word", action: "Extend selection by the next word", keys: combo(platforms, ["Alt", "F"]), note: "Emacs mode." },
        { id: "set-mark", action: "Set a mark at the cursor", keys: combo(platforms, ["Ctrl", "@"]), note: "Emacs mode." },
        { id: "vi-command-mode", action: "Switch from Vi insert to Vi command mode", keys: combo(platforms, ["Esc"]), note: "Vi mode." },
        { id: "vi-delete-line", action: "Delete the current line", keys: combo(platforms, ["d", "d"]), note: "Vi command mode." },
        { id: "vi-undo-all", action: "Undo all edits for the line", keys: combo(platforms, ["U"]), note: "Vi command mode." },
        { id: "vi-edit-buffer", action: "Open the current command in the external editor", keys: combo(platforms, ["v"]), note: "Vi command mode; Emacs uses Ctrl+X then Ctrl+E." },
        { id: "vi-search-history", action: "Start a Vi history search", keys: combo(platforms, ["/"]), note: "Vi command mode. The search starts after you accept the search text." },
        { id: "vi-paste-before", action: "Paste before the cursor", keys: combo(platforms, ["P"]), note: "Vi command mode." },
        { id: "vi-paste-after", action: "Paste after the cursor", keys: combo(platforms, ["p"]), note: "Vi command mode." },
      ],
    },
  ],
};

export default powershell;
