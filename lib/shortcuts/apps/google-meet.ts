import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const googleMeet: AppShortcuts = {
  slug: "google-meet",
  name: "Google Meet",
  category: "Video meetings",
  platforms: [...platforms],
  versionContext:
    "Windows and Mac keys differ. Press Shift+? in a meeting for the full list. The announce and reaction keys need a screen reader.",
  sourceUrl: "https://support.google.com/meet/answer/9298571?hl=en",
  sourceLabel: "official Google Meet keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "meeting-controls",
      title: "Meeting controls",
      intro: "Toggle the camera, microphone, captions, hand, participants, and chat while a call is active.",
      shortcuts: [
        { id: "camera", action: "Turn the camera on or off", keys: combo(platforms, ["Ctrl", "E"], ["Cmd", "E"]) },
        { id: "microphone", action: "Mute or unmute the microphone", keys: combo(platforms, ["Ctrl", "D"], ["Cmd", "D"]) },
        { id: "captions", action: "Show or hide captions", keys: platforms.map((platform) => ({ platform, keys: ["C"], alternatives: [["Shift", "C"]] })) },
        { id: "raise-hand", action: "Raise or lower your hand", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "H"], macos: ["Ctrl", "Cmd", "H"] }) },
        { id: "participants", action: "Show or hide participants", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "P"], macos: ["Ctrl", "Cmd", "P"] }) },
        { id: "chat", action: "Show or hide the meeting chat", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "C"], macos: ["Ctrl", "Cmd", "C"] }) },
        { id: "picture-in-picture", action: "Open picture-in-picture mode", keys: combo(platforms, ["Shift", "M"]) },
        { id: "push-to-talk", action: "Temporarily unmute while holding the key", keys: combo(platforms, ["Space"]) , note: "Push-to-talk must be enabled in Meet settings." },
      ],
    },
    {
      id: "presentation-and-layout",
      title: "Presentation and layout",
      intro: "Present, change the number of visible tiles, and minimize or announce meeting information from the call view.",
      shortcuts: [
        { id: "present", action: "Start presenting", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "T"], macos: ["Ctrl", "Cmd", "T"] }) },
        { id: "increase-tiles", action: "Show more tiles", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "K"], macos: ["Ctrl", "Cmd", "K"] }) },
        { id: "decrease-tiles", action: "Show fewer tiles", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "J"], macos: ["Ctrl", "Cmd", "J"] }) },
        { id: "minimize-video", action: "Minimize or expand your video", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "M"], macos: ["Ctrl", "Cmd", "M"] }) },
        { id: "announce-speaker", action: "Announce the current speaker", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "S"], macos: ["Ctrl", "Cmd", "S"] }), note: "Needs a screen reader." },
        { id: "announce-room", action: "Announce current room information", keys: perPlatform(platforms, { windows: ["Ctrl", "Alt", "I"], macos: ["Ctrl", "Cmd", "I"] }), note: "Needs a screen reader." },
        { id: "reaction-hearing", action: "Change how you hear reactions", keys: combo(platforms, ["Shift", "R"]), note: "Needs a screen reader." },
      ],
    },
  ],
};

export default googleMeet;
