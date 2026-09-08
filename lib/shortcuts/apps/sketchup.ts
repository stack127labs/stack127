import { sameKeys } from "../types.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;
const key = (keys: string[]) => sameKeys([...platforms], keys);

export const sketchup: AppShortcuts = {
  slug: "sketchup",
  name: "SketchUp",
  category: "3D design",
  platforms: [...platforms],
  intro:
    "SketchUp's current default shortcut table covers the direct tool keys used for selection, drawing, modeling, and camera control. These entries apply to the Windows and Mac desktop defaults.",
  versionContext:
    "SketchUp default keyboard shortcuts checked September 1, 2026. The official help page was updated August 31, 2026 and notes that custom shortcuts can replace these defaults.",
  sourceUrl: "https://help.sketchup.com/en/default-keyboard-shortcuts",
  sourceLabel: "official SketchUp default keyboard shortcuts",
  lastVerified: "2026-09-01",
  groups: [
    {
      id: "selection-and-drawing",
      title: "Selection and drawing",
      intro: "Selection and drawing keys switch the active tool without opening a toolbar, which keeps common modeling actions close to the cursor.",
      shortcuts: [
        { id: "select", action: "Select", keys: key(["Space"]) },
        { id: "lasso", action: "Lasso Select", keys: key(["Shift", "Space"]) },
        { id: "paint-bucket", action: "Paint Bucket", keys: key(["B"]) },
        { id: "eraser", action: "Eraser", keys: key(["E"]) },
        { id: "line", action: "Line", keys: key(["L"]) },
        { id: "rectangle", action: "Rectangle", keys: key(["R"]) },
        { id: "circle", action: "Circle", keys: key(["C"]) },
        { id: "arc", action: "2 Point Arc", keys: key(["A"]) },
      ],
    },
    {
      id: "modeling",
      title: "Modeling tools",
      intro: "Modeling tool keys activate the transforms and construction tools used to turn drawn geometry into a structured model.",
      shortcuts: [
        { id: "move", action: "Move", keys: key(["M"]) },
        { id: "push-pull", action: "Push/Pull", keys: key(["P"]) },
        { id: "rotate", action: "Rotate", keys: key(["Q"]) },
        { id: "scale", action: "Scale", keys: key(["S"]) },
        { id: "offset", action: "Offset", keys: key(["F"]) },
        { id: "tape-measure", action: "Tape Measure", keys: key(["T"]) },
        { id: "make-component", action: "Make Component", keys: key(["G"]) },
      ],
    },
    {
      id: "view-and-search",
      title: "View and search",
      intro: "View and search shortcuts change the camera, reveal hidden edge states, and find tools or commands in the current SketchUp workspace.",
      shortcuts: [
        { id: "orbit", action: "Orbit", keys: key(["O"]), note: "The official table also documents click and drag for Orbit." },
        { id: "pan", action: "Pan", keys: key(["H"]), note: "The official table also documents Shift plus click and drag for Pan." },
        { id: "zoom", action: "Zoom", keys: key(["Z"]), note: "The official table also documents the scroll wheel for Zoom." },
        { id: "zoom-extents", action: "Zoom Extents", keys: key(["Shift", "Z"]) },
        { id: "image-igloo", action: "Image Igloo", keys: key(["I"]) },
        { id: "back-edges", action: "Back Edges", keys: key(["K"]) },
        { id: "search", action: "Search", keys: key(["Shift", "S"]) },
      ],
    },
  ],
};

export default sketchup;
