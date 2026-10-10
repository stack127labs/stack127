import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

const shared = (id: string, action: string, keys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

const history = (id: string, action: string, keys: string[], macKeys: string[]): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: keys, macos: macKeys, linux: keys }),
});

export const wireshark: AppShortcuts = {
  slug: "wireshark",
  name: "Wireshark",
  category: "Network analysis",
  platforms: [...platforms],
  versionContext:
    "Current Wireshark User's Guide 4.7.3 checked October 10, 2026. The guide uses the same menu shortcuts across desktop platforms, with Option replacing Alt for packet-selection history on macOS.",
  sourceUrl: "https://www.wireshark.org/docs/wsug_html/",
  sourceLabel: "official Wireshark User's Guide",
  lastVerified: "2026-10-10",
  groups: [
    {
      id: "packet-navigation",
      title: "Packet navigation",
      intro: "Move through packet rows, panes, protocol trees, and the packet-selection history.",
      shortcuts: [
        shared("next-pane", "Move to the next pane", ["Tab"]),
        shared("previous-pane", "Move to the previous pane", ["Shift", "Tab"]),
        shared("next-packet", "Select the next packet", ["Down Arrow"]),
        shared("previous-packet", "Select the previous packet", ["Up Arrow"]),
        {
          id: "next-packet-fast",
          action: "Select the next packet even if the packet list isn't focused",
          keys: combo(platforms, ["Ctrl", "Down Arrow"]).map((entry) => ({ ...entry, alternatives: [["F8"]] })),
        },
        {
          id: "previous-packet-fast",
          action: "Select the previous packet even if the packet list isn't focused",
          keys: combo(platforms, ["Ctrl", "Up Arrow"]).map((entry) => ({ ...entry, alternatives: [["F7"]] })),
        },
        shared("next-conversation-packet", "Select the next packet in the conversation", ["Ctrl", "."]),
        shared("previous-conversation-packet", "Select the previous packet in the conversation", ["Ctrl", ","]),
        history("next-selection", "Move forward in packet-selection history", ["Alt", "Right Arrow"], ["Option", "Right Arrow"]),
        history("previous-selection", "Move backward in packet-selection history", ["Alt", "Left Arrow"], ["Option", "Left Arrow"]),
        shared("close-tree", "Close the selected protocol tree", ["Left Arrow"]),
        shared("open-tree", "Open the selected protocol tree", ["Right Arrow"]),
        shared("open-subtree", "Open the selected tree and its subtree", ["Shift", "Right Arrow"]),
        shared("expand-tree", "Expand all protocol trees", ["Ctrl", "Right Arrow"]),
        shared("collapse-tree", "Collapse all protocol trees", ["Ctrl", "Left Arrow"]),
        shared("parent-tree", "Move to the parent protocol tree", ["Backspace"]),
        shared("toggle-tree", "Toggle the selected tree item", ["Enter"]),
      ],
    },
    {
      id: "file-and-search",
      title: "Files and search",
      intro: "Open, save, print, reload, and search capture files from the main window.",
      shortcuts: [
        shared("open-capture", "Open a capture file", ["Ctrl", "O"]),
        shared("close-capture", "Close the capture file", ["Ctrl", "W"]),
        shared("save-capture", "Save the capture file", ["Ctrl", "S"]),
        shared("save-as", "Save the capture file as another file", ["Ctrl", "Shift", "S"]),
        shared("export-packets", "Export packet dissections", ["Ctrl", "H"]),
        shared("print", "Print the capture", ["Ctrl", "P"]),
        shared("reload", "Reload the capture", ["Ctrl", "R"]),
        shared("reload-as-file", "Reload the capture as a file", ["Shift", "Ctrl", "F"]),
        shared("find-packet", "Find a packet", ["Ctrl", "F"]),
        shared("find-next", "Find the next packet match", ["Ctrl", "N"]),
        shared("find-previous", "Find the previous packet match", ["Ctrl", "B"]),
        shared("go-to-packet", "Go to a packet", ["Ctrl", "G"]),
        shared("resize-columns", "Resize packet-list columns", ["Shift", "Ctrl", "R"]),
      ],
    },
    {
      id: "marks-and-references",
      title: "Marks, comments, and references",
      intro: "Mark packets, add time references or comments, and move between those saved points.",
      shortcuts: [
        shared("mark-packet", "Mark or unmark the selected packet", ["Ctrl", "M"]),
        shared("mark-all", "Mark all packets", ["Ctrl", "Shift", "M"]),
        shared("unmark-all", "Unmark all packets", ["Ctrl", "Alt", "M"]),
        shared("next-mark", "Select the next marked packet", ["Ctrl", "Shift", "N"]),
        shared("previous-mark", "Select the previous marked packet", ["Ctrl", "Shift", "B"]),
        shared("ignore-packet", "Ignore the selected packet", ["Ctrl", "D"]),
        shared("ignore-all", "Ignore all packets of the selected type", ["Ctrl", "Shift", "D"]),
        shared("unignore", "Unignore packets", ["Ctrl", "Alt", "D"]),
        shared("time-reference", "Set or unset a time reference", ["Ctrl", "T"]),
        shared("unset-references", "Unset all time references", ["Ctrl", "Alt", "T"]),
        shared("next-reference", "Select the next time reference", ["Ctrl", "Alt", "N"]),
        shared("previous-reference", "Select the previous time reference", ["Ctrl", "Alt", "B"]),
        shared("time-shift", "Shift packet times", ["Ctrl", "Shift", "T"]),
        shared("packet-comment", "Add a packet comment", ["Ctrl", "Alt", "C"]),
      ],
    },
    {
      id: "capture-and-display",
      title: "Capture and display",
      intro: "Start capture, open capture options, and control display settings from the keyboard.",
      shortcuts: [
        shared("capture-options", "Open capture options", ["Ctrl", "K"]),
        shared("start-stop-capture", "Start or stop a capture", ["Ctrl", "E"]),
        shared("refresh-interfaces", "Refresh capture interfaces", ["F5"]),
        shared("apply-as-column", "Apply the selected field as a column", ["Shift", "Ctrl", "I"]),
        shared("enabled-protocols", "Open enabled protocols", ["Shift", "Ctrl", "E"]),
        shared("configuration-profiles", "Open configuration profiles", ["Ctrl", "Shift", "A"]),
        shared("preferences", "Open preferences", ["Ctrl", "Shift", "P"]),
        shared("help", "Open the User's Guide", ["F1"]),
        shared("quit", "Quit Wireshark", ["Ctrl", "Q"]),
      ],
    },
  ],
};

export default wireshark;
