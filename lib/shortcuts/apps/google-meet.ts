import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleMeet: AppShortcuts = {
  slug: "google-meet",
  name: "Google Meet",
  category: "Video meetings",
  platforms: [...platforms],
  versionContext:
    "Google publishes separate Windows and Mac meeting tables. The complete in-meeting shortcut list is available from Meet's help dialog with Shift+question mark; some commands depend on account or meeting permissions.",
  sourceUrl: "https://support.google.com/meet/answer/9298571?hl=en",
  sourceLabel: "official Google Meet keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "meeting-controls",
      title: "Meeting controls",
      intro: "Toggle the camera, microphone, captions, hand, and meeting information while a call is active.",
      shortcuts: [
        { id: "camera", action: "Turn the camera on or off", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "microphone", action: "Mute or unmute the microphone", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "captions", action: "Turn captions on or off", keys: combo(platforms, ["C"]) },
        { id: "raise-hand", action: "Raise or lower your hand", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "H"], macos: ["Ctrl", "Cmd", "H"] }) },
        { id: "participants", action: "Show participants", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "P"], macos: ["Ctrl", "Cmd", "P"] }) },
        { id: "chat", action: "Open meeting chat", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "C"], macos: ["Ctrl", "Cmd", "C"] }) },
        { id: "picture-in-picture", action: "Toggle picture-in-picture", keys: combo(platforms, ["Shift", "M"]) },
        { id: "push-to-talk", action: "Temporarily unmute while holding the key", keys: combo(platforms, ["Space"]) , note: "Push-to-talk must be enabled in Meet settings." },
      ],
    },
    {
      id: "presentation-and-layout",
      title: "Presentation and layout",
      intro: "Present, change the number of visible tiles, and minimize or announce meeting information from the call view.",
      shortcuts: [
        { id: "present", action: "Start or stop presenting", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "T"], macos: ["Ctrl", "Cmd", "T"] }) },
        { id: "increase-tiles", action: "Show more tiles", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "K"], macos: ["Ctrl", "Cmd", "K"] }) },
        { id: "decrease-tiles", action: "Show fewer tiles", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "J"], macos: ["Ctrl", "Cmd", "J"] }) },
        { id: "minimize-video", action: "Minimize video", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "M"], macos: ["Ctrl", "Cmd", "M"] }) },
        { id: "announce-speaker", action: "Announce the current speaker", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "S"], macos: ["Ctrl", "Cmd", "S"] }) },
        { id: "announce-room", action: "Announce the meeting room", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "I"], macos: ["Ctrl", "Cmd", "I"] }) },
        { id: "reaction-hearing", action: "Show the reaction hearing control", keys: combo(platforms, ["Shift", "R"]) },
      ],
    },
  ],
};

export default googleMeet;
