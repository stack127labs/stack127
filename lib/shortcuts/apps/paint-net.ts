import type { AppShortcuts, Shortcut } from "../types.ts";

const win = (id: string, action: string, keys: string[], alternatives?: string[][], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys, ...(alternatives?.length ? { alternatives } : {}) }],
  ...(note ? { note } : {}),
});

export const paintNet: AppShortcuts = {
  slug: "paint-net",
  name: "Paint.NET",
  category: "Design tool",
  platforms: ["windows"],
  intro:
    "Paint.NET combines canvas navigation with image zoom, selection controls, tool windows, and keyboard access to its drawing tools. Its official list also documents repeated key presses for tool groups, so those bindings stay explicit instead of being collapsed into one generic tool shortcut.",
  versionContext:
    "Paint.NET keyboard and mouse commands from the official documentation, checked September 1, 2026. This reference is for the Windows desktop application and keeps mouse gestures only where the official command is a keyboard-plus-mouse action.",
  sourceUrl: "https://www.getpaint.net/doc/latest/KeyboardMouseCommands.html",
  sourceLabel: "official Paint.NET keyboard and mouse commands",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "canvas",
      title: "Canvas and zoom",
      intro: "Pan, scroll, zoom, and center the image while working on the canvas. Some commands use a mouse gesture as part of the documented action.",
      shortcuts: [
        win("pan", "Pan the image", ["Space", "Left Mouse Button"]),
        win("scroll-vertical", "Scroll up or down", ["Page Up", "Page Down"], [["Mouse Wheel"]]),
        win("scroll-left", "Scroll left", ["Shift", "Page Up"], [["Home"]]),
        win("scroll-right", "Scroll right", ["Shift", "Page Down"], [["End"]]),
        win("top-left", "Scroll the image to the top left", ["Shift", "Home"], [["Home", "Home"]]),
        win("bottom-right", "Scroll the image to the bottom right", ["Shift", "End"], [["End", "End"]]),
        win("center-selection", "Center the image in the window", ["Ctrl", "B"], undefined, "Press Ctrl+B twice to zoom to the window and then restore the previous zoom level."),
        win("zoom", "Zoom in or out", ["Ctrl", "Mouse Wheel"], [["Ctrl", "+"], ["Ctrl", "-"]]),
        win("actual-size", "Set the image to actual size", ["Ctrl", "0"]),
      ],
    },
    {
      id: "view-and-tools",
      title: "View and tool windows",
      intro: "Show or hide Paint.NET panels, access menu hotkeys, and move the active tool by one or ten pixels.",
      shortcuts: [
        win("tool-window", "Show or hide the Tools window", ["F5"]),
        win("history-window", "Show or hide the History window", ["F6"]),
        win("layers-window", "Show or hide the Layers window", ["F7"]),
        win("colors-window", "Show or hide the Colors window", ["F8"]),
        win("menu-hotkey", "Show menu hotkeys", ["Alt"]),
        win("use-menu-hotkey", "Use an underlined menu letter", ["Alt", "Underlined letter"]),
        win("nudge-tool", "Move the active tool one pixel", ["Arrow keys"]),
        win("nudge-tool-more", "Move the active tool ten pixels", ["Ctrl", "Arrow keys"]),
      ],
    },
    {
      id: "selection-and-editing",
      title: "Selection and editing",
      intro: "Clear selections and return to the common selection, undo, and redo operations used by Paint.NET tools.",
      shortcuts: [
        win("deselect", "Deselect the active selection", ["Ctrl", "D"], [["Enter"]]),
        win("undo", "Undo", ["Ctrl", "Z"]),
        win("redo", "Redo", ["Ctrl", "Y"]),
        win("copy", "Copy the selection", ["Ctrl", "C"]),
        win("cut", "Cut the selection", ["Ctrl", "X"]),
        win("paste", "Paste", ["Ctrl", "V"]),
        win("save", "Save the current image", ["Ctrl", "S"]),
        win("open", "Open an image", ["Ctrl", "O"]),
        win("new", "Create a new image", ["Ctrl", "N"]),
      ],
    },
  ],
};

export default paintNet;
