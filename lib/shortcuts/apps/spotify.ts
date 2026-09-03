import { combo, perPlatform } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

export const spotify: AppShortcuts = {
  slug: "spotify",
  name: "Spotify",
  category: "Music streaming",
  platforms: [...platforms],
  intro:
    "Spotify's current desktop support page lists shortcuts for search, playback, library navigation, sidebars, and queue actions. The table below keeps its Mac and Windows differences explicit.",
  versionContext:
    "Spotify desktop and web player shortcuts checked September 1, 2026. Spotify says the app can show the full in-app list, so this record contains the stable actions published in the support article.",
  sourceUrl: "https://support.spotify.com/na-en/article/keyboard-shortcuts/",
  sourceLabel: "official Spotify keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "search-and-navigation",
      title: "Search and navigation",
      intro: "Search and navigation shortcuts reach help, library sections, preferences, and the sidebars without opening the mouse menus.",
      shortcuts: [
        { id: "open-help", action: "Open Help", keys: combo(platforms, ["Ctrl", "/"], ["Cmd", "/"]) },
        { id: "open-search", action: "Open Search", keys: combo(platforms, ["Ctrl", "K"], ["Cmd", "K"]) },
        { id: "select-all", action: "Select all", keys: combo(platforms, ["Ctrl", "A"], ["Cmd", "A"]) },
        { id: "filter", action: "Filter", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
        { id: "library", action: "Go to Library", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "0"], macos: ["Alt", "Shift", "0"] }) },
        { id: "playlists", action: "Go to Playlists", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "1"], macos: ["Alt", "Shift", "1"] }) },
        { id: "podcasts", action: "Go to Podcasts", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "2"], macos: ["Alt", "Shift", "2"] }) },
        { id: "artists", action: "Go to Artists", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "3"], macos: ["Alt", "Shift", "3"] }) },
        { id: "albums", action: "Go to Albums", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "4"], macos: ["Alt", "Shift", "4"] }) },
        { id: "audiobooks", action: "Go to Audiobooks", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "5"], macos: ["Alt", "Shift", "5"] }) },
        { id: "home", action: "Go to Home", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "H"], macos: ["Alt", "Shift", "H"] }) },
        { id: "preferences", action: "Go to Preferences", keys: combo(platforms, ["Ctrl", ","], ["Cmd", ","]) },
        { id: "search-view", action: "Go to Search view", keys: perPlatform(platforms, { windows: ["Ctrl", "L"], macos: ["Cmd", "Shift", "L"] }) },
        { id: "now-playing", action: "Go to Now Playing", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "J"], macos: ["Alt", "Shift", "J"] }) },
        { id: "queue", action: "Go to Queue", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "Q"], macos: ["Alt", "Shift", "Q"] }) },
        { id: "now-playing-sidebar", action: "Toggle the Now Playing sidebar", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "R"], macos: ["Alt", "Shift", "R"] }) },
        { id: "library-sidebar", action: "Toggle the Your Library sidebar", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "L"], macos: ["Alt", "Shift", "L"] }) },
      ],
    },
    {
      id: "playback",
      title: "Playback",
      intro: "Playback shortcuts control the current track, repeat or shuffle state, volume, and library or queue actions.",
      shortcuts: [
        { id: "play-pause", action: "Play or pause", keys: perPlatform(platforms, { windows: ["Space"], macos: ["Space"] }) },
        { id: "shuffle", action: "Toggle Shuffle", keys: perPlatform(platforms, { windows: ["Ctrl", "S"], macos: ["Alt", "S"] }) },
        { id: "repeat", action: "Toggle Repeat", keys: perPlatform(platforms, { windows: ["Ctrl", "R"], macos: ["Alt", "R"] }) },
        { id: "mute", action: "Mute or unmute", keys: perPlatform(platforms, { windows: ["M"], macos: ["M"] }) },
        { id: "previous", action: "Go to the previous item", keys: perPlatform(platforms, { windows: ["Up"], macos: ["Up"] }) },
        { id: "next", action: "Go to the next item", keys: perPlatform(platforms, { windows: ["Down"], macos: ["Down"] }) },
        { id: "add-library", action: "Add to Library", keys: perPlatform(platforms, { windows: ["Left"], macos: ["Left"] }) },
        { id: "add-queue", action: "Add to Queue", keys: perPlatform(platforms, { windows: ["Right"], macos: ["Right"] }) },
        { id: "context-menu", action: "Open the context menu", keys: perPlatform(platforms, { windows: ["Alt", "J"], macos: ["Alt", "J"] }) },
        { id: "liked-songs", action: "Go to Liked Songs", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "S"], macos: ["Alt", "Shift", "S"] }) },
        { id: "made-for-you", action: "Go to Made For You", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "M"], macos: ["Alt", "Shift", "M"] }) },
        { id: "new-releases", action: "Go to New Releases", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "N"], macos: ["Alt", "Shift", "N"] }) },
        { id: "charts", action: "Go to Charts", keys: perPlatform(platforms, { windows: ["Alt", "Shift", "C"], macos: ["Alt", "Shift", "C"] }) },
      ],
    },
  ],
};

export default spotify;
