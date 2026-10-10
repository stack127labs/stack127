import {
  ChartColumn,
  FileText,
  Gauge,
  Image,
  LayoutTemplate,
  ListFilter,
  MessageSquare,
  MousePointerClick,
  Pilcrow,
  Signpost,
  SlidersHorizontal,
  SquareStack,
  Table2,
  TextCursorInput,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type GallerySection = {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Shared components shown on the section page, in page order. */
  components: string[];
};

/**
 * The component library, grouped by what a component does, not by the page
 * family that first used it. A tool can use a directory card and a directory
 * can use a tool result, so every section is open to every page.
 */
export const gallerySections: GallerySection[] = [
  {
    slug: "text-and-choices",
    label: "Text and choices",
    description: "Fields for typing, searching, picking a date or time, and choosing from options.",
    icon: TextCursorInput,
    components: ["UiTextField", "UiSearchField", "UiTextArea", "UiSelect", "UiComboBox", "UiDatePicker", "UiTimeField", "UiDateTimePicker", "UiChoiceGroup", "UiMultiChoiceGroup", "UiCheckbox", "UiSwitch"],
  },
  {
    slug: "numbers-and-sliders",
    label: "Numbers and sliders",
    description: "Fields for counts, amounts with units, ranges, and levels.",
    icon: SlidersHorizontal,
    components: ["UiNumberField", "UiQuantityField", "UiQuantityInput", "UiSlider", "UiRangeSlider", "UiLevelSlider"],
  },
  {
    slug: "actions-and-forms",
    label: "Actions and forms",
    description: "Buttons, form validation, copy and download actions, repeated rows, and hidden settings.",
    icon: MousePointerClick,
    components: ["UiButton", "UiActionRow", "UiCopyAction", "UiDownloadAction", "UiRepeatableList", "UiDisclosure"],
  },
  {
    slug: "file-uploads",
    label: "File uploads",
    description: "A drop zone for any file type, and a list that shows each file's state.",
    icon: Upload,
    components: ["UiFileDropzone", "UiFileList"],
  },
  {
    slug: "filters-and-sorting",
    label: "Filters and sorting",
    description: "Search, sort, and filter groups for any long list of records.",
    icon: ListFilter,
    components: ["SortDropdown", "DirectoryCheckboxGroup", "DirectoryRadioGroup", "DirectoryTagSelectGroup", "DirectoryFilterController"],
  },
  {
    slug: "results",
    label: "Results",
    description: "The main answer, supporting numbers, status words, progress, steps, timelines, and generated output.",
    icon: Gauge,
    components: ["UiPrimaryResult", "UiResultLead", "UiMetricGroup", "UiKeyValueList", "UiStatusWord", "UiProgressBar", "UiAllocationBar", "UiSteps", "UiTimeline", "UiCodeOutput", "UiRawOutput"],
  },
  {
    slug: "tables",
    label: "Tables",
    description: "Data tables with row headers, content tables written in MDX, and a scroll frame for wide tables.",
    icon: Table2,
    components: ["UiDataTable", "ContentTable", "TableFrame"],
  },
  {
    slug: "charts",
    label: "Charts",
    description: "Line, area, bar, donut, scatter, and heatmap charts from data, in both themes, with the page weight they add.",
    icon: ChartColumn,
    components: ["UiChart", "UiStaticChart", "UiLiveChart"],
  },
  {
    slug: "cards",
    label: "Cards",
    description: "Linked page cards and record cards. Any page can list them.",
    icon: SquareStack,
    components: ["PageCard", "PageCardCounts", "ToolCard", "CatalogCard", "DirectoryCard", "AppFactCardContent", "DirectoryAppCard", "HardwareFactCardContent"],
  },
  {
    slug: "content",
    label: "Content",
    description: "Notes, warnings, tips, formulas, examples, terms, questions, and code.",
    icon: FileText,
    components: ["Callout", "Note", "Warning", "Tip", "ContentBlock", "Terms", "Term", "Faq", "CodeBlock"],
  },
  {
    slug: "prose",
    label: "Prose",
    description: "Reading text: headings, paragraphs, links, lists, quotes, inline code, and how blocks sit between them.",
    icon: Pilcrow,
    components: ["proseClassName", "proseFlowClassName", "proseSectionFlowClassName", "proseLedeClassName"],
  },
  {
    slug: "media-and-art",
    label: "Media and art",
    description: "Images, diagrams, marker art, and decorative doodles.",
    icon: Image,
    components: ["MediaFigure", "MarkerArt", "Doodle"],
  },
  {
    slug: "feedback-and-dialogs",
    label: "Feedback and dialogs",
    description: "Status messages, empty, loading, and error panels, and the detail drawer.",
    icon: MessageSquare,
    components: ["UiStatus", "StatePanel", "DetailDialog", "DetailDialogClose", "HiddenDetails"],
  },
  {
    slug: "navigation",
    label: "Navigation",
    description: "Page links for long lists and sidebar link lists.",
    icon: Signpost,
    components: ["Pagination", "SidebarList"],
  },
  {
    slug: "page-layout",
    label: "Page layout",
    description: "Page headers, title icons, the entry hero, page metadata, and brand pieces.",
    icon: LayoutTemplate,
    components: ["PageHeader", "PageTitleIcon", "CategoryIcon", "EntryHero", "PageMeta", "BrandWordmark", "ThemeToggle"],
  },
];

export function gallerySection(slug: string) {
  return gallerySections.find((section) => section.slug === slug) ?? null;
}
