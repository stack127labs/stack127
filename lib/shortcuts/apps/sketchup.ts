import { sameKeys } from "../types.ts";
import type { AppShortcuts } from "../types.ts";

const platforms = ["windows", "macos"] as const;
const key = (keys: string[]) => sameKeys([...platforms], keys);

export const sketchup: AppShortcuts = {
  slug: "sketchup",
  name: "SketchUp",
  category: "3D design",
  platforms: [...platforms],
  versionContext:
    "SketchUp's default keys on Windows and Mac. You can replace them with your own shortcuts.",
  sourceUrl: "https://help.sketchup.com/en/default-keyboard-shortcuts",
  sourceLabel: "SketchUp default keyboard shortcuts",
  lastVerified: "2026-11-02",
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
        { id: "orbit", action: "Orbit", keys: key(["O"]), note: "You can also click and drag." },
        { id: "pan", action: "Pan", keys: key(["H"]), note: "You can also hold Shift and click and drag." },
        { id: "zoom", action: "Zoom", keys: key(["Z"]), note: "You can also use the scroll wheel." },
        { id: "zoom-extents", action: "Zoom Extents", keys: key(["Shift", "Z"]) },
        { id: "image-igloo", action: "Image Igloo", keys: key(["I"]) },
        { id: "back-edges", action: "Back Edges", keys: key(["K"]) },
        { id: "search", action: "Search", keys: key(["Shift", "S"]) },
      ],
    },
  ],
};

export default sketchup;
