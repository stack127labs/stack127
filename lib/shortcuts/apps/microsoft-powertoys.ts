import type { AppShortcuts, Shortcut } from "../types.ts";

const windows = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys }],
  ...(note ? { note } : {}),
});

export const microsoftPowerToys: AppShortcuts = {
  slug: "microsoft-powertoys",
  name: "Microsoft PowerToys",
  category: "Windows utilities",
  platforms: ["windows"],
  intro:
    "PowerToys shortcuts start with the Shortcut Guide, PowerToys Run, Always On Top, Color Picker, FancyZones, and Workspaces. The utility bindings are global while PowerToys is running.",
  versionContext:
    "Current Microsoft PowerToys documentation checked September 1, 2026. These are the documented defaults, but every utility can be disabled or remapped in PowerToys settings and the set may change as utilities evolve.",
  sourceUrl: "https://learn.microsoft.com/en-us/windows/powertoys/shortcut-guide",
  sourceLabel: "official Microsoft PowerToys documentation",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "shortcut-guide",
      title: "Shortcut Guide",
      intro: "Open the guide to see Windows and PowerToys shortcuts, then search or close it.",
      shortcuts: [
        windows("open-shortcut-guide", "Open the Shortcut Guide", ["Win", "Shift", "?"]),
        windows("search-shortcut-guide", "Focus Shortcut Guide search", ["Ctrl", "F"]),
        windows("close-shortcut-guide", "Close the Shortcut Guide", ["Esc"]),
      ],
    },
    {
      id: "powertoys-run",
      title: "PowerToys Run",
      intro: "Launch PowerToys Run, move through results, and run a selected result with elevated permissions when needed.",
      shortcuts: [
        windows("show-run", "Show or hide PowerToys Run", ["Alt", "Space"]),
        windows("hide-run", "Close PowerToys Run", ["Esc"]),
        windows("run-as-administrator", "Run the selected result as administrator", ["Ctrl", "Shift", "Enter"]),
        windows("run-as-different-user", "Run the selected result as a different user", ["Ctrl", "Shift", "U"]),
        windows("open-containing-folder", "Open the containing folder", ["Ctrl", "Shift", "E"]),
        windows("copy-result-path", "Copy the selected result path", ["Ctrl", "C"]),
        windows("next-run-result", "Move to the next result", ["Tab"]),
      ],
    },
    {
      id: "window-and-color-tools",
      title: "Window and color tools",
      intro: "Pin a window above others or open Color Picker from anywhere on the Windows desktop.",
      shortcuts: [
        windows("always-on-top", "Pin or unpin the focused window", ["Win", "Ctrl", "T"]),
        windows("color-picker", "Open Color Picker", ["Win", "Shift", "C"]),
      ],
    },
    {
      id: "fancyzones",
      title: "FancyZones",
      intro: "Open the layout editor and move windows into zones using the default FancyZones bindings.",
      shortcuts: [
        windows("open-zones-editor", "Open the FancyZones editor", ["Win", "Shift", "`"]),
        windows("move-window-left", "Move the focused window to the zone on the left", ["Win", "Left"]),
        windows("move-window-right", "Move the focused window to the zone on the right", ["Win", "Right"]),
        windows("move-window-up", "Move the focused window to the zone above", ["Win", "Up"]),
        windows("move-window-down", "Move the focused window to the zone below", ["Win", "Down"]),
        windows("switch-window-up", "Switch windows in the zone above", ["Win", "Page Up"]),
        windows("switch-window-down", "Switch windows in the zone below", ["Win", "Page Down"]),
        windows("custom-layout", "Apply a custom layout", ["Win", "Ctrl", "Alt", "Number"]),
        windows("next-zone", "Move to the next zone in the editor", ["Tab"]),
        windows("divide-zone", "Divide a zone in the editor", ["S"]),
        windows("merge-zones", "Merge selected zones in the editor", ["Delete"]),
      ],
    },
    {
      id: "workspaces",
      title: "Workspaces",
      intro: "Open the Workspaces editor and manage saved workspace layouts.",
      shortcuts: [
        windows("open-workspaces-editor", "Open the Workspaces editor", ["Win", "Ctrl", "`"]),
      ],
    },
  ],
};

export default microsoftPowerToys;
