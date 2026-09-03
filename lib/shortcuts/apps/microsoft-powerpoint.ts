import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const both = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: platforms.map((platform) => ({ platform, keys })),
  ...(note ? { note } : {}),
});

const pair = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const windowsOnly = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "windows", keys }],
  ...(note ? { note } : {}),
});

const macOnly = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: [{ platform: "macos", keys }],
  ...(note ? { note } : {}),
});

export const microsoftPowerPoint: AppShortcuts = {
  slug: "microsoft-powerpoint",
  name: "Microsoft PowerPoint",
  category: "Presentation software",
  platforms: [...platforms],
  intro:
    "PowerPoint's keyboard map separates Windows authoring commands from the presentation controls shared by Windows and Mac. Use the ribbon key tips for commands that do not have a dedicated chord.",
  versionContext:
    "Current Microsoft PowerPoint creation and presentation shortcuts checked September 1, 2026. The official creation table is Windows-focused, while the delivery table documents Windows and Mac separately. Ribbon access keys and presentation commands can vary with the PowerPoint version and keyboard layout.",
  sourceUrl: "https://support.microsoft.com/en-us/office/use-keyboard-shortcuts-to-deliver-powerpoint-presentations-1524ffce-bd2a-45f4-9a7f-f18b992b93a0",
  sourceLabel: "official Microsoft PowerPoint presentation shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "windows-authoring",
      title: "Windows authoring",
      intro: "Create slides, search the ribbon, insert objects, and manage the Windows PowerPoint workspace.",
      shortcuts: [
        windowsOnly("search", "Move to the Search box", ["Alt", "then", "Q"]),
        windowsOnly("file-tab", "Open the File page", ["Alt", "then", "F"]),
        windowsOnly("home-tab", "Open the Home tab", ["Alt", "then", "H"]),
        windowsOnly("insert-tab", "Open the Insert tab", ["Alt", "then", "N"]),
        windowsOnly("draw-tab", "Open the Draw tab", ["Alt", "then", "J", "then", "I"]),
        windowsOnly("design-tab", "Open the Design tab", ["Alt", "then", "G"]),
        windowsOnly("transitions-tab", "Open the Transitions tab", ["Alt", "then", "K"]),
        windowsOnly("animations-tab", "Open the Animations tab", ["Alt", "then", "A"]),
        windowsOnly("slideshow-tab", "Open the Slide Show tab", ["Alt", "then", "S"]),
        windowsOnly("review-tab", "Open the Review tab", ["Alt", "then", "R"]),
        windowsOnly("view-tab", "Open the View tab", ["Alt", "then", "W"]),
        windowsOnly("record-tab", "Open the Record tab", ["Alt", "then", "E"]),
        windowsOnly("help-tab", "Open PowerPoint help", ["Alt", "then", "Y", "then", "2"]),
        windowsOnly("ribbon-focus", "Show ribbon key tips", ["Alt"], "F10 is also documented."),
        windowsOnly("next-ribbon-control", "Move to the next ribbon control", ["Tab"]),
        windowsOnly("previous-ribbon-control", "Move to the previous ribbon control", ["Shift", "Tab"]),
        windowsOnly("ribbon-tooltip", "Show the tooltip for the focused ribbon control", ["Ctrl", "Shift", "F10"]),
        windowsOnly("activate-control", "Activate the focused control", ["Space"], "Enter is also documented."),
        windowsOnly("open-list", "Open the selected list", ["Down"]),
        windowsOnly("open-menu", "Open the selected menu", ["Alt", "Down"]),
        windowsOnly("toggle-ribbon", "Expand or collapse the ribbon", ["Ctrl", "F1"]),
        windowsOnly("context-menu", "Open the context menu", ["Shift", "F10"]),
        windowsOnly("new-slide", "Insert a new slide", ["Ctrl", "M"]),
        windowsOnly("save", "Save the presentation", ["Ctrl", "S"]),
        windowsOnly("undo", "Undo the last action", ["Ctrl", "Z"]),
        windowsOnly("redo", "Redo the last action", ["Ctrl", "Y"]),
        windowsOnly("duplicate", "Duplicate the selected object or slide", ["Ctrl", "D"]),
        windowsOnly("cut", "Cut the selection", ["Ctrl", "X"]),
        windowsOnly("copy", "Copy the selection", ["Ctrl", "C"]),
        windowsOnly("paste", "Paste the clipboard", ["Ctrl", "V"]),
        windowsOnly("select-all", "Select all objects or text", ["Ctrl", "A"]),
        windowsOnly("textbox", "Insert a text box", ["Alt", "then", "N", "then", "X"]),
        windowsOnly("picture", "Insert a picture", ["Alt", "then", "N", "then", "P", "then", "D"]),
        windowsOnly("shape", "Insert a shape", ["Alt", "then", "N", "then", "S", "then", "H"]),
        windowsOnly("zoom", "Open the Zoom dialog", ["Alt", "then", "W", "then", "Q"]),
        windowsOnly("print", "Open the print dialog", ["Alt", "then", "P", "then", "P"]),
        windowsOnly("theme", "Open the theme gallery", ["Alt", "then", "G", "then", "H"]),
        windowsOnly("slide-layout", "Open the slide layout menu", ["Alt", "then", "H", "then", "L"]),
        windowsOnly("notes-pane", "Open or focus the Notes pane", ["Alt", "then", "W", "then", "P", "then", "N"]),
      ],
    },
    {
      id: "presentation-navigation",
      title: "Presentation navigation",
      intro: "Move through slides and start a show from the beginning, current slide, or presenter view.",
      shortcuts: [
        windowsOnly("start-show", "Start the slide show from the beginning", ["F5"]),
        windowsOnly("start-current-slide", "Start the slide show from the current slide", ["Shift", "F5"]),
        windowsOnly("presenter-view", "Start Presenter view", ["Alt", "F5"]),
        macOnly("start-show-macos", "Start the slide show from the beginning", ["Cmd", "Shift", "Return"]),
        macOnly("start-current-slide-macos", "Start the slide show from the current slide", ["Cmd", "Return"]),
        macOnly("presenter-view-macos", "Start Presenter view", ["Option", "Return"]),
        both("next-slide", "Advance to the next slide", ["N"], "Enter, Page Down, Right, Down, or Space also advances."),
        both("previous-slide", "Return to the previous slide", ["P"], "Page Up, Left, Up, or Backspace also returns."),
        both("first-slide", "Go to the first slide", ["Home"]),
        both("last-slide", "Go to the last slide", ["End"]),
        both("specific-slide", "Go to a specific slide", ["Number", "then", "Enter"]),
        both("end-show", "End the slide show", ["Esc"], "The hyphen key also ends a show on Windows; Command+Period is documented on Mac."),
        windowsOnly("all-slides", "Show all slides", ["Ctrl", "S"]),
        both("help-during-show", "Show slide show help", ["F1"]),
        both("toggle-pointer", "Show or hide the pointer", ["Ctrl", "H"], "On Mac, use Command+I."),
        pair("toggle-black-screen", "Show a black screen", ["B"], ["B"]),
        pair("toggle-white-screen", "Show a white screen", ["W"], ["W"]),
        macOnly("black-screen-alternative", "Show a black screen", ["Shift", "B"]),
        macOnly("white-screen-alternative", "Show a white screen", ["Shift", "W"]),
        macOnly("first-slide-macos", "Go to the first slide", ["Function", "Left"]),
        macOnly("last-slide-macos", "Go to the last slide", ["Function", "Right"]),
        both("show-hotspots", "Show clickable hotspots", ["Tab"]),
      ],
    },
  ],
};

export default microsoftPowerPoint;
