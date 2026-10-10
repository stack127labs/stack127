import type { AppShortcuts, Shortcut, ShortcutKey } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const bind = (platform: (typeof platforms)[number], keys: string[]): ShortcutKey => ({ platform, keys });

const pair = (id: string, action: string, windowsLinux: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [bind("windows", windowsLinux), bind("linux", windowsLinux), bind("macos", macos)],
  ...(note ? { note } : {}),
});

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => bind(platform, keys)),
  ...(note ? { note } : {}),
});

export const eclipse: AppShortcuts = {
  slug: "eclipse",
  name: "Eclipse IDE",
  category: "Developer tools",
  platforms: [...platforms],
  versionContext:
    "Eclipse IDE 2026-06 (4.40) documentation and the current Eclipse IDE keybindings card checked September 1, 2026. The entries describe the Default scheme where the documentation provides a default and retain Eclipse's platform-specific Command mappings.",
  sourceUrl: "https://help.eclipse.org/latest/topic/org.eclipse.platform.doc.user/concepts/concepts-keys.htm",
  sourceLabel: "Eclipse Platform keys and keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "general",
      title: "General and navigation",
      intro: "Quick access, search, type lookup, and editor navigation keep common workbench actions close to the keyboard.",
      shortcuts: [
        pair("quick-access", "Open Quick Access", ["Ctrl", "3"], ["Cmd", "3"]),
        pair("find-replace", "Find or replace in the current file", ["Ctrl", "F"], ["Cmd", "F"]),
        pair("workspace-search", "Find or replace in the project or workspace", ["Ctrl", "H"], ["Cmd", "H"]),
        pair("show-views", "Show available views", ["Alt", "Shift", "Q", "then", "Q"], ["Option", "Cmd", "Q", "then", "Q"]),
        shared("javadoc", "Show Javadoc for the selected element", ["F2"]),
        shared("declaration", "Open the declaration of the selected symbol", ["F3"]),
        shared("type-hierarchy", "Open the Type Hierarchy view", ["F4"]),
        pair("open-resource", "Open a resource", ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]),
        pair("open-type", "Open a type", ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]),
        pair("call-hierarchy", "Open the Call Hierarchy view", ["Ctrl", "Alt", "H"], ["Cmd", "Option", "H"]),
        pair("references", "Search for references to the selected symbol", ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]),
        pair("go-to-line", "Go to a line", ["Ctrl", "L"], ["Cmd", "L"]),
        pair("next-problem", "Go to the next problem", ["Ctrl", "."], ["Cmd", "."]),
        pair("previous-problem", "Go to the previous problem", ["Ctrl", ","], ["Cmd", "Shift", "."]),
      ],
    },
    {
      id: "editing",
      title: "Editing",
      intro: "These editor commands change lines, complete code, rename symbols, and open the editing and refactoring actions.",
      shortcuts: [
        pair("delete-line", "Delete the line at the cursor", ["Ctrl", "D"], ["Cmd", "D"]),
        pair("move-line-up", "Move the current line up", ["Alt", "Up"], ["Option", "Up"]),
        pair("move-line-down", "Move the current line down", ["Alt", "Down"], ["Option", "Down"]),
        pair("zoom-in", "Zoom in the text editor", ["Ctrl", "+"], ["Cmd", "+"]),
        pair("zoom-out", "Zoom out the text editor", ["Ctrl", "-"], ["Cmd", "-"]),
        pair("content-assist", "Open Content Assist", ["Ctrl", "Space"], ["Cmd", "Space"]),
        pair("rename", "Rename the selected element", ["Alt", "Shift", "R"], ["Cmd", "Option", "R"]),
        pair("advanced-editing", "Show advanced editing operations", ["Alt", "Shift", "S"], ["Cmd", "Option", "S"]),
        pair("refactor", "Show refactoring operations", ["Alt", "Shift", "T"], ["Cmd", "Option", "T"]),
        pair("quick-fix", "Show possible fixes for a problem", ["Ctrl", "1"], ["Cmd", "1"]),
      ],
    },
    {
      id: "build-run-debug",
      title: "Build, run, and debug",
      intro: "Build the workspace, launch the last application, and step through a debug session with these defaults.",
      shortcuts: [
        pair("build", "Build all workspace projects", ["Ctrl", "B"], ["Cmd", "B"]),
        pair("run", "Run the last launched application", ["Ctrl", "F11"], ["Cmd", "F11"]),
        shared("debug", "Debug the last launched application", ["F11"]),
        shared("step-into", "Step into", ["F5"]),
        shared("step-over", "Step over", ["F6"]),
        shared("step-return", "Step return", ["F7"]),
        shared("resume", "Resume execution", ["F8"]),
        pair("inspect", "Inspect the selected expression", ["Ctrl", "Shift", "I"], ["Cmd", "Shift", "I"]),
      ],
    },
    {
      id: "workbench",
      title: "Workbench navigation",
      intro: "Cycle through editors, views, and perspectives, then open the binding list or change the active workbench state.",
      shortcuts: [
        pair("key-assist", "Show all currently available key bindings", ["Ctrl", "Shift", "L"], ["Cmd", "Shift", "L"]),
        pair("editor-list", "Open the editor drop-down list", ["Ctrl", "E"], ["Cmd", "E"]),
        pair("cycle-editor", "Cycle to the next editor", ["Ctrl", "F6"], ["Cmd", "F6"]),
        pair("cycle-view", "Cycle to the next view", ["Ctrl", "F7"], ["Cmd", "F7"]),
        pair("cycle-perspective", "Cycle to the next perspective", ["Ctrl", "F8"], ["Cmd", "F8"]),
        pair("full-screen", "Toggle full-screen mode", ["Alt", "F11"], ["Ctrl", "Cmd", "F"]),
        pair("open-editor", "Activate the editor", ["F12"], ["Cmd", "F12"]),
        pair("context-menu", "Open the context menu", ["Shift", "F10"], ["Shift", "F10"]),
      ],
    },
    {
      id: "files",
      title: "Files and projects",
      intro: "Use the file and project bindings to create, open, save, print, refresh, and inspect workspace resources.",
      shortcuts: [
        shared("rename-file", "Rename the selected resource", ["F2"]),
        shared("refresh", "Refresh selected resources", ["F5"]),
        pair("save", "Save the current file", ["Ctrl", "S"], ["Cmd", "S"]),
        pair("save-all", "Save all open files", ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]),
        pair("close-editor", "Close the active editor", ["Ctrl", "F4"], ["Cmd", "W"]),
        pair("new-wizard", "Open the New item wizard", ["Ctrl", "N"], ["Cmd", "N"]),
        pair("open-file", "Open a file", ["Ctrl", "O"], ["Ctrl", "O"]),
        pair("print", "Print", ["Ctrl", "P"], ["Cmd", "P"]),
        pair("properties", "Open resource properties", ["Alt", "Enter"], ["Cmd", "I"]),
      ],
    },
  ],
};

export default eclipse;
