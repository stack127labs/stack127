import type { AppShortcuts } from "../types.ts";

const platforms = ["macos"] as const;
const mac = (keys: string[]) => [{ platform: "macos" as const, keys }];

export const things3: AppShortcuts = {
  slug: "things-3",
  name: "Things 3",
  category: "Task management",
  platforms: [...platforms],
  intro:
    "Things 3's official Mac shortcut reference covers task creation, scheduling, navigation, Markdown styling, search, and list organization. iPad and iPhone shortcuts are outside this Mac record.",
  versionContext:
    "Things 3 Mac shortcuts checked September 1, 2026 against the official support article and shortcut PDF. Things lets users use a global quick-entry hotkey in addition to these in-app defaults.",
  sourceUrl: "https://culturedcode.com/things/support/articles/2785159/",
  sourceLabel: "official Things 3 Mac keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "create-and-edit",
      title: "Create and edit tasks",
      intro: "Task creation and editing shortcuts add to-dos, projects, notes, repeating tasks, and the common completion or cancellation states.",
      shortcuts: [
        { id: "new-todo", action: "Create a new to-do", keys: mac(["Cmd", "N"]) },
        { id: "new-repeating", action: "Create a repeating to-do", keys: mac(["Option", "Cmd", "N"]) },
        { id: "new-project", action: "Create a new project", keys: mac(["Shift", "Cmd", "N"]) },
        { id: "new-below", action: "Create a new to-do below the current item", keys: mac(["Space"]) },
        { id: "edit", action: "Open an item for editing", keys: mac(["Return"]) },
        { id: "commit-note", action: "Commit a note edit", keys: mac(["Option", "Return"]) },
        { id: "complete", action: "Complete the current item", keys: mac(["Cmd", "."]) },
        { id: "cancel", action: "Cancel the current item", keys: mac(["Option", "Delete"]) },
        { id: "log", action: "Log the current item", keys: mac(["Cmd", "L"]) },
        { id: "file", action: "File the current item", keys: mac(["Shift", "Cmd", "F"]) },
        { id: "today", action: "Set the item to Today", keys: mac(["Cmd", "T"]) },
        { id: "someday", action: "Set the item to Someday", keys: mac(["Cmd", "Y"]) },
        { id: "reschedule", action: "Reschedule the item", keys: mac(["Cmd", "R"]) },
        { id: "repeat", action: "Set a repeating schedule", keys: mac(["Option", "Cmd", "R"]) },
      ],
    },
    {
      id: "navigation",
      title: "Navigation and search",
      intro: "Navigation shortcuts open lists, move through the sidebar, search tasks, and advance through matching results or project items.",
      shortcuts: [
        { id: "inbox", action: "Open Inbox", keys: mac(["Cmd", "0"]) },
        { id: "today-list", action: "Open Today", keys: mac(["Cmd", "1"]) },
        { id: "next-list", action: "Open Next", keys: mac(["Cmd", "2"]) },
        { id: "scheduled", action: "Open Scheduled", keys: mac(["Cmd", "3"]) },
        { id: "someday-list", action: "Open Someday", keys: mac(["Cmd", "4"]) },
        { id: "projects", action: "Open Projects", keys: mac(["Cmd", "5"]) },
        { id: "logbook", action: "Open Logbook", keys: mac(["Cmd", "6"]) },
        { id: "search", action: "Search", keys: mac(["Cmd", "F"]) },
        { id: "find-text", action: "Find text", keys: mac(["Shift", "Cmd", "F"]) },
        { id: "next-result", action: "Go to the next search result", keys: mac(["Cmd", "G"]) },
        { id: "previous-result", action: "Go to the previous search result", keys: mac(["Shift", "Cmd", "G"]) },
        { id: "navigation-popover", action: "Open the navigation popover", keys: mac(["Shift", "Cmd", "O"]) },
        { id: "sidebar", action: "Show or hide the sidebar", keys: mac(["Cmd", "/"]) },
      ],
    },
    {
      id: "formatting",
      title: "Markdown and formatting",
      intro: "Markdown and formatting shortcuts style task notes, create lists, insert links or code, and change list indentation.",
      shortcuts: [
        { id: "italic", action: "Italicize text", keys: mac(["Cmd", "I"]) },
        { id: "bold", action: "Bold text", keys: mac(["Cmd", "B"]) },
        { id: "bullets", action: "Create a bulleted list", keys: mac(["Shift", "Cmd", "L"]) },
        { id: "numbered", action: "Create a numbered list", keys: mac(["Option", "Cmd", "L"]) },
        { id: "checklist", action: "Create a checklist", keys: mac(["Ctrl", "Cmd", "L"]) },
        { id: "complete-checklist", action: "Complete a checklist item", keys: mac(["Cmd", "K"]) },
        { id: "cancel-checklist", action: "Cancel a checklist item", keys: mac(["Option", "Cmd", "K"]) },
        { id: "quote", action: "Create a quote", keys: mac(["Cmd", "'"]) },
        { id: "highlight", action: "Highlight text", keys: mac(["Shift", "Cmd", "U"]) },
        { id: "link", action: "Add a link", keys: mac(["Shift", "Cmd", "K"]) },
        { id: "strikethrough", action: "Strikethrough text", keys: mac(["Option", "Cmd", "U"]) },
        { id: "code", action: "Format as code", keys: mac(["Shift", "Cmd", "J"]) },
        { id: "indent", action: "Indent a list item", keys: mac(["Cmd", "]"]) },
        { id: "outdent", action: "Outdent a list item", keys: mac(["Cmd", "["]) },
      ],
    },
  ],
};

export default things3;
