import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const same = (id: string, action: string, keys: string[], note?: string): Shortcut => dual(id, action, keys, keys, note);

export const protopie: AppShortcuts = {
  slug: "protopie",
  name: "ProtoPie",
  category: "Prototyping",
  platforms: [...platforms],
  versionContext:
    "ProtoPie Studio shortcuts checked September 1, 2026. The official list says the shortcut modal opens from Help or Control+Shift+Question mark on macOS and Ctrl+Shift+Question mark on Windows. Some actions use a key with a pointer gesture and are left out of this keyboard-only record.",
  sourceUrl: "https://www.protopie.io/learn/docs/basic-features-shortcuts",
  sourceLabel: "official ProtoPie Studio shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "general",
      title: "General",
      intro: "Create, open, save, upload, and inspect ProtoPie files with the commands in the official Studio shortcut list.",
      shortcuts: [
        dual("new-pie", "Create a new pie", ["Ctrl", "N"], ["Cmd", "N"]),
        dual("open", "Open a pie", ["Ctrl", "O"], ["Cmd", "O"]),
        dual("close-tab", "Close the current tab", ["Ctrl", "W"], ["Cmd", "W"]),
        dual("save", "Save", ["Ctrl", "S"], ["Cmd", "S"]),
        dual("save-as", "Save as", ["Ctrl", "Shift", "S"], ["Shift", "Cmd", "S"]),
        dual("upload", "Upload to cloud", ["Ctrl", "U"], ["Cmd", "U"]),
        dual("upload-new", "Upload to cloud as a new pie", ["Ctrl", "Shift", "U"], ["Shift", "Cmd", "U"]),
        dual("preferences", "Open preferences", ["Ctrl", ","], ["Cmd", ","]),
        dual("shortcut-help", "Open shortcut help", ["Ctrl", "Shift", "?"], ["Control", "Shift", "?"]),
      ],
    },
    {
      id: "edit",
      title: "Edit and tools",
      intro: "Switch tools and manage ProtoPie selections with the editing commands for undo, clipboard, duplication, deletion, and naming.",
      shortcuts: [
        same("move-tool", "Use the move tool", ["V"]),
        same("rectangle-tool", "Use the rectangle tool", ["R"]),
        same("oval-tool", "Use the oval tool", ["O"]),
        same("container-tool", "Use the container tool", ["N"]),
        same("text-tool", "Use the text tool", ["T"]),
        dual("undo", "Undo", ["Ctrl", "Z"], ["Cmd", "Z"]),
        dual("redo", "Redo", ["Ctrl", "Shift", "Z"], ["Shift", "Cmd", "Z"]),
        dual("copy", "Copy", ["Ctrl", "C"], ["Cmd", "C"]),
        dual("cut", "Cut", ["Ctrl", "X"], ["Cmd", "X"]),
        dual("duplicate", "Duplicate", ["Ctrl", "D"], ["Cmd", "D"]),
        dual("paste", "Paste", ["Ctrl", "V"], ["Cmd", "V"]),
        dual("linked-paste", "Paste with linked triggers", ["Ctrl", "Shift", "V"], ["Shift", "Cmd", "V"]),
        dual("delete", "Delete", ["Delete"], ["Backspace"]),
        dual("select-all", "Select all", ["Ctrl", "A"], ["Cmd", "A"]),
        dual("rename", "Rename", ["Ctrl", "R"], ["Cmd", "R"]),
        {
          id: "pick-color",
          action: "Pick a color",
          keys: [
            { platform: "windows", keys: ["I"] },
            { platform: "macos", keys: ["Control", "C"], alternatives: [["Control", "I"]] },
          ],
        },
      ],
    },
    {
      id: "object",
      title: "Objects and text",
      intro: "Create components, change layer properties, and enter text editing mode with the object commands documented by ProtoPie.",
      shortcuts: [
        dual("create-component", "Create a component", ["Ctrl", "K"], ["Cmd", "K"]),
        dual("detach-instance", "Detach an instance", ["Ctrl", "Alt", "B"], ["Option", "Cmd", "B"]),
        dual("make-editable", "Make editable", ["Ctrl", "E"], ["Cmd", "E"]),
        dual("auto-layout", "Add auto layout", ["Shift", "A"], ["Shift", "A"]),
        dual("remove-auto-layout", "Remove auto layout", ["Alt", "Shift", "A"], ["Option", "Shift", "A"]),
        dual("resize-to-fit", "Resize to fit", ["Ctrl", "Alt", "Shift", "R"], ["Option", "Shift", "Cmd", "R"]),
        dual("lock-layer", "Lock or unlock a layer", ["Ctrl", "Shift", "L"], ["Shift", "Cmd", "L"]),
        dual("show-layer", "Show or hide a layer", ["Ctrl", "Shift", "H"], ["Shift", "Cmd", "H"]),
        dual("edit-text", "Edit a text layer", ["Enter"], ["Return"]),
        dual("bold", "Bold text", ["Ctrl", "B"], ["Cmd", "B"]),
        dual("italic", "Italic text", ["Ctrl", "I"], ["Cmd", "I"]),
      ],
    },
    {
      id: "arrange",
      title: "Arrange",
      intro: "Group and reorder selected layers, then align them to an edge or center with ProtoPie's arrange shortcuts.",
      shortcuts: [
        dual("group", "Group selection", ["Ctrl", "G"], ["Cmd", "G"]),
        dual("ungroup", "Ungroup selection", ["Ctrl", "Shift", "G"], ["Shift", "Cmd", "G"]),
        dual("bring-forward", "Bring forward", ["Ctrl", "]"], ["Cmd", "]"]),
        {
          id: "bring-front",
          action: "Bring to front",
          keys: [
            { platform: "windows", keys: ["]"], alternatives: [["Ctrl", "Shift", "]"]] },
            { platform: "macos", keys: ["]"], alternatives: [["Option", "Cmd", "]"]] },
          ],
        },
        dual("send-backward", "Send backward", ["Ctrl", "["], ["Cmd", "["]),
        {
          id: "send-back",
          action: "Send to back",
          keys: [
            { platform: "windows", keys: ["["], alternatives: [["Ctrl", "Shift", "["]] },
            { platform: "macos", keys: ["["], alternatives: [["Option", "Cmd", "["]] },
          ],
        },
        dual("align-left", "Align left", ["Ctrl", "Shift", "Left Arrow"], ["Control", "Cmd", "Left Arrow"]),
        dual("align-right", "Align right", ["Ctrl", "Shift", "Right Arrow"], ["Control", "Cmd", "Right Arrow"]),
        dual("align-top", "Align top", ["Ctrl", "Shift", "Up Arrow"], ["Control", "Cmd", "Up Arrow"]),
        dual("align-bottom", "Align bottom", ["Ctrl", "Shift", "Down Arrow"], ["Control", "Cmd", "Down Arrow"]),
        dual("align-center", "Align center", ["Ctrl", "Shift", "C"], ["Control", "Cmd", "C"]),
        dual("align-middle", "Align middle", ["Ctrl", "Shift", "M"], ["Control", "Cmd", "M"]),
      ],
    },
    {
      id: "interactions",
      title: "Interactions",
      intro: "Adjust interaction timings, reveal trigger names, and run a prototype from ProtoPie's interaction workspace.",
      shortcuts: [
        same("delay-up-small", "Increase delay by 0.01 seconds", ["Right Arrow"]),
        same("delay-down-small", "Decrease delay by 0.01 seconds", ["Left Arrow"]),
        same("delay-up-large", "Increase delay by 0.1 seconds", ["Shift", "Right Arrow"]),
        same("delay-down-large", "Decrease delay by 0.1 seconds", ["Shift", "Left Arrow"]),
        dual("duration-up-small", "Increase duration by 0.01 seconds", ["Alt", "Right Arrow"], ["Option", "Right Arrow"]),
        dual("duration-down-small", "Decrease duration by 0.01 seconds", ["Alt", "Left Arrow"], ["Option", "Left Arrow"]),
        dual("duration-up-large", "Increase duration by 0.1 seconds", ["Alt", "Shift", "Right Arrow"], ["Shift", "Option", "Right Arrow"]),
        dual("duration-down-large", "Decrease duration by 0.1 seconds", ["Alt", "Shift", "Left Arrow"], ["Shift", "Option", "Left Arrow"]),
        same("show-trigger-names", "Show original trigger and response names", ["H"]),
        dual("run-prototype", "Run prototype", ["Ctrl", "Shift", "R"], ["Shift", "Cmd", "R"]),
      ],
    },
    {
      id: "canvas",
      title: "Canvas",
      intro: "Change the canvas zoom, return to actual size, pan, and move between scenes or components with these keys.",
      shortcuts: [
        dual("zoom-in", "Zoom in", ["Ctrl", "+"], ["Cmd", "="]),
        dual("zoom-out", "Zoom out", ["Ctrl", "-"], ["Cmd", "-"]),
        dual("actual-size", "Show actual size", ["Ctrl", "0"], ["Cmd", "0"]),
        same("previous-scene", "Go to the previous scene or component", ["Home"], "The source also lists Fn+Left Arrow on supported keyboards."),
        same("next-scene", "Go to the next scene or component", ["End"], "The source also lists Fn+Right Arrow on supported keyboards."),
      ],
    },
    {
      id: "view-and-window",
      title: "View and window",
      intro: "Show panels, the ruler, formula input, preview, and application tabs from ProtoPie's view and window groups.",
      shortcuts: [
        same("ruler", "Show the ruler", ["Shift", "R"]),
        macOnly("fullscreen", "Toggle fullscreen", ["Control", "Cmd", "F"]),
        dual("layer-panel", "Show or hide the layer panel", ["Ctrl", "Alt", "1"], ["Option", "Cmd", "1"]),
        dual("interaction-panel", "Show or hide the interaction panel", ["Ctrl", "Alt", "2"], ["Option", "Cmd", "2"]),
        dual("layer-interaction-panels", "Show or hide the layer and interaction panels", ["Ctrl", "Alt", "3"], ["Option", "Cmd", "3"]),
        dual("component-panel", "Show or hide the component panel", ["Ctrl", "Alt", "5"], ["Option", "Cmd", "5"]),
        dual("formula-input", "Show or hide the formula input field", ["Ctrl", "Enter"], ["Cmd", "Return"]),
        dual("minimize", "Minimize the window", ["Ctrl", "M"], ["Cmd", "M"]),
        macOnly("hide", "Hide ProtoPie", ["Cmd", "H"]),
        macOnly("hide-others", "Hide other apps", ["Option", "Cmd", "H"]),
        dual("preview", "Show or hide the preview window", ["Ctrl", "P"], ["Cmd", "P"]),
        dual("next-tab", "Go to the next tab", ["Ctrl", "Tab"], ["Control", "Tab"]),
        dual("previous-tab", "Go to the previous tab", ["Ctrl", "Shift", "Tab"], ["Control", "Shift", "Tab"]),
      ],
    },
  ],
};

function macOnly(id: string, action: string, keys: string[], note?: string): Shortcut {
  return {
    id,
    action,
    keys: [{ platform: "macos", keys, ...(note ? { note } : {}) }],
  };
}

export default protopie;
