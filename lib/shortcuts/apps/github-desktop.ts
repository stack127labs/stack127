import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const githubDesktop: AppShortcuts = {
  slug: "github-desktop",
  name: "GitHub Desktop",
  category: "Git client",
  platforms: [...platforms],
  intro:
    "GitHub Desktop's shortcuts cover repository setup, branch work, commit flow, and the views that developers use while reviewing changes. Mac and Windows bindings come directly from GitHub's current desktop reference.",
  versionContext:
    "GitHub publishes separate macOS and Windows tables. This record covers the desktop application, not browser shortcuts or terminal commands. Windows uses Control where macOS uses Command, with the platform-specific full-screen and developer-tool commands preserved.",
  sourceUrl: "https://docs.github.com/en/desktop/overview/github-desktop-keyboard-shortcuts",
  sourceLabel: "official GitHub Desktop keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "application",
      title: "Application",
      intro: "Open settings, change the window view, and reach the built-in development tools in GitHub Desktop.",
      shortcuts: [
        { id: "settings", action: "Open settings or options", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "fullscreen", action: "Toggle fullscreen", keys: combo(platforms, ["F11"], ["Ctrl", "Cmd", "F"]) },
        { id: "reset-zoom", action: "Reset zoom", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
        { id: "zoom-in", action: "Zoom in", keys: combo(platforms, ["Ctrl", "="], ["Cmd", "="]) },
        { id: "zoom-out", action: "Zoom out", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "developer-tools", action: "Open developer tools", keys: combo(platforms, ["Ctrl", "Shift", "I"], ["Option", "Cmd", "I"]) },
        { id: "context-menu", action: "Open the context menu", keys: combo(platforms, ["Shift", "F10"]) },
      ],
    },
    {
      id: "repositories",
      title: "Repositories",
      intro: "Add and switch repositories, clone from GitHub, and open the project in its related tools.",
      shortcuts: [
        { id: "add-repository", action: "Add a new repository", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "open-local-repository", action: "Add an existing local repository", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "clone-repository", action: "Clone a repository", keys: combo(platforms, ["Ctrl", "Shift", "O"], ["Cmd", "Shift", "O"]) },
        { id: "repository-list", action: "Open the repository list", keys: combo(platforms, ["Ctrl", "T"], ["Cmd", "T"]) },
        { id: "push", action: "Push to the remote", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "pull", action: "Pull from the remote", keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Cmd", "Shift", "P"]) },
        { id: "remove-repository", action: "Remove the current repository", keys: combo(platforms, ["Delete"], ["Cmd", "Delete"]) },
        { id: "open-github", action: "Open the repository on GitHub", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Cmd", "Shift", "G"]) },
        { id: "open-terminal", action: "Open the repository in a terminal", keys: combo(platforms, ["`"]) },
        { id: "open-finder", action: "Open the repository in the file manager", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Cmd", "Shift", "F"]) },
        { id: "open-editor", action: "Open the repository in an editor", keys: combo(platforms, ["Ctrl", "Shift", "A"], ["Cmd", "Shift", "A"]) },
        { id: "open-issue", action: "Open the selected issue", keys: combo(platforms, ["Ctrl", "I"], ["Cmd", "I"]) },
      ],
    },
    {
      id: "branches-and-commits",
      title: "Branches and commits",
      intro: "Move between changed files and history, create branches, and commit the work that is staged in the current repository.",
      shortcuts: [
        { id: "changes-view", action: "Open the Changes view", keys: combo(platforms, ["Ctrl", "1"], ["Cmd", "1"]) },
        { id: "history-view", action: "Open the History view", keys: combo(platforms, ["Ctrl", "2"], ["Cmd", "2"]) },
        { id: "branches", action: "Open the branch menu", keys: combo(platforms, ["Ctrl", "B"], ["Cmd", "B"]) },
        { id: "commit-summary", action: "Focus the commit summary", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "commit", action: "Commit staged changes", keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]) },
        { id: "select-file", action: "Select the highlighted file", keys: combo(platforms, ["Space"]) },
        { id: "new-branch", action: "Create a new branch", keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Cmd", "Shift", "N"]) },
        { id: "rename-branch", action: "Rename the current branch", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Cmd", "Shift", "R"]) },
        { id: "delete-branch", action: "Delete the current branch", keys: combo(platforms, ["Ctrl", "Shift", "D"], ["Cmd", "Shift", "D"]) },
        { id: "update-default-branch", action: "Update the default branch", keys: combo(platforms, ["Ctrl", "Shift", "U"], ["Cmd", "Shift", "U"]) },
        { id: "compare-branches", action: "Compare branches", keys: combo(platforms, ["Ctrl", "Shift", "B"], ["Cmd", "Shift", "B"]) },
        { id: "merge-branch", action: "Merge a branch", keys: combo(platforms, ["Ctrl", "Shift", "M"], ["Cmd", "Shift", "M"]) },
        { id: "stash", action: "Stash changes", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "stashed-changes", action: "Open stashed changes", keys: combo(platforms, ["Ctrl", "H"], ["Ctrl", "H"]) },
        { id: "compare-commits", action: "Compare commits", keys: combo(platforms, ["Ctrl", "Shift", "C"], ["Cmd", "Shift", "C"]) },
        { id: "pull-request", action: "Create or open a pull request", keys: combo(platforms, ["Ctrl", "R"], ["Cmd", "R"]) },
      ],
    },
  ],
};

export default githubDesktop;
