import type { AppShortcuts, Shortcut, ShortcutGroup } from "../types.ts";

type Row = [id: string, action: string, windows: string[][] | null, macos?: string[][] | null, note?: string];

const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos, note]) => ({
    id,
    action,
    keys: [
      ...(windows ? [{ platform: "windows" as const, keys: windows[0], ...(windows.length > 1 ? { alternatives: windows.slice(1) } : {}) }] : []),
      ...(macos !== null && (macos ?? windows)
        ? [{
            platform: "macos" as const,
            keys: (macos ?? windows)![0],
            ...((macos ?? windows)!.length > 1 ? { alternatives: (macos ?? windows)!.slice(1) } : {}),
          }]
        : []),
    ],
    ...(note ? { note } : {}),
  }));

export const acrobatSharedGroups: ShortcutGroup[] = [
  {
    id: "tools-pane",
    title: "Tools pane navigation",
    intro: "These keys move focus through Acrobat's global toolbar and All tools pane without selecting a tool by pointer.",
    shortcuts: rows([
      ["next-global-tool", "Move focus to the next tool in the global toolbar", [["Tab"]]],
      ["previous-global-tool", "Move focus to the previous tool in the global toolbar", [["Shift", "Tab"]]],
      ["expand-focused-tool", "Expand the focused tool", [["Space"], ["Enter"]]],
      ["close-focused-tool", "Close the open tool when its close button has focus", [["Space"], ["Enter"]]],
      ["focus-view-more", "Move focus to View more in All tools", [["Tab"]]],
      ["next-all-tools-item", "Move to the next touchpoint in All tools", [["Down"]]],
      ["previous-all-tools-item", "Move to the previous touchpoint in All tools", [["Up"]]],
      ["open-all-tools-item", "Open the focused All tools item", [["Space"], ["Enter"]]],
      ["toggle-view-more", "Expand or collapse View more", [["Space"], ["Enter"]]],
      ["toggle-view-less", "Expand or collapse View less", [["Space"], ["Enter"]]],
      ["close-all-tools", "Close the All tools pane", [["Esc"]]],
    ]),
  },
  {
    id: "document-tools",
    title: "Document and editing tools",
    intro: "Single-letter tool accelerators require the Use single-key accelerators to access tools preference. Some editing tools require an Acrobat Pro entitlement.",
    shortcuts: rows([
      ["temporary-hand", "Temporarily use the Hand tool", [["Space"]]],
      ["hand-tool", "Select the Hand tool", [["H"]]],
      ["select-tool", "Select the Select tool", [["V"]]],
      ["marquee-zoom", "Select the Marquee Zoom tool", [["Z"]]],
      ["cycle-zoom-tools", "Cycle through Marquee Zoom, Dynamic Zoom, and Loupe", [["Shift", "Z"]]],
      ["temporary-dynamic-zoom", "Temporarily use Dynamic Zoom while Marquee Zoom is selected", [["Shift"]]],
      ["temporary-zoom-out", "Temporarily zoom out while Marquee Zoom is selected", [["Ctrl"]], [["Option"]]],
      ["temporary-zoom-in", "Temporarily use the Zoom In tool", [["Ctrl", "Space"]], [["Cmd", "Space"]]],
      ["select-object", "Select the Select Object tool", [["R"]]],
      ["edit-object", "Select the Edit Object tool", [["O"]]],
      ["forms-editing", "Enter or exit forms editing", [["A"]]],
      ["crop-tool", "Select the Crop tool", [["C"]]],
      ["link-tool", "Select the Link tool", [["L"]]],
      ["text-field-tool", "Select the Text Field tool", [["F"]]],
      ["cycle-form-tools", "Cycle through the form authoring tools", [["Shift", "F"]]],
      ["3d-tool", "Select the 3D tool", [["M"]]],
      ["cycle-multimedia-tools", "Cycle through 3D, SWF, Sound, and Video tools", [["Shift", "M"]]],
      ["edit-text", "Select Edit text", [["T"]]],
      ["redact", "Select Redact", [["Shift", "Y"]]],
      ["cycle-touch-up", "Cycle through Touch Up tools", [["Shift", "T"]]],
      ["javascript-debugger", "Open the JavaScript Debugger", [["Ctrl", "J"]], [["Cmd", "J"]]],
      ["insert-blank-pages", "Open the Insert blank pages tool", [["Ctrl", "Shift", "T"]], [["Cmd", "Shift", "T"]]],
      ["insert-files", "Insert files", [["Ctrl", "Shift", "I"]], [["Cmd", "Shift", "I"]]],
      ["delete-pages", "Delete pages", [["Ctrl", "Shift", "D"]], [["Cmd", "Shift", "D"]]],
      ["output-preview", "Open Output Preview", [["~"]]],
      ["reading-order", "Select the Touch Up Reading Order tool or return focus to its dialog", [["Ctrl", "Shift", "U"]], [["Cmd", "Shift", "U"]]],
    ]),
  },
  {
    id: "task-panes",
    title: "Task panes",
    intro: "Task-pane shortcuts depend on keyboard focus. F6 reaches the pane region before Tab and arrow keys move inside it.",
    shortcuts: rows([
      ["next-major-pane", "Move focus to the next document, task, message, or navigation pane", [["F6"]]],
      ["previous-major-pane", "Move focus to the previous document, task, message, or navigation pane", [["Shift", "F6"]]],
      ["next-task-panel", "Move focus to the next panel in the Task pane", [["Ctrl", "Tab"]], [["Option", "Tab"]]],
      ["previous-task-panel", "Move focus to the previous panel in the Task pane", [["Ctrl", "Shift", "Tab"]], [["Cmd", "Shift", "Tab"]]],
      ["next-panel-control", "Move to the next control in an open Task pane", [["Tab"]]],
      ["previous-panel-control", "Move to the previous control in an open Task pane", [["Shift", "Tab"]]],
      ["next-command", "Move to the next command button in a panel", [["Down"]]],
      ["previous-command", "Move to the previous command button in a panel", [["Up"]]],
      ["expand-panel", "Expand or collapse the focused panel", [["Space"], ["Enter"]]],
      ["toggle-task-pane", "Open or close the Task pane", [["Shift", "F4"]]],
      ["close-action-tasks", "Close the pane that lists an action's tasks", [["Ctrl", "Shift", "F4"]]],
      ["open-command-menu", "Open the focused command's menu", [["Space"], ["Enter"]]],
      ["return-parent-command", "Return focus to the parent command", [["Esc"]]],
      ["run-focused-command", "Run the focused command", [["Space"], ["Enter"]]],
      ["next-action-dialog-item", "Move to the next item in the active action or custom-tool dialog panel", [["Tab"]]],
      ["previous-action-dialog-item", "Move to the previous item in the active action or custom-tool dialog panel", [["Shift", "Tab"]]],
    ]),
  },
  {
    id: "comments",
    title: "Comments and markups",
    intro: "Single-letter comment tools use the same accelerator preference as the document tools. Tab navigation applies when comments or form fields can receive focus.",
    shortcuts: rows([
      ["add-comment", "Select the Add a comment tool", [["S"]]],
      ["stamp", "Select the Add a stamp tool", [["K"], ["J"]]],
      ["highlight", "Select the current highlighting tool", [["U"]]],
      ["cycle-text-markups", "Cycle through Highlight, Underline, and Strikethrough", [["Shift", "U"]]],
      ["drawing-markup", "Select the current drawing markup tool", [["D"]]],
      ["cycle-drawing-markups", "Cycle through drawing markup tools", [["Shift", "D"]]],
      ["cloud-tool", "Select the Cloud tool", [["Q"]]],
      ["text-comment", "Select the Add text comment tool", [["X"]]],
      ["cycle-attachments", "Cycle through Stamp, Attach file, and Sound Recorder", [["Shift", "J"]]],
      ["next-comment-field", "Move focus to the next comment or form field", [["Tab"]]],
      ["previous-comment-field", "Move focus to the previous comment or form field", [["Shift", "Tab"]]],
      ["checkmark-comment", "Add a checkmark to the selected comment", [["Shift", "K"]]],
      ["open-comment", "Open the focused comment pop-up or Comments list text field", [["Enter"]], [["Return"]]],
      ["reply-comment", "Reply to the focused comment", [["R"]]],
      ["close-comment", "Close the focused comment pop-up or text field", [["Esc"]]],
    ]),
  },
  {
    id: "pages-and-zoom",
    title: "Pages, scrolling, and zoom",
    intro: "Page keys follow the current PDF view. Arrow keys may scroll instead of changing pages when the document is not in a page-by-page layout.",
    shortcuts: rows([
      ["previous-screen", "Go to the previous screen", [["Page Up"], ["Shift", "Enter"]], [["Page Up"], ["Shift", "Return"]]],
      ["next-screen", "Go to the next screen", [["Page Down"], ["Enter"]], [["Page Down"], ["Return"]]],
      ["first-page", "Go to the first page", [["Home"], ["Ctrl", "Shift", "Page Up"], ["Ctrl", "Shift", "Up"]], [["Home"], ["Cmd", "Shift", "Up"]]],
      ["last-page", "Go to the last page", [["End"], ["Ctrl", "Shift", "Page Down"], ["Ctrl", "Shift", "Down"]], [["End"], ["Cmd", "Shift", "Down"]]],
      ["previous-page", "Go to the previous page", [["Left"], ["Ctrl", "Page Up"]], [["Left"], ["Cmd", "Page Up"]]],
      ["next-page", "Go to the next page", [["Right"], ["Ctrl", "Page Down"]], [["Right"], ["Cmd", "Page Down"]]],
      ["go-to-page", "Open Go to page", [["Ctrl", "Shift", "N"]], [["Cmd", "Shift", "N"]]],
      ["scroll-up", "Scroll up", [["Up"]]],
      ["scroll-down", "Scroll down", [["Down"]]],
      ["hand-scroll", "Scroll while the Hand tool is selected", [["Space"]]],
      ["zoom-in", "Zoom in", [["Ctrl", "="]], [["Cmd", "="]]],
      ["zoom-out", "Zoom out", [["Ctrl", "-"]], [["Cmd", "-"]]],
    ]),
  },
  {
    id: "form-authoring",
    title: "Form authoring",
    intro: "These single-letter commands apply in Acrobat's form editor and require an Acrobat plan that includes form authoring.",
    shortcuts: rows([
      ["form-preview", "Toggle between editing and previewing the form", [["P"]]],
      ["form-guides", "Toggle form guides", [["G"]]],
      ["align-fields-left", "Align selected fields left", [["L"]]],
      ["align-fields-right", "Align selected fields right", [["R"]]],
      ["align-fields-top", "Align selected fields top", [["T"]]],
      ["align-fields-bottom", "Align selected fields bottom", [["B"]]],
      ["align-fields-horizontal", "Align selected fields horizontally", [["H"]]],
      ["align-fields-vertical", "Align selected fields vertically", [["V"]]],
      ["center-fields-horizontal", "Center selected fields horizontally", [["Shift", "H"]]],
      ["center-fields-vertical", "Center selected fields vertically", [["Shift", "V"]]],
      ["highlight-fields", "Highlight form fields", [["Shift", "L"]]],
      ["show-tab-order", "Show the form tab order", [["Shift", "N"]]],
      ["document-javascripts", "Open Document JavaScripts", [["Shift", "D"]]],
    ]),
  },
  {
    id: "pdf-portfolios",
    title: "PDF portfolios",
    intro: "Portfolio commands apply while focus is in the file list or on its folder controls.",
    shortcuts: rows([
      ["portfolio-row", "Move to the previous or next portfolio file row", [["Up"], ["Down"]]],
      ["portfolio-folder-up", "Move up one folder from the portfolio file list", [["Backspace"]], [["Delete"]]],
      ["portfolio-go-back", "Activate the focused Go Back button", [["Enter"], ["Space"]]],
      ["portfolio-open", "Open the focused subfolder or attachment", [["Enter"]]],
      ["portfolio-first-last", "Move to the first or last portfolio file row", [["Home"], ["End"]]],
      ["portfolio-page", "Move through the portfolio file list one screen at a time", [["Page Down"], ["Page Up"]]],
      ["portfolio-select-all", "Select or deselect all portfolio files", [["Ctrl", "A"], ["Ctrl", "Shift", "A"]], [["Cmd", "A"], ["Cmd", "Shift", "A"]]],
      ["portfolio-extend-selection", "Extend the portfolio selection by one row", [["Shift", "Up"], ["Shift", "Down"]]],
      ["portfolio-toggle-row", "Toggle whether the focused portfolio row is selected", [["Ctrl", "Space"]], [["Cmd", "Space"]]],
      ["portfolio-focus-row", "Move portfolio row focus without changing the selection", [["Ctrl", "Up"], ["Ctrl", "Down"]], [["Cmd", "Up"], ["Cmd", "Down"]]],
    ]),
  },
  {
    id: "documents-and-search",
    title: "Documents and search",
    intro: "These bindings switch document tabs and windows, move focus into the PDF, and step through search results.",
    shortcuts: rows([
      ["top-bar", "Move focus to the toolbar or Home view", [["Shift", "F8"]]],
      ["next-document-tab", "Move to the next open document tab", [["Ctrl", "Tab"]], [["Control", "Tab"]]],
      ["previous-document-tab", "Move to the previous open document tab", [["Ctrl", "Shift", "Tab"]], [["Control", "Shift", "Tab"]]],
      ["previous-document-window", "Move to the previous open document window", [["Ctrl", "F6"]], [["Cmd", "F6"]]],
      ["next-document-window", "Move to the next open document window", [["Ctrl", "Shift", "F6"]], [["Cmd", "Shift", "F6"]]],
      ["close-document", "Close the current document", [["Ctrl", "F4"]], [["Cmd", "F4"]]],
      ["invoke-menu", "Open the focused hamburger menu", [["Space"], ["Enter"]], null],
      ["hide-other-apps", "Hide other applications", null, [["Option", "Cmd", "T"]]],
      ["close-all-documents", "Close all open documents", null, [["Cmd", "Option", "W"]]],
      ["top-bar-controls", "Move among Home, Tools, and Document controls in the top bar", [["Right"], ["Left"], ["Tab"], ["Shift", "Tab"]]],
      ["activate-top-bar-control", "Activate the highlighted top-bar control", [["Enter"], ["Space"]], [["Return"], ["Space"]]],
      ["next-document-control", "Move to the next comment, link, or form field in the document", [["Tab"]]],
      ["focus-document", "Move focus to the document pane", [["F5"]]],
      ["previous-document-control", "Move to the previous comment, link, or form field in the document", [["Shift", "Tab"]]],
      ["activate-focused-item", "Activate the focused tool, item, or command", [["Space"], ["Enter"]], [["Space"], ["Return"]]],
      ["open-context-menu", "Open the context menu for the focused item", [["Shift", "F10"]], [["Control", "Click"]], "On Windows, press Tab first to move focus to the target menu."],
      ["close-context-menu", "Close the context menu", [["F10"]], [["Esc"]]],
      ["return-hand-select", "Return to the Hand or Select tool", [["Esc"]]],
      ["next-dialog-tab", "Move to the next tab in a tabbed dialog", [["Ctrl", "Tab"]], null],
      ["find", "Find in the document", [["Ctrl", "F"]], [["Cmd", "F"]]],
      ["next-search-result", "Move to and highlight the next search result", [["F3"], ["Ctrl", "G"]], [["Cmd", "G"]]],
      ["previous-search-document", "Search the previous document in multi-file results", [["Alt", "Shift", "Left"]], [["Cmd", "Shift", "Left"]]],
      ["next-search-document", "Search the next document in multi-file results", [["Alt", "Shift", "Right"]], [["Cmd", "Shift", "Right"]]],
      ["select-text", "Extend the text selection", [["Shift", "Arrow keys"]]],
      ["select-next-word", "Select the next word or deselect the previous word", [["Ctrl", "Shift", "Right"], ["Ctrl", "Shift", "Left"]], null],
      ["adjust-slider", "Increase or decrease the focused slider value", [["Right"], ["Left"]], [["Control", "Option", "Right"], ["Control", "Option", "Left"]]],
    ]),
  },
  {
    id: "navigation-panels",
    title: "Navigation panels and bookmarks",
    intro: "Open the navigation pane first, then use these keys in file lists, To Do cards, page thumbnails, or bookmarks.",
    shortcuts: rows([
      ["open-navigation-pane", "Open the navigation pane and move focus into it", [["Ctrl", "Shift", "F5"]], [["Cmd", "Shift", "F5"]]],
      ["next-major-navigation-pane", "Move among the document, message bar, and navigation panels", [["F6"]]],
      ["previous-major-navigation-pane", "Move to the previous pane or panel", [["Shift", "F6"]]],
      ["next-navigation-element", "Move among elements in the active navigation panel", [["Tab"]]],
      ["switch-navigation-panel", "Switch to the previous or next navigation panel", [["Up/Down"]]],
      ["next-navigation-panel", "Activate the next navigation panel from anywhere in the navigation pane", [["Ctrl", "Tab"]], null],
      ["toggle-file-selection", "Select or deselect the focused file", [["Space"]]],
      ["toggle-todo-selection", "Select or deselect the focused To Do card", [["Space"]]],
      ["open-file", "Open the focused file", [["Enter"]]],
      ["open-todo", "Open the focused To Do card", [["Enter"]]],
      ["move-file-row", "Move to the previous or next file row", [["Up"], ["Down"]]],
      ["extend-file-selection", "Extend the file-row selection", [["Shift", "Up"], ["Shift", "Down"]]],
      ["move-focus-without-selection", "Move file-row focus without changing selection", [["Ctrl", "Up"], ["Ctrl", "Down"]], [["Cmd", "Up"], ["Cmd", "Down"]]],
      ["expand-bookmark", "Expand the focused bookmark", [["Right"], ["Shift", "+"]]],
      ["collapse-bookmark", "Collapse the focused bookmark", [["Left"], ["-"]]],
      ["expand-all-bookmarks", "Expand all bookmarks", [["Shift", "*"]]],
      ["collapse-selected-bookmark", "Collapse the selected bookmark", [["/"]]],
      ["next-navigation-item", "Move focus to the next item in the navigation panel", [["Down"]]],
      ["previous-navigation-item", "Move focus to the previous item in the navigation panel", [["Up"]]],
    ]),
  },
  {
    id: "accessibility",
    title: "Accessibility and Read Out Loud",
    intro: "These commands change the tagged-PDF view or control Acrobat's built-in Read Out Loud playback.",
    shortcuts: rows([
      ["edit-tag", "Edit the selected tag", [["F2"]]],
      ["reading-settings", "Change reading settings for the current document", [["Ctrl", "Shift", "5"]], [["Cmd", "Shift", "5"]]],
      ["reflow", "Toggle reflow for a tagged PDF", [["Ctrl", "4"]], [["Cmd", "4"]]],
      ["toggle-read-out-loud", "Activate or deactivate Read Out Loud", [["Ctrl", "Shift", "Y"]], [["Cmd", "Shift", "Y"]]],
      ["read-page", "Read the current page out loud", [["Ctrl", "Shift", "V"]], [["Cmd", "Shift", "V"]]],
      ["read-document", "Read the whole document out loud", [["Ctrl", "Shift", "B"]], [["Cmd", "Shift", "B"]]],
      ["pause-reading", "Pause Read Out Loud", [["Ctrl", "Shift", "C"]], [["Cmd", "Shift", "C"]]],
      ["stop-reading", "Stop Read Out Loud", [["Ctrl", "Shift", "E"]], [["Cmd", "Shift", "E"]]],
    ]),
  },
  {
    id: "form-entry",
    title: "Filling forms",
    intro: "Form-entry keys apply while a PDF form field has focus. Enter behaves differently in single-line and multiline text fields.",
    shortcuts: rows([
      ["next-form-field", "Accept typing and move to the next form field", [["Tab"]]],
      ["previous-form-field", "Accept typing and move to the previous form field", [["Shift", "Tab"]]],
      ["previous-radio", "Select the previous radio button in a group", [["Up"], ["Left"]]],
      ["next-radio", "Select the next radio button in a group", [["Down"], ["Right"]]],
      ["reject-form-entry", "Reject the entry and deselect the form field", [["Esc"]]],
      ["exit-full-screen", "Exit full-screen mode", [["Esc"]], undefined, "Adobe notes that full-screen mode can require pressing Esc twice."],
      ["accept-single-line", "Accept a single-line text entry and deselect the field", [["Enter"]], [["Return"]]],
      ["paragraph-return", "Insert a paragraph return in a multiline text field", [["Enter"]], [["Return"]]],
      ["toggle-checkbox", "Toggle the focused checkbox", [["Enter"]], [["Return"]]],
      ["finish-keypad", "Accept typing and deselect the current field", [["Numpad Enter"]]],
      ["insert-tab", "Insert a tab character into a text field", [["Ctrl", "Tab"]], [["Cmd", "Tab"]]],
    ]),
  },
];

const readerDocumentToolIds = new Set([
  "temporary-hand",
  "hand-tool",
  "select-tool",
  "marquee-zoom",
  "cycle-zoom-tools",
  "temporary-dynamic-zoom",
  "temporary-zoom-out",
  "temporary-zoom-in",
  "3d-tool",
]);

const readerTaskPaneExcludedIds = new Set([
  "close-action-tasks",
  "next-action-dialog-item",
  "previous-action-dialog-item",
]);

export const acrobatReaderGroups: ShortcutGroup[] = acrobatSharedGroups
  .filter((group) => group.id !== "form-authoring")
  .map((group) => {
    if (group.id === "document-tools") {
      return {
        ...group,
        intro: "Reader includes the viewing tool accelerators from Adobe's shared Acrobat keymap. Authoring and paid editing tools are intentionally excluded here.",
        shortcuts: group.shortcuts.filter((shortcut) => readerDocumentToolIds.has(shortcut.id)),
      };
    }

    if (group.id === "task-panes") {
      return {
        ...group,
        shortcuts: group.shortcuts.filter((shortcut) => !readerTaskPaneExcludedIds.has(shortcut.id)),
      };
    }

    return group;
  });

export const adobeAcrobatPro: AppShortcuts = {
  slug: "adobe-acrobat-pro",
  name: "Adobe Acrobat Pro",
  category: "PDF editor",
  platforms: ["windows", "macos"],
  versionContext:
    "Current Acrobat desktop defaults from Adobe's September 23, 2025 reference, checked August 31, 2026. Enable Use single-key accelerators to access tools for the one-letter tool commands. Browser-hosted PDFs may reserve some bindings before Acrobat receives them.",
  sourceUrl: "https://helpx.adobe.com/acrobat/desktop/get-started/preferences-and-settings/keyboard-shortcuts.html",
  sourceLabel: "Adobe Acrobat desktop keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: acrobatSharedGroups,
};

export default adobeAcrobatPro;
