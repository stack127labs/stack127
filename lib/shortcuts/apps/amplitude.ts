import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;
const shared = (items: Array<[string, string, string[], string?]>): Shortcut[] =>
  items.map(([id, action, combination, note]) => ({
    id,
    action,
    keys: platforms.map((platform) => ({ platform, keys: combination })),
    ...(note ? { note } : {}),
  }));

export const amplitude: AppShortcuts = {
  slug: "amplitude",
  name: "Amplitude",
  category: "Product analytics",
  platforms: [...platforms],
  versionContext:
    "These work on chart creation pages for all chart types except Data Tables. Amplitude gives one set of keys, shown for Windows and macOS.",
  sourceUrl: "https://amplitude.com/docs/analytics/charts/chart-basics#keyboard-shortcuts",
  sourceLabel: "Amplitude chart basics keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "chart-definition",
      title: "Chart definition and selectors",
      intro:
        "Open the event, filter, or group selector and use the keyboard to add hovered events, properties, and property values to the current chart definition.",
      shortcuts: shared([
        ["event", "Open event quick select", ["Shift", "E"]],
        ["filter", "Open the event filter selector", ["Shift", "F"], "Does nothing when the chart definition has no events. With several event blocks, it opens the property dropdown for the last event."],
        ["group", "Open the group-by selector", ["Shift", "G"], "Does nothing when the chart definition has no events. With several event blocks, it opens the property dropdown for the last event."],
        ["add-hovered", "Add the hovered event or property to the chart definition", ["Return"]],
        ["toggle-value", "Select or deselect the hovered property value", ["Space"]],
      ]),
    },
    {
      id: "chart-actions",
      title: "Refresh, save, copy, and organize charts",
      intro:
        "Run common chart-level actions from the creation page, including refresh, save, duplicate, copy URL, add to a collection, and start a new chart.",
      shortcuts: shared([
        ["refresh", "Refresh the chart's source data", ["Shift", "R"]],
        ["save", "Save the chart", ["Shift", "S"], "A new chart opens the Save Chart modal. An existing chart saves without confirmation."],
        ["copy", "Copy the chart into a new tab", ["Shift", "D"], "Does nothing when the chart is new and unsaved."],
        ["copy-url", "Copy the chart URL", ["Shift", "U"]],
        ["add-to", "Open Add to for the current chart", ["Shift", "T"]],
        ["new-chart", "Create a new chart", ["Shift", "N"]],
        ["shortcut-modal", "Show or hide the keyboard-shortcut modal", ["Shift", "?"]],
      ]),
    },
  ],
};

export default amplitude;
