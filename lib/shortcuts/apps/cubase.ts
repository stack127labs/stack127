import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const cubase: AppShortcuts = {
  slug: "cubase",
  name: "Steinberg Cubase",
  category: "Music production",
  platforms: [...platforms],
  intro:
    "Cubase Pro's current default key command reference covers project files, editing, transport, windows, and media. The platform-neutral commands are paired with the documented Windows and macOS modifier conventions.",
  versionContext:
    "Cubase Pro 15.0 key commands checked September 1, 2026. Steinberg documents Windows and macOS defaults and allows users to customize or reset the key command preset.",
  sourceUrl: "https://www.steinberg.help/r/cubase-pro/15.0/en/cubase_nuendo/topics/key_commands/key_commands_default_c.html",
  sourceLabel: "official Cubase Pro 15.0 default key commands",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "files-and-editing",
      title: "Files and editing",
      intro: "File and editing commands create, open, save, and close projects while applying the most common clip and selection operations.",
      shortcuts: [
        { id: "new", action: "Create a new project", keys: combo(platforms, ["Ctrl", "N"], ["Cmd", "N"]) },
        { id: "open", action: "Open a project", keys: combo(platforms, ["Ctrl", "O"], ["Cmd", "O"]) },
        { id: "close", action: "Close the project", keys: combo(platforms, ["Ctrl", "W"], ["Cmd", "W"]) },
        { id: "quit", action: "Quit Cubase", keys: combo(platforms, ["Ctrl", "Q"], ["Cmd", "Q"]) },
        { id: "save", action: "Save the project", keys: combo(platforms, ["Ctrl", "S"], ["Cmd", "S"]) },
        { id: "save-as", action: "Save As", keys: combo(platforms, ["Ctrl", "Shift", "S"], ["Cmd", "Shift", "S"]) },
        { id: "copy", action: "Copy", keys: combo(platforms, ["Ctrl", "C"], ["Cmd", "C"]) },
        { id: "cut", action: "Cut", keys: combo(platforms, ["Ctrl", "X"], ["Cmd", "X"]) },
        { id: "paste", action: "Paste", keys: combo(platforms, ["Ctrl", "V"], ["Cmd", "V"]) },
        { id: "duplicate", action: "Duplicate", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "undo", action: "Undo", keys: combo(platforms, ["Ctrl", "Z"], ["Cmd", "Z"]) },
        { id: "redo", action: "Redo", keys: combo(platforms, ["Ctrl", "Shift", "Z"], ["Cmd", "Shift", "Z"]) },
        { id: "delete", action: "Delete", keys: perPlatform(platforms, { windows: ["Delete"], macos: ["Backspace"] }) },
      ],
    },
    {
      id: "transport",
      title: "Transport and timeline",
      intro: "Transport shortcuts start playback, record, cycle, set locators, and move through events or markers on the project timeline.",
      shortcuts: [
        { id: "start-stop", action: "Start or stop playback", keys: perPlatform(platforms, { windows: ["Space"], macos: ["Space"] }) },
        { id: "start", action: "Start playback", keys: perPlatform(platforms, { windows: ["Enter"], macos: ["Return"] }) },
        { id: "stop", action: "Stop", keys: perPlatform(platforms, { windows: ["Num 0"], macos: ["Num 0"] }) },
        { id: "record", action: "Record", keys: perPlatform(platforms, { windows: ["Num *"], macos: ["Num *"] }) },
        { id: "cycle", action: "Toggle Cycle", keys: perPlatform(platforms, { windows: ["Num /"] , macos: ["Num /"] }) },
        { id: "left-locator", action: "Go to the left locator", keys: perPlatform(platforms, { windows: ["Num 1"], macos: ["Num 1"] }) },
        { id: "right-locator", action: "Go to the right locator", keys: perPlatform(platforms, { windows: ["Num 2"], macos: ["Num 2"] }) },
        { id: "locators-selection", action: "Set locators to the selection", keys: perPlatform(platforms, { windows: ["P"], macos: ["P"] }) },
        { id: "next-event", action: "Locate the next event", keys: perPlatform(platforms, { windows: ["N"], macos: ["N"] }) },
        { id: "previous-event", action: "Locate the previous event", keys: perPlatform(platforms, { windows: ["B"], macos: ["B"] }) },
        { id: "next-marker", action: "Locate the next marker", keys: perPlatform(platforms, { windows: ["Shift", "N"], macos: ["Shift", "N"] }) },
        { id: "previous-marker", action: "Locate the previous marker", keys: perPlatform(platforms, { windows: ["Shift", "B"], macos: ["Shift", "B"] }) },
      ],
    },
    {
      id: "editing-and-devices",
      title: "Editing and devices",
      intro: "Editing and device commands change selection state, mute or solo events, open editors, and reach the main Cubase panels.",
      shortcuts: [
        { id: "find-track", action: "Find a track or channel", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "group", action: "Group selected events", keys: combo(platforms, ["Ctrl", "G"], ["Cmd", "G"]) },
        { id: "mute", action: "Mute events", keys: perPlatform(platforms, { windows: ["Shift", "M"], macos: ["Shift", "M"] }) },
        { id: "solo", action: "Solo", keys: perPlatform(platforms, { windows: ["S"], macos: ["S"] }) },
        { id: "split", action: "Split at the cursor", keys: perPlatform(platforms, { windows: ["Alt", "X"], macos: ["Option", "X"] }) },
        { id: "snap", action: "Toggle Snap", keys: perPlatform(platforms, { windows: ["J"], macos: ["J"] }) },
        { id: "open-key-editor", action: "Open or close the editor", keys: perPlatform(platforms, { windows: ["Return"], macos: ["Return"] }) },
        { id: "mixconsole", action: "Open MixConsole", keys: perPlatform(platforms, { windows: ["F3"], macos: ["F3"] }) },
        { id: "audio-connections", action: "Open Audio Connections", keys: perPlatform(platforms, { windows: ["F4"], macos: ["F4"] }) },
        { id: "media-bay", action: "Open MediaBay", keys: perPlatform(platforms, { windows: ["F5"], macos: ["F5"] }) },
        { id: "video-player", action: "Open Video Player", keys: perPlatform(platforms, { windows: ["F8"], macos: ["F8"] }) },
        { id: "vst-instruments", action: "Open VST Instruments", keys: perPlatform(platforms, { windows: ["F11"], macos: ["F11"] }) },
      ],
    },
  ],
};

export default cubase;
