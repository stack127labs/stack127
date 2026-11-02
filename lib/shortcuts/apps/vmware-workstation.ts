import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "linux"] as const;

const key = (id: string, action: string, keys: string[], note?: string) => ({
  id,
  action,
  keys: combo(platforms, keys),
  ...(note ? { note } : {}),
});

export const vmwareWorkstation: AppShortcuts = {
  slug: "vmware-workstation",
  name: "VMware Workstation",
  category: "Virtualization",
  platforms: [...platforms],
  versionContext:
    "VMware Workstation Pro for Windows and Linux hosts. You can change the hot keys in Preferences, for example to release input with Ctrl+Shift instead of Ctrl+Alt.",
  sourceUrl: "https://techdocs.broadcom.com/content/dam/broadcom/techdocs/us/en/pdf/vmware/desktop-hypervisors/workstation/vmware-workstation-pro-26h1.pdf",
  sourceLabel: "VMware Workstation Pro 26H1 user guide",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "input-and-guest",
      title: "Host and guest input",
      intro: "Grab or release keyboard and pointer input and send system combinations directly to the running guest virtual machine.",
      shortcuts: [
        key("grab-input", "Grab keyboard and mouse input", ["Ctrl", "G"]),
        key("release-input", "Release the cursor from the guest", ["Ctrl", "Alt"]),
        key("guest-insert", "Send Ctrl+Alt+Insert to the guest only", ["Ctrl", "Alt", "Insert"]),
        key("guest-delete", "Send Ctrl+Alt+Delete to the guest", ["Ctrl", "Alt", "Delete"], "On a Windows host, the host also receives this combination."),
        key("send-command", "Send the next key combination to the guest", ["Ctrl", "Alt", "Space"], "Keep holding Ctrl+Alt after Space, then press the next key."),
      ],
    },
    {
      id: "full-screen-and-switching",
      title: "Full screen and switching",
      intro: "Enter full screen, move among virtual machines, and change the monitor layout while a guest is running.",
      shortcuts: [
        key("full-screen", "Toggle full-screen mode", ["Ctrl", "Alt", "Enter"]),
        { id: "next-tab", action: "Switch to the next virtual-machine tab", keys: [{ platform: "windows", keys: ["Ctrl", "Tab"] }], note: "Windows hosts only." },
        { id: "previous-tab", action: "Switch to the previous virtual-machine tab", keys: [{ platform: "windows", keys: ["Ctrl", "Shift", "Tab"] }], note: "Windows hosts only." },
        key("next-full-screen-vm", "Switch to the next powered-on virtual machine in full screen", ["Ctrl", "Alt", "Right Arrow"]),
        key("previous-full-screen-vm", "Switch to the previous powered-on virtual machine in full screen", ["Ctrl", "Alt", "Left Arrow"]),
        key("monitor-layout", "Open the monitor layout menu in full screen", ["Ctrl", "Alt", "M"]),
      ],
    },
  ],
};

export default vmwareWorkstation;
