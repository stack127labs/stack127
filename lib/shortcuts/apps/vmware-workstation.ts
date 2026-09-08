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
  intro:
    "VMware Workstation's default hot-key combinations release input, control full-screen guests, switch virtual machines, and manage Unity mode. This reference covers the host shortcuts documented for Workstation Pro on Windows and Linux.",
  versionContext:
    "Broadcom's VMware Workstation Pro 17.0 manual default hot-key table checked September 1, 2026. Host operating-system shortcuts and guest operating-system shortcuts can intercept combinations, and Workstation preferences or a different product edition may change the active map.",
  sourceUrl: "https://techdocs2-prod.adobecqms.net/content/dam/broadcom/techdocs/us/en/pdf/vmware/desktop-hypervisors/workstation/vmware-workstation-pro-17-0.pdf",
  sourceLabel: "official VMware Workstation Pro default hot-key combinations",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "input-and-guest",
      title: "Host and guest input",
      intro: "Grab or release keyboard and pointer input and send system combinations directly to the running guest virtual machine.",
      shortcuts: [
        key("grab-input", "Grab input from the host", ["Ctrl", "G"]),
        key("release-input", "Release the cursor from the guest", ["Ctrl", "Alt"]),
        key("guest-insert", "Send Ctrl+Alt+Insert to the guest", ["Ctrl", "Alt", "Insert"]),
        key("guest-delete", "Send Ctrl+Alt+Delete to the guest", ["Ctrl", "Alt", "Delete"], "The host may handle this combination unless Workstation has focus."),
        key("send-command", "Send a command to the virtual machine", ["Ctrl", "Alt", "Space"]),
      ],
    },
    {
      id: "full-screen-and-switching",
      title: "Full screen and virtual-machine switching",
      intro: "Enter full screen, move among virtual machines, and change the active display layout while a guest is running.",
      shortcuts: [
        key("full-screen", "Toggle full-screen mode", ["Ctrl", "Alt", "Enter"]),
        key("next-tab", "Switch to the next virtual-machine tab", ["Ctrl", "Tab"], "The manual documents this for Windows hosts."),
        key("previous-tab", "Switch to the previous virtual-machine tab", ["Ctrl", "Shift", "Tab"], "The manual documents this for Windows hosts."),
        key("next-full-screen-vm", "Switch to the next powered-on virtual machine in full screen", ["Ctrl", "Alt", "Right Arrow"]),
        key("previous-full-screen-vm", "Switch to the previous powered-on virtual machine in full screen", ["Ctrl", "Alt", "Left Arrow"]),
        key("monitor-layout", "Change the monitor layout in full screen", ["Ctrl", "Alt", "M"]),
      ],
    },
    {
      id: "unity-mode",
      title: "Unity mode",
      intro: "Enter or leave VMware Unity mode and use the host desktop to reach applications from the running guest.",
      shortcuts: [
        key("unity-mode", "Toggle Unity mode", ["Ctrl", "Shift", "U"]),
      ],
    },
  ],
};

export default vmwareWorkstation;
