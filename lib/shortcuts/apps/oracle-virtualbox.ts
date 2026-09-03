import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;
const host = (id: string, action: string, keys: string[], macKeys: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows: ["Right Ctrl", ...keys], linux: ["Right Ctrl", ...keys], macos: ["Left Cmd", ...macKeys] }),
  ...(note ? { note } : {}),
});

export const oracleVirtualBox: AppShortcuts = {
  slug: "oracle-virtualbox",
  name: "Oracle VirtualBox",
  category: "Developer tools",
  platforms: [...platforms],
  intro:
    "VirtualBox reserves a host key to release keyboard and mouse ownership from a virtual machine and to send special combinations to the guest. This reference keeps host-key actions separate from guest shortcuts, because the guest operating system still owns its own normal keymap.",
  versionContext:
    "Oracle VirtualBox 7.2 User Guide keyboard and host-key behavior checked September 1, 2026. The default host key is Right Ctrl on Windows and Linux hosts and Left Command on a Mac host; users can change it in Preferences.",
  sourceUrl: "https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/working-with-vms.html",
  sourceLabel: "Oracle VirtualBox User Guide host-key shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "host-key",
      title: "Host key and ownership",
      intro: "Use the host key to return keyboard or mouse ownership to the host operating system while a virtual machine is focused.",
      shortcuts: [
        {
          id: "release-input",
          action: "Release keyboard and mouse from the guest",
          keys: [
            { platform: "windows", keys: ["Right Ctrl"] },
            { platform: "linux", keys: ["Right Ctrl"] },
            { platform: "macos", keys: ["Left Cmd"] },
          ],
          note: "The host key can be changed in VirtualBox Preferences, so treat these as the documented defaults.",
        },
      ],
    },
    {
      id: "special-combinations",
      title: "Send special combinations to the guest",
      intro: "Prefix a special guest command with the host key when VirtualBox must translate it instead of sending it to the host.",
      shortcuts: [
        host("guest-ctrl-alt-delete", "Send Ctrl+Alt+Delete to the guest", ["Delete"], ["Delete"]),
        host("guest-ctrl-alt-backspace", "Send Ctrl+Alt+Backspace to the guest", ["Backspace"], ["Backspace"], "Useful for restarting the graphical interface of a Linux or Oracle Solaris guest."),
        host("guest-function-key", "Send Ctrl+Alt+F1 through F12 to the guest", ["F1-F12"], ["F1-F12"], "Choose the function key for the guest virtual terminal you want to reach."),
        host("insert-host-key", "Insert the host-key combination in the guest", ["Host key"], ["Host key"]),
      ],
    },
    {
      id: "input-routing",
      title: "Input routing",
      intro: "VirtualBox can route common combinations such as Alt+Tab to the host or guest, and the choice depends on input settings and focus.",
      shortcuts: [
        {
          id: "alt-tab-routing",
          action: "Route Alt+Tab to the host or guest",
          keys: perPlatform(platforms, { windows: ["Alt", "Tab"], macos: ["Option", "Tab"], linux: ["Alt", "Tab"] }),
          note: "VirtualBox lets you configure whether this combination affects the host or guest under Preferences > Input.",
        },
        {
          id: "ctrl-alt-delete-routing",
          action: "Route Ctrl+Alt+Delete according to host and guest rules",
          keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "Delete"], macos: ["Control", "Option", "Delete"], linux: ["Ctrl", "Alt", "Delete"] }),
          note: "Some host operating systems reserve this combination, so it may not be available to the guest without the host-key translation above.",
        },
      ],
    },
  ],
};

export default oracleVirtualBox;
