import type { AppShortcuts, Shortcut } from "../types.ts";

type Row = [id: string, action: string, windows: string[], macos?: string[], note?: string];
const rows = (items: Row[]): Shortcut[] =>
  items.map(([id, action, windows, macos = windows, note]) => ({
    id,
    action,
    keys: [
      { platform: "windows", keys: windows },
      { platform: "macos", keys: macos },
    ],
    ...(note ? { note } : {}),
  }));

export const airtable: AppShortcuts = {
  slug: "airtable",
  name: "Airtable",
  category: "Collaborative database",
  platforms: ["windows", "macos"],
  intro:
    "Airtable's documented shortcuts cover base navigation, view controls, cell editing, record movement, and the Gallery, Kanban, Gantt, and expanded-record surfaces. The reference keeps context-specific commands with the view where Airtable says they work.",
  versionContext:
    "Airtable web keyboard shortcuts from the current official support article checked August 31, 2026. At that check, the article displayed a relative 'Last updated 23 days ago' label rather than a stable revision date. Airtable publishes separate Mac and Windows tables. Browser and operating-system shortcuts, screenshots, and modifier-plus-pointer gestures are omitted. No Linux keymap is documented on the source page.",
  sourceUrl: "https://support.airtable.com/articles/7980233311-airtable-keyboard-shortcuts",
  sourceLabel: "Airtable keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: [
    {
      id: "general",
      title: "Bases, views, and general actions",
      intro:
        "Undo changes, move between bases, tables, and views, open view configuration menus, search the current view, and set a date field to the current time.",
      shortcuts: [
        ...rows([
          ["shortcut-list", "Open Airtable's complete shortcut list", ["Ctrl", "/"], ["Cmd", "/"]],
          ["undo", "Undo the last action", ["Ctrl", "Z"], ["Cmd", "Z"]],
          ["print", "Print the current table view or expanded record", ["Ctrl", "P"], ["Cmd", "P"]],
          ["table-switcher", "Open the table switcher in the current base", ["Ctrl", "J"], ["Cmd", "J"]],
          ["base-switcher", "Open the quick base switcher", ["Ctrl", "K"], ["Cmd", "K"]],
          ["view-switcher", "Open the view switcher in the current base", ["Ctrl", "Shift", "K"], ["Cmd", "Shift", "K"]],
          ["filter", "Open the filter menu in the current view", ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"], "Press Enter in the menu to create a new filter."],
          ["group", "Open the grouped-records menu in the current view", ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"], "Press Enter in the menu to collapse or expand all groups."],
          ["sort", "Open the sort menu in the current view", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"], "Press Enter in the menu to reapply the most recent sort."],
          ["now", "Set the selected date or date-time field to now", ["Ctrl", ";"], ["Cmd", ";"]],
          ["previous-control", "Move backward between similar interface elements", ["Shift", "Tab"]],
          ["next-control", "Move forward between similar interface elements", ["Tab"]],
          ["interface-search", "Activate the interface query-container search", ["Alt", "/"], ["Option", "/"]],
        ]),
        {
          id: "find",
          action: "Open the find bar",
          keys: [
            { platform: "windows", keys: ["Ctrl", "F"], alternatives: [["Ctrl", "G"]] },
            { platform: "macos", keys: ["Cmd", "F"], alternatives: [["Cmd", "G"]] },
          ],
          note: "In a base grid, this opens Airtable's find-in-view search rather than the browser find tool.",
        },
        {
          id: "redo",
          action: "Redo the last undone action",
          keys: [
            { platform: "windows", keys: ["Ctrl", "Y"], alternatives: [["Ctrl", "Shift", "Z"]] },
            { platform: "macos", keys: ["Cmd", "Y"], alternatives: [["Cmd", "Shift", "Z"]] },
          ],
        },
      ],
    },
    {
      id: "grid-editing",
      title: "Grid selection and editing",
      intro:
        "Copy and edit cells, expand a cell or record, select cell ranges, insert records, and move records in Grid view.",
      shortcuts: [
        ...rows([
          ["copy", "Copy a cell or selected cell range", ["Ctrl", "C"], ["Cmd", "C"]],
          ["cut", "Cut a cell or selected cell range", ["Ctrl", "X"], ["Cmd", "X"]],
          ["paste", "Paste into a cell or selected cell range", ["Ctrl", "V"], ["Cmd", "V"]],
          ["select-occurrences", "Select all occurrences of a variable or text", ["Ctrl", "D"], ["Cmd", "D"]],
          ["expand-record", "Expand the active record", ["Space"]],
          ["expand-cell", "Expand the active cell", ["Shift", "Space"]],
          ["screen-up", "Scroll one screen up", ["Fn", "Up"]],
          ["screen-down", "Scroll one screen down", ["Fn", "Down"]],
          ["table-left", "Jump to the left edge of the table", ["Ctrl", "Left"], ["Cmd", "Left"]],
          ["table-right", "Jump to the right edge of the table", ["Ctrl", "Right"], ["Cmd", "Right"]],
          ["table-top", "Jump to the top edge of the table or current group", ["Ctrl", "Up"], ["Cmd", "Up"]],
          ["table-bottom", "Jump to the bottom edge of the table or current group", ["Ctrl", "Down"], ["Cmd", "Down"]],
          ["select-table-left", "Select cells through the left edge of the table", ["Ctrl", "Shift", "Left"], ["Cmd", "Shift", "Left"]],
          ["select-table-right", "Select cells through the right edge of the table", ["Ctrl", "Shift", "Right"], ["Cmd", "Shift", "Right"]],
          ["select-table-top", "Select cells through the top edge of the table", ["Ctrl", "Shift", "Up"], ["Cmd", "Shift", "Up"]],
          ["select-table-bottom", "Select cells through the bottom edge of the table", ["Ctrl", "Shift", "Down"], ["Cmd", "Shift", "Down"]],
          ["select-left", "Extend the cell selection left", ["Shift", "Left"]],
          ["select-right", "Extend the cell selection right", ["Shift", "Right"]],
          ["select-up", "Extend the cell selection up", ["Shift", "Up"]],
          ["select-down", "Extend the cell selection down", ["Shift", "Down"]],
          ["insert-below", "Insert a record below the selected cell", ["Shift", "Enter"]],
          ["insert-end", "Insert a record at the end of an unsorted, ungrouped grid", ["Ctrl", "Shift", "Enter"], ["Cmd", "Shift", "Enter"]],
          ["move-record-up", "Move a record up manually", ["Alt", "Up"], ["Option", "Up"]],
          ["move-record-down", "Move a record down manually", ["Alt", "Down"], ["Option", "Down"]],
        ]),
        {
          id: "scroll-horizontal-left",
          action: "Scroll one screen left",
          keys: [
            { platform: "windows", keys: ["Alt", "Page Up"], alternatives: [["Alt", "Fn", "Up"]] },
            { platform: "macos", keys: ["Option", "Page Up"], alternatives: [["Option", "Fn", "Up"]] },
          ],
        },
        {
          id: "scroll-horizontal-right",
          action: "Scroll one screen right",
          keys: [
            { platform: "windows", keys: ["Alt", "Page Down"], alternatives: [["Alt", "Fn", "Down"]] },
            { platform: "macos", keys: ["Option", "Page Down"], alternatives: [["Option", "Fn", "Down"]] },
          ],
        },
        {
          id: "edit-cell",
          action: "Edit the selected cell",
          keys: [
            { platform: "windows", keys: ["Enter"], alternatives: [["F2"]] },
            { platform: "macos", keys: ["Enter"], alternatives: [["F2"]] },
          ],
        },
      ],
    },
    {
      id: "other-views",
      title: "Gallery, Kanban, and Gantt views",
      intro:
        "Move to Gallery and Kanban edges, scroll between Kanban stacks, and delete or create records in Gantt view.",
      shortcuts: rows([
        ["gallery-top", "Scroll to the top edge of Gallery view", ["Ctrl", "Up"], ["Cmd", "Up"]],
        ["gallery-bottom", "Scroll to the bottom edge of Gallery view", ["Ctrl", "Down"], ["Cmd", "Down"]],
        ["kanban-left", "Scroll Kanban left by one stack", ["Left"]],
        ["kanban-right", "Scroll Kanban right by one stack", ["Right"]],
        ["kanban-left-edge", "Scroll Kanban to the left edge", ["Ctrl", "Left"], ["Cmd", "Left"]],
        ["kanban-right-edge", "Scroll Kanban to the right edge", ["Ctrl", "Right"], ["Cmd", "Right"]],
        ["kanban-top", "Scroll all Kanban stacks to the top", ["Ctrl", "Up"], ["Cmd", "Up"]],
        ["kanban-bottom", "Scroll all Kanban stacks to the bottom", ["Ctrl", "Down"], ["Cmd", "Down"]],
        ["gantt-delete", "Delete selected Gantt records", ["Ctrl", "Delete"], ["Cmd", "Delete"]],
        ["gantt-create", "Create a record in the Gantt create-record flow", ["Enter"]],
      ]),
    },
    {
      id: "expanded-records",
      title: "Expanded records",
      intro:
        "Move directly between neighboring records while one record is expanded, then close the expanded-record overlay and return to the view.",
      shortcuts: rows([
        ["previous-record", "Move to the previous expanded record", ["Ctrl", "Shift", ","], ["Cmd", "Shift", ","]],
        ["next-record", "Move to the next expanded record", ["Ctrl", "Shift", "."], ["Cmd", "Shift", "."]],
        ["close-record", "Close the expanded record", ["Esc"]],
      ]),
    },
  ],
};

export default airtable;
