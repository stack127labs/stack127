import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const claudeCode: AppShortcuts = {
  slug: "claude-code",
  name: "Claude Code",
  category: "AI coding agent",
  platforms: [...platforms],
  intro:
    "Claude Code spends most of its time waiting for a decision, running a tool, or holding a prompt. These official interactive-mode shortcuts cover interrupts, rewinds, mode changes, multiline input, terminal-style editing, and transcript navigation.",
  versionContext:
    "Interactive-mode shortcuts from the official Claude Code docs checked August 26, 2026. Keys vary by terminal. On macOS, Option must be configured as Meta for Alt-style text editing. The readline flavor changes some editing defaults in Claude Code v2.1.238 and later.",
  sourceUrl: "https://code.claude.com/docs/en/interactive-mode",
  sourceLabel: "official Claude Code interactive mode reference",
  lastVerified: "2026-08-26",
  groups: [
    {
      id: "session-control",
      title: "Session control",
      intro: "Stop, background, redraw, and leave a session safely while preserving the work already completed.",
      shortcuts: [
        { id: "interrupt-escape", action: "Interrupt Claude mid-turn", keys: combo(platforms, ["Esc"]), note: "Keeps work completed so far." },
        { id: "interrupt-control-c", action: "Cancel current input or generation", keys: combo(platforms, ["Ctrl", "C"]), note: "The first press clears a draft or stops work. A second press exits." },
        { id: "rewind", action: "Clear a draft, or open the rewind menu when the prompt is empty", keys: combo(platforms, ["Esc", "Esc"]) },
        { id: "stop-background-work", action: "Stop background agents and artifact replies", keys: combo(platforms, ["Ctrl", "X", "Ctrl", "K"]), note: "Repeat the sequence to confirm." },
        { id: "background-bash", action: "Move a running Bash command to the background", keys: combo(platforms, ["Ctrl", "B"]) },
        { id: "exit-session", action: "Exit the session", keys: combo(platforms, ["Ctrl", "D"]), note: "Claude Code asks for confirmation when needed." },
        { id: "clear-screen", action: "Redraw the terminal screen", keys: combo(platforms, ["Ctrl", "L"]) },
        { id: "toggle-task-list", action: "Toggle the task checklist", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "stash-prompt", action: "Stash or restore the current prompt", keys: combo(platforms, ["Ctrl", "S"]) },
        { id: "suspend-session", action: "Suspend Claude Code to the shell", keys: perPlatform(platforms, { macos: ["Ctrl", "Z"], linux: ["Ctrl", "Z"] }), note: "Unix shells resume with fg. Claude Code does not list a Windows default for this action." },
        { id: "switch-dialog-tab", action: "Move between dialog tabs", keys: combo(platforms, ["Left"]), note: "Right moves the other way." },
        { id: "accept-autocomplete", action: "Accept an autocomplete suggestion or permission comment", keys: combo(platforms, ["Tab"]) },
        { id: "close-dialog", action: "Close a dialog or interrupt the current interaction", keys: combo(platforms, ["Esc"]) },
      ],
    },
    {
      id: "modes-and-models",
      title: "Modes and models",
      intro: "Change permissions, model selection, fast mode, and extended thinking without leaving the prompt.",
      shortcuts: [
        { id: "cycle-permission-modes", action: "Cycle permission modes", keys: perPlatform(platforms, { macos: ["Shift", "Tab"], windows: ["Alt", "M"], linux: ["Shift", "Tab"] }), note: "Windows uses Alt+M; macOS and Linux use Shift+Tab." },
        { id: "switch-model", action: "Switch models without clearing the prompt", keys: perPlatform(platforms, { macos: ["Option", "P"], windows: ["Alt", "P"], linux: ["Alt", "P"] }), note: "The macOS binding needs Option as Meta in some terminals." },
        { id: "toggle-thinking", action: "Toggle extended thinking", keys: perPlatform(platforms, { macos: ["Option", "T"], windows: ["Alt", "T"], linux: ["Alt", "T"] }), note: "This is Alt+T, not Tab. macOS may need Option as Meta." },
        { id: "toggle-fast-mode", action: "Toggle fast mode", keys: perPlatform(platforms, { macos: ["Option", "O"], windows: ["Alt", "O"], linux: ["Alt", "O"] }), note: "The macOS binding may need Option as Meta." },
        { id: "enable-vim-mode", action: "Enable Vim-style editing", keys: [], note: "Run /vim. Esc enters NORMAL mode and i enters INSERT mode; this is a command, not a default shortcut." },
      ],
    },
    {
      id: "prompt-input",
      title: "Prompt input and history",
      intro: "Move through prompt history, edit text with readline-style controls, and open the editor or transcript.",
      shortcuts: [
        { id: "history-previous", action: "Move to the previous prompt in history", keys: combo(platforms, ["Up"]), note: "Down moves forward. In multiline input, arrows move within the draft first." },
        { id: "reverse-search", action: "Reverse-search prompt history", keys: combo(platforms, ["Ctrl", "R"]), note: "Enter accepts the result; Esc keeps it for editing." },
        { id: "external-editor", action: "Open the current prompt in the external editor", keys: combo(platforms, ["Ctrl", "G"]) },
        { id: "transcript", action: "Open the transcript viewer", keys: combo(platforms, ["Ctrl", "O"]) },
        { id: "line-start", action: "Move to the start of the line", keys: combo(platforms, ["Ctrl", "A"]) },
        { id: "line-end", action: "Move to the end of the line", keys: combo(platforms, ["Ctrl", "E"]) },
        { id: "word-back", action: "Move back one word", keys: combo(platforms, ["Alt", "B"]), note: "Requires Option as Meta on macOS." },
        { id: "word-forward", action: "Move forward one word", keys: combo(platforms, ["Alt", "F"]), note: "Requires Option as Meta on macOS." },
        { id: "delete-to-end", action: "Delete from the cursor to the end of the line", keys: combo(platforms, ["Ctrl", "K"]) },
        { id: "delete-to-start", action: "Delete from the cursor to the start of the line", keys: combo(platforms, ["Ctrl", "U"]) },
        { id: "delete-previous-word", action: "Delete the previous word", keys: combo(platforms, ["Ctrl", "W"]) },
        { id: "delete-next-word", action: "Delete the next word", keys: combo(platforms, ["Alt", "D"]), note: "Requires Option as Meta on macOS." },
        { id: "paste-deleted", action: "Paste the most recently deleted text", keys: combo(platforms, ["Ctrl", "Y"]) },
        { id: "cycle-paste-history", action: "Cycle through deleted-text history", keys: combo(platforms, ["Alt", "Y"]), note: "Press after Ctrl+Y. Requires Option as Meta on macOS." },
        { id: "undo-input-edit", action: "Undo the last input edit", keys: combo(platforms, ["Ctrl", "_"]), note: "Ctrl+Shift+- also works." },
        { id: "paste-image", action: "Paste an image from the clipboard", keys: perPlatform(platforms, { macos: ["Ctrl", "V"], windows: ["Alt", "V"], linux: ["Ctrl", "V"] }), note: "iTerm2 on macOS also accepts Cmd+V; Windows and WSL use Alt+V for image paste." },
      ],
    },
    {
      id: "multiline-input",
      title: "Multiline input",
      intro: "Add a line break without sending the prompt, including the fallback forms that work across terminal emulators.",
      shortcuts: [
        { id: "backslash-enter", action: "Insert a line break with backslash then Enter", keys: combo(platforms, ["\\", "Enter"]), note: "Works in every terminal." },
        { id: "ctrl-j", action: "Insert a line break", keys: combo(platforms, ["Ctrl", "J"]) },
        { id: "option-enter", action: "Insert a line break on macOS", keys: [{ platform: "macos", keys: ["Option", "Enter"] }], note: "Option must be configured as Meta in some terminals." },
        { id: "shift-enter", action: "Insert a line break with Shift+Enter", keys: combo(platforms, ["Shift", "Enter"]), note: "Available in terminals configured with /terminal-setup or native Shift+Enter support." },
      ],
    },
    {
      id: "prompt-prefixes",
      title: "Prompt prefixes",
      intro: "A leading character changes how an otherwise ordinary prompt is interpreted.",
      shortcuts: [
        { id: "slash-commands", action: "Open slash commands and skills", keys: combo(platforms, ["/"]), note: "Type it at the start of an empty prompt." },
        { id: "bash-mode", action: "Run the line as a shell command", keys: combo(platforms, ["!"]) },
        { id: "file-mention", action: "Mention a file or other resource", keys: combo(platforms, ["@"]) },
        { id: "emoji-shortcode", action: "Open an emoji shortcode", keys: combo(platforms, [":"]), note: "Available in current Claude Code versions that support emoji shortcodes." },
      ],
    },
    {
      id: "transcript-and-help",
      title: "Transcript and help",
      intro: "Use the help panel, fullscreen transcript, and voice input controls when the response is already on screen.",
      shortcuts: [
        { id: "theme-picker", action: "Open or navigate the theme picker", keys: combo(platforms, ["Ctrl", "T"]) },
        { id: "shortcut-help", action: "Open shortcut help", keys: combo(platforms, ["?"]) },
        { id: "voice-input", action: "Start or stop voice input", keys: combo(platforms, ["Space"]), note: "Hold or tap Space according to the voice-input state." },
        { id: "transcript-help", action: "Open transcript shortcut help", keys: combo(platforms, ["?"]), note: "Use inside the transcript viewer." },
        { id: "transcript-previous-prompt", action: "Move to the previous user prompt in the transcript", keys: combo(platforms, ["{"]) },
        { id: "transcript-next-prompt", action: "Move to the next user prompt in the transcript", keys: combo(platforms, ["}"]) },
        { id: "transcript-show-all", action: "Show the full transcript in the classic viewer", keys: combo(platforms, ["Ctrl", "E"]) },
        { id: "transcript-scrollback", action: "Write the full conversation to terminal scrollback", keys: combo(platforms, ["["]), note: "Available in the fullscreen transcript viewer." },
        { id: "transcript-editor", action: "Open the transcript in your editor", keys: combo(platforms, ["v"]), note: "Lowercase v is the current fullscreen-transcript binding." },
        { id: "transcript-close", action: "Close the transcript viewer", keys: combo(platforms, ["q"]), note: "Ctrl+C and Esc also close it." },
      ],
    },
  ],
};

export default claudeCode;
