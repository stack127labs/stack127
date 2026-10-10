import { perPlatform } from "../build.ts";
import type { AppShortcuts, Shortcut } from "../types.ts";

const platforms = ["windows", "macos"] as const;

const dual = (id: string, action: string, windows: string[], macos: string[], note?: string): Shortcut => ({
  id,
  action,
  keys: perPlatform(platforms, { windows, macos }),
  ...(note ? { note } : {}),
});

const same = (id: string, action: string, keys: string[], note?: string): Shortcut => dual(id, action, keys, keys, note);

export const quickbooksOnline: AppShortcuts = {
  slug: "quickbooks-online",
  name: "QuickBooks Online",
  category: "Accounting",
  platforms: [...platforms],
  versionContext:
    "Intuit's QuickBooks Help article was updated August 28, 2026 and checked September 1, 2026. The article covers Internet Explorer, Firefox, and Chrome, with Mac substitutions where Intuit documents them. The in-product reference opens with Control+Option+Question mark on Mac.",
  sourceUrl: "https://quickbooks.intuit.com/learn-support/en-us/help-article/product-setup/keyboard-shortcuts-quickbooks-online/L49aUqVh2_US_en_US",
  sourceLabel: "official QuickBooks Online keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "browser-and-help",
      title: "Browser and help",
      intro: "Open another browser window, find text, and show the QuickBooks Online shortcut reference from the current help article.",
      shortcuts: [
        { id: "new-window", action: "Open a second browser window", keys: [{ platform: "windows", keys: ["Ctrl", "N"] }] },
        dual("find", "Find text in the window", ["Ctrl", "F"], ["Cmd", "F"]),
        dual("shortcut-guide", "Open the in-product shortcut guide", ["Ctrl", "Alt", "?"], ["Control", "Option", "?"]),
      ],
    },
    {
      id: "date-fields",
      title: "Date fields",
      intro: "Use these single-key commands while a QuickBooks date field is active to move to common calendar positions.",
      shortcuts: [
        same("next-day", "Go to the next day", ["+"]),
        same("previous-day", "Go to the previous day", ["-"]),
        same("today", "Go to today", ["T"]),
        same("first-week", "Go to the first day of the week", ["W"]),
        same("last-week", "Go to the last day of the week", ["K"]),
        same("first-month", "Go to the first day of the month", ["M"]),
        same("last-month", "Go to the last day of the month", ["H"]),
        same("first-year", "Go to the first day of the year", ["Y"]),
        same("last-year", "Go to the last day of the year", ["R"]),
        dual("open-calendar", "Open the date field calendar", ["Alt", "Down Arrow"], ["Option", "Down Arrow"]),
      ],
    },
    {
      id: "forms-and-dropdowns",
      title: "Forms and dropdowns",
      intro: "Move through form fields, select checkboxes, and choose entries from QuickBooks dropdown lists with these documented keys.",
      shortcuts: [
        same("next-field", "Move to the next field", ["Tab"]),
        same("previous-field", "Move to the previous field", ["Shift", "Tab"]),
        same("check-box", "Check a checkbox field", ["Space"]),
        dual("open-dropdown", "Open a dropdown list", ["Alt", "Down Arrow"], ["Option", "Down Arrow"]),
        same("move-dropdown", "Move through dropdown items", ["Up Arrow"], "Down Arrow moves forward through the list."),
        same("move-dropdown-down", "Move down through dropdown items", ["Down Arrow"]),
        dual("scroll-field-up", "Scroll up through a text-box list", ["Ctrl", "Up Arrow"], ["Cmd", "Up Arrow"]),
        dual("scroll-field-down", "Scroll down through a text-box list", ["Ctrl", "Down Arrow"], ["Cmd", "Down Arrow"]),
      ],
    },
    {
      id: "forms-and-transactions",
      title: "Forms and transactions",
      intro: "Save or edit forms and transactions, adjust reference numbers, and move between rows in an account register.",
      shortcuts: [
        {
          id: "save-form",
          action: "Save a form",
          keys: [
            { platform: "windows", keys: ["Alt", "S"], alternatives: [["Alt", "Shift", "S"]] },
            { platform: "macos", keys: ["Option", "Control", "S"] },
          ],
          note: "The Alt+Shift+S alternative is for Firefox and Chrome on Windows; Intuit lists Option+Control+S for Mac users there.",
        },
        dual("save-transaction", "Save a selected transaction", ["Alt", "S"], ["Option", "Control", "S"], "Firefox and Chrome use Alt+Shift+S on Windows."),
        dual("edit-transaction", "Edit a saved transaction", ["Alt", "E"], ["Option", "E"]),
        same("increase-reference", "Increase the reference number", ["+"]),
        same("decrease-reference", "Decrease the reference number", ["-"]),
        same("print-reference", "Enter To Print in the reference field", ["T"], "The source limits this to the Check, Bill Payment, and Paycheck reference fields."),
        same("register-up", "Select the transaction above", ["Up Arrow"]),
        same("register-down", "Select the transaction below", ["Down Arrow"]),
      ],
    },
    {
      id: "register-and-payroll",
      title: "Register and payroll",
      intro: "Adjust print alignment, choose a register transaction type, move through journal entry lines, and open payroll.",
      shortcuts: [
        same("raise-print-alignment", "Raise print alignment", ["Numpad +"], "Use the numeric keypad while the Vertical or Horizontal alignment field is selected."),
        same("lower-print-alignment", "Lower print alignment", ["Numpad -"], "Use the numeric keypad while the Vertical or Horizontal alignment field is selected."),
        same("transaction-type-field", "Select the transaction type field", ["Shift", "Tab"]),
        dual("journal-line-up", "Move to the journal entry line above", ["Up Arrow"], ["Up Arrow"]),
        dual("journal-line-down", "Move to the journal entry line below", ["Down Arrow"], ["Down Arrow"]),
        dual("run-payroll", "Run payroll", ["Ctrl", "Alt", "U"], ["Control", "Option", "U"]),
      ],
    },
  ],
};

export default quickbooksOnline;
