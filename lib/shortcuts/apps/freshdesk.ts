import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const freshdesk: AppShortcuts = {
  slug: "freshdesk",
  name: "Freshdesk",
  category: "Support desk",
  platforms: [...platforms],
  intro:
    "Freshdesk splits its shortcut map by screen. These entries cover global navigation, ticket lists, selected tickets, and the ticket editor so support agents can move through a queue and reply without leaving the keyboard.",
  versionContext:
    "The current Freshdesk support reference covers Freshdesk Omni accounts and notes that accounts created before December 2025 may see a different shortcut set. Shortcuts must be enabled from Profile > Keyboard Shortcuts.",
  sourceUrl: "https://support.freshdesk.com/support/solutions/articles/186758-keyboard-shortcuts-in-freshdesk",
  sourceLabel: "official Freshdesk keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "global-navigation",
      title: "Global navigation",
      intro: "Use the two-key routes and search command to reach the main Freshdesk areas from anywhere in the app.",
      shortcuts: [
        { id: "go-dashboard", action: "Open Dashboard", keys: combo(platforms, ["G", "then", "D"]) },
        { id: "go-tickets", action: "Open Tickets", keys: combo(platforms, ["G", "then", "T"]) },
        { id: "go-social", action: "Open Social", keys: combo(platforms, ["G", "then", "E"]) },
        { id: "go-solutions", action: "Open Solutions", keys: combo(platforms, ["G", "then", "S"]) },
        { id: "go-forums", action: "Open Forums", keys: combo(platforms, ["G", "then", "F"]) },
        { id: "go-customers", action: "Open Customers", keys: combo(platforms, ["G", "then", "C"]) },
        { id: "go-reports", action: "Open Reports", keys: combo(platforms, ["G", "then", "R"]) },
        { id: "go-admin", action: "Open Admin", keys: combo(platforms, ["G", "then", "A"]) },
        { id: "new-ticket", action: "Create a new ticket", keys: combo(platforms, ["G", "then", "N"]) },
        { id: "new-outbound-email", action: "Compose an outbound email", keys: combo(platforms, ["G", "then", "M"]) },
        { id: "search", action: "Focus search", keys: combo(platforms, ["/"]) },
        { id: "shortcut-list", action: "Show the shortcut list", keys: combo(platforms, ["?"]) },
      ],
    },
    {
      id: "ticket-list",
      title: "Ticket list",
      intro: "Page through tickets, move between rows, and select records while the ticket list has focus.",
      shortcuts: [
        {
          id: "next-ticket-page",
          action: "Go to the next ticket page",
          keys: combo(platforms, ["Alt", "Right"], ["Option", "Right"]),
        },
        {
          id: "previous-ticket-page",
          action: "Go to the previous ticket page",
          keys: combo(platforms, ["Alt", "Left"], ["Option", "Left"]),
        },
        { id: "previous-ticket", action: "Move to the previous ticket", keys: combo(platforms, ["Up"]) },
        { id: "next-ticket", action: "Move to the next ticket", keys: combo(platforms, ["Down"]) },
        { id: "select-ticket", action: "Select the highlighted ticket", keys: combo(platforms, ["X"]) },
        { id: "open-views", action: "Open ticket views", keys: combo(platforms, ["V"]) },
        { id: "open-scenarios", action: "Open scenarios", keys: combo(platforms, ["S"]) },
      ],
    },
    {
      id: "ticket-actions",
      title: "Ticket actions",
      intro: "Open and move through a ticket, then reply, forward, add a note, or change its status from the ticket view.",
      shortcuts: [
        { id: "scroll-ticket", action: "Scroll the selected ticket", keys: combo(platforms, ["Space"]) },
        { id: "open-ticket", action: "Open the selected ticket", keys: combo(platforms, ["Enter"]) },
        { id: "next-conversation", action: "Open the next conversation", keys: combo(platforms, ["J"]) },
        { id: "previous-conversation", action: "Open the previous conversation", keys: combo(platforms, ["K"]) },
        { id: "reply", action: "Reply to the ticket", keys: combo(platforms, ["R"]) },
        { id: "forward", action: "Forward the ticket", keys: combo(platforms, ["F"]) },
        { id: "add-note", action: "Add a note", keys: combo(platforms, ["N"]) },
        { id: "watcher", action: "Manage watchers", keys: combo(platforms, ["W"]) },
        { id: "log-time", action: "Log time", keys: combo(platforms, ["M"]) },
        { id: "change-priority", action: "Change priority", keys: combo(platforms, ["P"]) },
        { id: "delete-ticket", action: "Delete the ticket", keys: combo(platforms, ["#"]) },
        { id: "close-ticket", action: "Close the ticket", keys: combo(platforms, ["~"]) },
        {
          id: "close-ticket-no-email",
          action: "Close the ticket without sending email",
          keys: combo(platforms, ["Alt", "~"], ["Option", "~"]),
        },
        { id: "mark-spam", action: "Mark the ticket as spam", keys: combo(platforms, ["!"]) },
        {
          id: "expand-conversations",
          action: "Expand ticket conversations",
          keys: combo(platforms, ["]"]),
        },
      ],
    },
    {
      id: "ticket-editor",
      title: "Ticket editor",
      intro: "Send a reply or choose a send status directly from the editor after composing a ticket response.",
      shortcuts: [
        {
          id: "send-reply",
          action: "Send the reply",
          keys: combo(platforms, ["Ctrl", "Enter"], ["Cmd", "Enter"]),
          note: "Freshdesk also documents Enter alone in the editor as a send command.",
        },
        {
          id: "send-status",
          action: "Open the send and status menu",
          keys: combo(platforms, ["Alt", "Ctrl", "Enter"], ["Option", "Cmd", "Enter"]),
        },
      ],
    },
  ],
};

export default freshdesk;
