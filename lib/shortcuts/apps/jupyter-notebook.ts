import { combo } from "../build.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos", "linux"] as const;

export const jupyterNotebook: AppShortcuts = {
  slug: "jupyter-notebook",
  name: "Jupyter Notebook",
  category: "Developer tools",
  platforms: [...platforms],
  versionContext:
    "Jupyter Notebook 7.6. For the full list, open Help > Keyboard Shortcuts in a running notebook.",
  sourceUrl: "https://jupyter-notebook.readthedocs.io/en/stable/notebook.html",
  sourceLabel: "Jupyter Notebook keyboard shortcuts",
  lastVerified: "2026-11-02",
  groups: [
    {
      id: "notebook-editing",
      title: "Notebook editing",
      intro: "Run a cell, switch the notebook between editing and command mode, and search the current page.",
      shortcuts: [
        { id: "run-cell", action: "Run the current cell", keys: combo(platforms, ["Shift", "Enter"]) },
        { id: "command-mode", action: "Switch to command mode", keys: combo(platforms, ["Esc"]) },
        { id: "edit-mode", action: "Switch to edit mode", keys: combo(platforms, ["Enter"]) },
        { id: "find", action: "Find in the notebook", keys: combo(platforms, ["Ctrl", "F"], ["Cmd", "F"]) },
      ],
    },
    {
      id: "kernel-control",
      title: "Kernel control",
      intro: "These command-mode sequences interrupt or restart the computational process behind the notebook.",
      shortcuts: [
        { id: "interrupt-kernel", action: "Interrupt the kernel", keys: combo(platforms, ["i", "i"]) },
        { id: "restart-kernel", action: "Restart the kernel", keys: combo(platforms, ["0", "0"]) },
      ],
    },
  ],
};

export default jupyterNotebook;
