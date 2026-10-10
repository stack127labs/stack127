import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const godotEngine: AppShortcuts = {
  slug: "godot-engine",
  name: "Godot Engine",
  category: "Game engine",
  platforms: [...platforms],
  versionContext:
    "The Godot 4.6 manual documents separate macOS workspace commands and shared editor commands for Windows, Linux, and macOS. All shortcuts can be changed in Editor Settings > Shortcuts, and some canvas keys depend on the active tool.",
  sourceUrl: "https://docs.godotengine.org/en/4.6/tutorials/editor/default_key_mapping.html",
  sourceLabel: "official Godot default key mapping",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "editor-and-workspaces",
      title: "Editor and workspaces",
      intro: "Open help, switch editor workspaces, filter scenes, and change the editor view while building a project.",
      shortcuts: [
        {
          id: "help",
          action: "Open the documentation search",
          keys: perPlatform(platforms, {
            windows: ["F1"],
            linux: ["F1"],
            macos: ["Option", "Space"],
          }),
        },
        {
          id: "workspace-2d",
          action: "Switch to the 2D workspace",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "F1"],
            linux: ["Ctrl", "F1"],
            macos: ["Cmd", "Ctrl", "1"],
          }),
        },
        {
          id: "workspace-3d",
          action: "Switch to the 3D workspace",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "F2"],
            linux: ["Ctrl", "F2"],
            macos: ["Cmd", "Ctrl", "2"],
          }),
        },
        {
          id: "workspace-script",
          action: "Switch to the Script workspace",
          keys: perPlatform(platforms, {
            windows: ["Ctrl", "F3"],
            linux: ["Ctrl", "F3"],
            macos: ["Cmd", "Ctrl", "3"],
          }),
        },
        { id: "distraction-free", action: "Toggle distraction-free mode", keys: perPlatform(platforms, { windows: ["Ctrl", "Shift", "F11"], linux: ["Ctrl", "Shift", "F11"], macos: ["Cmd", "Ctrl", "D"] }) },
        { id: "next-scene-tab", action: "Select the next scene tab", keys: combo(platforms, ["Ctrl", "Tab"]) },
        { id: "previous-scene-tab", action: "Select the previous scene tab", keys: combo(platforms, ["Ctrl", "Shift", "Tab"]) },
        { id: "open-scene", action: "Open a scene", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "close-scene", action: "Close the current scene", keys: combo(platforms, ["Ctrl", "Shift", "W"], ["Cmd", "Shift", "W"]) },
        { id: "reopen-scene", action: "Reopen the last closed scene", keys: combo(platforms, ["Ctrl", "Shift", "T"], ["Cmd", "Shift", "T"]) },
        { id: "save-scene", action: "Save the current scene", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "filter-files", action: "Filter files", keys: combo(platforms, ["Ctrl", "Alt", "P"], ["Option", "Cmd", "P"]) },
        { id: "bottom-panel", action: "Toggle the bottom panel", keys: combo(platforms, ["Ctrl", "J"]) },
        { id: "output-panel", action: "Open the Output panel", keys: combo(platforms, ["Ctrl", "J", "then", "O"]) },
      ],
    },
    {
      id: "running-and-scenes",
      title: "Running and scenes",
      intro: "Run the project or current scene, stop execution, and make quick scene-tree changes during development.",
      shortcuts: [
        { id: "run-project", action: "Run the project", keys: combo(platforms, ["F5"]) },
        { id: "run-current-scene", action: "Run the current scene", keys: combo(platforms, ["F6"]) },
        { id: "stop-project", action: "Stop the running project", keys: combo(platforms, ["F8"]) },
        { id: "add-node", action: "Add a node", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "duplicate-node", action: "Duplicate the selected node", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "move-node-up", action: "Move the selected node up", keys: combo(platforms, ["Ctrl", "Up"], ["Cmd", "Up"]) },
        { id: "move-node-down", action: "Move the selected node down", keys: combo(platforms, ["Ctrl", "Down"], ["Cmd", "Down"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
      ],
    },
    {
      id: "two-d-canvas",
      title: "2D canvas",
      intro: "Pan, zoom, select, transform, and snap objects while the 2D editor has focus.",
      shortcuts: [
        { id: "pan-canvas", action: "Pan the canvas", keys: combo(platforms, ["Space"]) },
        { id: "zoom-in", action: "Zoom in", keys: combo(platforms, ["Ctrl", "="], ["Cmd", "="]) },
        { id: "zoom-out", action: "Zoom out", keys: combo(platforms, ["Ctrl", "-"], ["Cmd", "-"]) },
        { id: "reset-zoom", action: "Reset the canvas zoom", keys: combo(platforms, ["Ctrl", "0"], ["Cmd", "0"]) },
        { id: "select-tool", action: "Select the selection tool", keys: combo(platforms, ["Q"]) },
        { id: "move-tool", action: "Select the move tool", keys: combo(platforms, ["W"]) },
        { id: "rotate-tool", action: "Select the rotate tool", keys: combo(platforms, ["E"]) },
        { id: "scale-tool", action: "Select the scale tool", keys: combo(platforms, ["S"]) },
        { id: "ruler", action: "Select the ruler tool", keys: combo(platforms, ["R"]) },
        { id: "smart-snap", action: "Toggle smart snap", keys: combo(platforms, ["Shift", "S"]) },
        { id: "grid-snap", action: "Toggle grid snap", keys: combo(platforms, ["Shift", "G"]) },
      ],
    },
  ],
};

export default godotEngine;
