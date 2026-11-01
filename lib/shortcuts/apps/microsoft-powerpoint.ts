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
  versionContext:
    "Current Microsoft PowerPoint creation and presentation shortcuts checked November 1, 2026. The official creation table is Windows-focused, while the delivery table documents Windows and Mac separately. Ribbon access keys and presentation commands can vary with the PowerPoint version and keyboard layout.",
  sourceUrl: "https://support.microsoft.com/en-us/office/use-keyboard-shortcuts-to-deliver-powerpoint-presentations-1524ffce-bd2a-45f4-9a7f-f18b992b93a0",
  sourceLabel: "official Microsoft PowerPoint presentation shortcuts",
  lastVerified: "2026-11-01",
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
        { id: "ribbon-focus", action: "Select the active ribbon tab and activate access keys", keys: [{ platform: "windows", keys: ["Alt"], alternatives: [["F10"]] }] },
        windowsOnly("next-ribbon-control", "Move to the next ribbon control", ["Tab"]),
        windowsOnly("previous-ribbon-control", "Move to the previous ribbon control", ["Shift", "Tab"]),
        windowsOnly("ribbon-tooltip", "Show the tooltip for the focused ribbon control", ["Ctrl", "Shift", "F10"]),
        { id: "activate-control", action: "Activate the focused control", keys: [{ platform: "windows", keys: ["Space"], alternatives: [["Enter"]] }] },
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
        {
          id: "next-slide",
          action: "Advance to the next slide",
          keys: platforms.map((platform) => ({
            platform,
            keys: ["N"],
            alternatives: [["Enter"], ["Page Down"], ["Right"], ["Down"], ["Space"]],
          })),
        },
        {
          id: "previous-slide",
          action: "Return to the previous slide",
          keys: [
            {
              platform: "windows",
              keys: ["P"],
              alternatives: [["Page Up"], ["Left"], ["Up"], ["Backspace"]],
            },
            {
              platform: "macos",
              keys: ["P"],
              alternatives: [["Page Up"], ["Left"], ["Up"], ["Delete"]],
            },
          ],
        },
        {
          id: "first-slide",
          action: "Go to the first slide",
          keys: [
            { platform: "windows", keys: ["Home"] },
            { platform: "macos", keys: ["Fn", "Left"] },
          ],
        },
        {
          id: "last-slide",
          action: "Go to the last slide",
          keys: [
            { platform: "windows", keys: ["End"] },
            { platform: "macos", keys: ["Fn", "Right"] },
          ],
        },
        {
          id: "specific-slide",
          action: "Go to a specific slide",
          keys: [
            { platform: "windows", keys: ["Number", "then", "Enter"] },
            { platform: "macos", keys: ["Number", "then", "Return"] },
          ],
        },
        {
          id: "end-show",
          action: "End the slide show",
          keys: [
            { platform: "windows", keys: ["Esc"] },
            { platform: "macos", keys: ["Esc"], alternatives: [["-"], ["Cmd", "."]] },
          ],
        },
        windowsOnly("all-slides", "Show all slides", ["Ctrl", "S"]),
        windowsOnly("help-during-show", "Show slide show help", ["F1"]),
        pair("toggle-pointer", "Hide the pointer", ["Ctrl", "H"], ["Cmd", "I"]),
        {
          id: "toggle-black-screen",
          action: "Show or return from a black screen",
          keys: [
            { platform: "windows", keys: ["B"], alternatives: [["."]] },
            { platform: "macos", keys: ["B"], alternatives: [["Shift", "B"], ["."]] },
          ],
        },
        {
          id: "toggle-white-screen",
          action: "Show or return from a white screen",
          keys: [
            { platform: "windows", keys: ["W"], alternatives: [[","]] },
            { platform: "macos", keys: ["W"], alternatives: [["Shift", "W"], [","]] },
          ],
        },
        both("show-hotspots", "Show clickable hotspots", ["Tab"]),
      ],
    },
  ],
};

export default microsoftPowerPoint;
