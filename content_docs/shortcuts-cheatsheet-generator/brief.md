# Brief: shortcuts cheat sheet generator (/shortcuts-cheatsheet-generator)

## Who is here

Someone who already uses two or three apps from the shortcuts reference and wants one printed page on the desk instead of five browser tabs. They pick their apps, pick their platform, and print.

## The job

Produce a clean printable cheat sheet containing exactly the apps, platforms, and task groups they chose, and nothing else. The artifact is the product; the controls are scaffolding around it.

## Show vs say

- Controls: one full-width workbench band. App checkboxes, a platform radio row per multi-platform app, group checkboxes per selected app, and one primary Print button that calls window.print().
- Preview: a real, live rendering of the printed sheet inside the workbench, styled like paper regardless of site theme. What you see is what prints.
- Print CSS hides every control and prints only the sheet.
- Page content: a concise introduction before the tool, a short server-rendered guide after it, and app names with the words "keyboard shortcuts" in the printable sheet. The guide explains how to choose a useful set, what the sheet includes, what it leaves out, and where to continue.
- Engine stays pure TypeScript in lib/shortcuts: selection in, document out, unit tested. React only renders the document.

## Coverage map

| User question | Where it is answered | Medium | Evidence |
| --- | --- | --- | --- |
| What is this tool for? | Page introduction | Two short paragraphs | Generator route and `buildCheatSheet` contract |
| Which choices matter? | Tool controls and guide | Inputs plus prose | App, platform, and group selection in the client tool |
| What will print? | Live sheet preview | Paper-like rendered document | `data-print-root` and print CSS |
| How should I choose a useful sheet? | Guide section after the tool | Practical prose | Shortcut group and platform data |
| How do I identify each app on paper? | Sheet title and app section headings | Printed heading hierarchy | Selected app records |
| What does the generator leave out? | Guide limitations section | Short prose | Empty key bindings and configurable app keymaps |
| What should I do next? | Guide closing link | Internal link | `/shortcuts` reference directory |

## Non-goals

No accounts, no email, no payment, no server-side PDF generation, no custom branding options. Browser printing handles the first version.
