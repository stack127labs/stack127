import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const host = (id: string, action: string, keys: string[], macKeys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: [["Right Ctrl", ...keys].join(" + ")], linux: [["Right Ctrl", ...keys].join(" + ")], macos: [["Left Cmd", ...macKeys].join(" + ")] }),
  ...(note ? { note } : {}),
});

export const oracleVirtualBox: AppShortcuts = {
  slug: "oracle-virtualbox",
  name: "Oracle VirtualBox",
  category: "Developer tools",
  platforms: [...platforms],
  versionContext:
    "VirtualBox 7.2. The host key is Right Ctrl on Windows and Linux and Left Command on Mac, and you can change it in Preferences.",
  sourceUrl: "https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/working-with-vms.html",
  sourceLabel: "Oracle VirtualBox User Guide host-key shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "special-combinations",
      title: "Send special combinations to the guest",
      intro: "Prefix a special guest command with the host key when VirtualBox must translate it instead of sending it to the host.",
      shortcuts: [
        host("guest-ctrl-alt-delete", "Send Ctrl+Alt+Delete to the guest", ["Delete"], ["Delete"], "The host reserves Ctrl+Alt+Delete, so use this to reach the guest."),
        host("guest-ctrl-alt-backspace", "Send Ctrl+Alt+Backspace to the guest", ["Backspace"], ["Backspace"], "Useful for restarting the graphical interface of a Linux or Oracle Solaris guest."),
        host("guest-function-key", "Send Ctrl+Alt+F1 through F12 to the guest", ["F1-F12"], ["F1-F12"], "Choose the function key for the guest virtual terminal you want to reach."),
      ],
    },
    {
      id: "input-routing",
      title: "Input routing and host-key ownership",
      intro: "Release input from the guest or route common combinations such as Alt+Tab to the host or guest. Routing depends on input settings and focus.",
      shortcuts: [
        {
          id: "release-input",
          action: "Release keyboard and mouse from the guest",
          keys: [
            { platform: "windows", keys: ["Right Ctrl"] },
            { platform: "linux", keys: ["Right Ctrl"] },
            { platform: "macos", keys: ["Left Cmd"] },
          ],
          note: "The host key can be changed in VirtualBox Preferences, so these are the defaults.",
        },
        {
          id: "alt-tab-routing",
          action: "Switch open windows on the host or guest",
          keys: perPlatform(platforms, { windows: ["Alt", "Tab"], linux: ["Alt", "Tab"] }),
          note: "VirtualBox lets you configure whether this combination affects the host or guest under Preferences > Input.",
        },
      ],
    },
  ],
};

export default oracleVirtualBox;
