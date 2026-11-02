import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const insomnia: AppShortcuts = {
  slug: "insomnia",
  name: "Insomnia",
  category: "API client",
  platforms: [...platforms],
  versionContext:
    "Some keys need the request editor, response panel, or sidebar to have focus. You can change any shortcut in the app.",
  sourceUrl: "https://developer.konghq.com/insomnia/keyboard-shortcuts/",
  sourceLabel: "official Insomnia keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "navigation",
      title: "Navigation",
      intro: "Open settings and shortcut help, filter the sidebar, and move between request history and panels.",
      shortcuts: [
        { id: "document-settings", action: "Open API Collection settings", keys: combo(platforms, ["Ctrl", "Shift", ","], ["Shift", "Cmd", ","]) },
        { id: "request-settings", action: "Open request settings", keys: combo(platforms, ["Ctrl", "Alt", "Shift", ","], ["Option", "Shift", "Cmd", ","]) },
        { id: "shortcut-list", action: "Show keyboard shortcuts", keys: combo(platforms, ["Ctrl", "Shift", "/"], ["Ctrl", "Shift", "Cmd", "/"]) },
        { id: "preferences", action: "Open preferences", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "quick-search", action: "Open quick search", keys: combo(platforms, ["Ctrl", "P"], ["Cmd", "P"]) },
        { id: "reload-plugins", action: "Reload plugins", keys: combo(platforms, ["Ctrl", "Shift", "R"], ["Shift", "Cmd", "R"]) },
        { id: "autocomplete", action: "Show autocomplete", keys: combo(platforms, ["Ctrl", "Space"]) },
        { id: "history", action: "Open request history", keys: combo(platforms, ["Ctrl", "Shift", "H"], ["Shift", "Cmd", "H"]) },
        { id: "sidebar-filter", action: "Filter the sidebar", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Shift", "Cmd", "F"]) },
        { id: "toggle-sidebar", action: "Show or hide the sidebar", keys: combo(platforms, ["Ctrl", "\\"], ["Cmd", "\\"]) },
        { id: "toggle-response", action: "Focus the response panel", keys: combo(platforms, ["Ctrl", "'"] , ["Cmd", "'"]) },
      ],
    },
    {
      id: "request-workflow",
      title: "Request workflow",
      intro: "Edit the method and URL, choose an environment, and send a request from the request editor.",
      shortcuts: [
        { id: "send", action: "Send the request", keys: [{ platform: "windows", keys: ["Ctrl", "Enter"], alternatives: [["F5"]] }, { platform: "macos", keys: ["Cmd", "Enter"], alternatives: [["Cmd", "R"], ["F5"]] }] },
        { id: "send-options", action: "Send the request with options", keys: combo(platforms, ["Ctrl", "Shift", "Enter"], ["Shift", "Cmd", "Enter"]) },
        { id: "environment-editor", action: "Open the environment editor", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "switch-environment", action: "Switch environment", keys: combo(platforms, ["Ctrl", "Shift", "E"], ["Shift", "Cmd", "E"]) },
        { id: "variable-source", action: "Show a variable's source and value", keys: combo(platforms, ["Alt", "Shift", "U"], ["Option", "Shift", "U"]) },
        { id: "method", action: "Focus the request method", keys: combo(platforms, ["Ctrl", "Shift", "L"], ["Shift", "Cmd", "L"]) },
        { id: "url", action: "Focus the request URL", keys: combo(platforms, ["Ctrl", "L"], ["Cmd", "L"]) },
        { id: "code-generation", action: "Open code generation", keys: combo(platforms, ["Ctrl", "Shift", "G"], ["Shift", "Cmd", "G"]) },
        { id: "beautify", action: "Beautify the active code editor", keys: combo(platforms, ["Ctrl", "Shift", "F"], ["Shift", "Cmd", "F"]) },
        { id: "cookies", action: "Edit cookies", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
      ],
    },
    {
      id: "workspace-management",
      title: "Workspace management",
      intro: "Create, duplicate, pin, and remove requests or folders while organizing an Insomnia workspace.",
      shortcuts: [
        { id: "new-request", action: "Create a new request", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]), note: "Control+Alt+N on Windows and Option+Command+N on macOS also work." },
        { id: "duplicate-request", action: "Duplicate the current request", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "delete-request", action: "Delete the current request", keys: combo(platforms, ["Ctrl", "Shift", "Backspace"], ["Shift", "Cmd", "Backspace"]) },
        { id: "new-folder", action: "Create a folder", keys: combo(platforms, ["Ctrl", "Shift", "N"], ["Shift", "Cmd", "N"]) },
        { id: "pin-request", action: "Pin or unpin the current request", keys: combo(platforms, ["Ctrl", "Shift", "P"], ["Shift", "Cmd", "P"]) },
        { id: "close-tab", action: "Close the current tab", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
      ],
    },
  ],
};

export default insomnia;
