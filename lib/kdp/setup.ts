import {
  KDP_DPI_DEFAULT,
  KDP_HARDCOVER_HINGE_INCHES,
  KDP_HARDCOVER_WRAP_INCHES,
  KDP_PAPERBACK_COVER_BLEED_INCHES,
  KDP_SPEC_VERSION,
  bindingLabel,
  findKdpTrim,
  getKdpInsideMarginInches,
  getKdpInteriorOptions,
  getKdpOutsideMarginInches,
  getKdpPageLimit,
  getKdpPaperOptions as getPapers,
  getKdpSpineCoefficient,
  inchesToMillimeters,
  inchesToPixels,
  round,
  type KdpBinding,
  type KdpDirection,
  type KdpInterior,
  type KdpPaper,
  type KdpUnit,
} from "./specs.ts";

export type KdpSetupInput = Readonly<{
  binding: KdpBinding;
  trimId: string;
  pageCount: number;
  interior: KdpInterior;
  paper: KdpPaper;
  bleed: boolean;
  direction: KdpDirection;
  units: KdpUnit;
  dpi?: number;
}>;

export type KdpIssue = Readonly<{
  code: string;
  field?: string;
  severity: "warning" | "error";
  message: string;
}>;

export type KdpDimension = Readonly<{
  widthInches: number;
  heightInches: number;
  widthMillimeters: number;
  heightMillimeters: number;
  widthPixels: number;
  heightPixels: number;
}>;

export type KdpCoverSegment = Readonly<{
  label: string;
  widthInches: number;
}>;

export type KdpSetupValues = Readonly<{
  binding: KdpBinding;
  trimId: string;
  trimLabel: string;
  pageCount: number;
  effectivePageCount: number;
  interior: KdpInterior;
  paper: KdpPaper;
  bleed: boolean;
  direction: KdpDirection;
  units: KdpUnit;
  dpi: number;
  trim: KdpDimension;
  page: KdpDimension;
  margins: Readonly<{
    insideInches: number;
    outsideInches: number;
    topInches: number;
    bottomInches: number;
  }>;
  spine: Readonly<{
    widthInches: number;
    widthMillimeters: number;
    isEstimate: boolean;
  }>;
  segments: readonly KdpCoverSegment[];
  cover: KdpDimension & Readonly<{ isEstimate: boolean }>;
  eligibility: "eligible" | "ineligible";
  pageLimit: Readonly<{ min: number; max: number }>;
}>;

export type KdpSetupResult = Readonly<{
  status: "valid" | "invalid";
  values: KdpSetupValues | null;
  issues: readonly KdpIssue[];
}>;

function issue(code: string, message: string, severity: KdpIssue["severity"] = "error", field?: string): KdpIssue {
  return { code, field, severity, message };
}

function dimension(widthInches: number, heightInches: number, dpi: number): KdpDimension {
  return {
    widthInches: round(widthInches, 4),
    heightInches: round(heightInches, 4),
    widthMillimeters: inchesToMillimeters(widthInches),
    heightMillimeters: inchesToMillimeters(heightInches),
    widthPixels: inchesToPixels(widthInches, dpi),
    heightPixels: inchesToPixels(heightInches, dpi),
  };
}

export function getKdpSetupDefaults(): KdpSetupInput {
  return {
    binding: "paperback",
    trimId: "6x9",
    pageCount: 300,
    interior: "black-white",
    paper: "white",
    bleed: false,
    direction: "ltr",
    units: "in",
    dpi: KDP_DPI_DEFAULT,
  };
}

function getKdpPaperOptionsFromSpecs(binding: KdpBinding, interior: KdpInterior) {
  return getPapers(binding, interior);
}

export function calculateKdpSetup(input: KdpSetupInput): KdpSetupResult {
  const issues: KdpIssue[] = [];
  const add = (next: KdpIssue) => issues.push(next);
  const binding = input?.binding;
  if (binding !== "paperback" && binding !== "hardcover") add(issue("binding-invalid", "Choose paperback or hardcover.", "error", "binding"));

  const trim = typeof input?.trimId === "string" ? findKdpTrim(input.trimId) : null;
  if (!trim) add(issue("trim-invalid", "Choose a supported trim size.", "error", "trimId"));
  else if (binding === "hardcover" && !trim.hardcover) add(issue("trim-not-supported", "That trim is not available for hardcover.", "error", "trimId"));

  const pageCount = input?.pageCount;
  if (!Number.isSafeInteger(pageCount) || pageCount <= 0 || pageCount > 828) add(issue("page-count-invalid", "Enter a whole page count from 1 to 828.", "error", "pageCount"));
  if (input?.direction !== "ltr" && input?.direction !== "rtl") add(issue("direction-invalid", "Choose a reading direction.", "error", "direction"));
  if (input?.units !== "in" && input?.units !== "mm") add(issue("units-invalid", "Choose inches or millimeters.", "error", "units"));
  const dpi = input?.dpi ?? KDP_DPI_DEFAULT;
  if (!Number.isSafeInteger(dpi) || dpi < 72 || dpi > 600) add(issue("dpi-invalid", "Use a whole DPI value from 72 to 600.", "error", "dpi"));

  const interiorOptions = binding === "paperback" || binding === "hardcover" ? getKdpInteriorOptions(binding) : [];
  if (!interiorOptions.includes(input?.interior)) add(issue("interior-invalid", "Choose a supported interior type.", "error", "interior"));
  const paperOptions = (binding === "paperback" || binding === "hardcover") && interiorOptions.includes(input?.interior)
    ? getKdpPaperOptionsFromSpecs(binding, input.interior)
    : [];
  if (!paperOptions.includes(input?.paper)) add(issue("paper-not-supported", "That paper is not available for this interior.", "error", "paper"));
  if (typeof input?.bleed !== "boolean") add(issue("bleed-invalid", "Choose whether the interior has bleed.", "error", "bleed"));

  if (issues.some((next) => next.severity === "error") || !trim) return { status: "invalid", values: null, issues };

  const pageLimit = getKdpPageLimit(input.trimId, binding, input.interior, input.paper);
  if (!pageLimit) {
    add(issue("configuration-not-supported", "That trim, interior, and paper combination is not listed for this binding.", "error", "trimId"));
    return { status: "invalid", values: null, issues };
  }
  const effectivePageCount = pageCount + (pageCount % 2);
  const eligible = effectivePageCount >= pageLimit.min && effectivePageCount <= pageLimit.max;
  if (!eligible || pageCount < pageLimit.min || pageCount > pageLimit.max) {
    add(issue(
      pageCount < pageLimit.min || effectivePageCount < pageLimit.min ? "page-count-too-low" : "page-count-too-high",
      `${bindingLabel(binding)} supports ${pageLimit.min} to ${pageLimit.max} effective pages for this setup.`,
      "warning",
      "pageCount",
    ));
  }
  if (pageCount % 2 !== 0) add(issue("odd-page-count", "KDP rounds print page counts up to an even number.", "warning", "pageCount"));
  if (input.direction === "rtl") add(issue("rtl-limited", "KDP's documented RTL scope is limited to Hebrew, Yiddish, or Japanese paperback workflows.", "warning", "direction"));
  if (binding === "hardcover") add(issue("hardcover-cover-estimate", "Hardcover cover measurements are an estimate; confirm them with KDP's cover calculator.", "warning", "binding"));

  const bleedWidth = input.bleed ? KDP_PAPERBACK_COVER_BLEED_INCHES : 0;
  const bleedHeight = input.bleed ? KDP_PAPERBACK_COVER_BLEED_INCHES * 2 : 0;
  const page = dimension(trim.widthInches + bleedWidth, trim.heightInches + bleedHeight, dpi);
  const trimDimensions = dimension(trim.widthInches, trim.heightInches, dpi);
  const spineWidthInches = effectivePageCount * getKdpSpineCoefficient(input.interior, input.paper);
  const coverBleedWidth = KDP_PAPERBACK_COVER_BLEED_INCHES;
  const coverBleedHeight = KDP_PAPERBACK_COVER_BLEED_INCHES * 2;
  const coverWidthInches = binding === "paperback"
    ? trim.widthInches * 2 + spineWidthInches + coverBleedWidth * 2
    : trim.widthInches * 2 + spineWidthInches + KDP_HARDCOVER_WRAP_INCHES * 2 + KDP_HARDCOVER_HINGE_INCHES * 2;
  const coverHeightInches = binding === "paperback"
    ? trim.heightInches + coverBleedHeight
    : trim.heightInches + KDP_HARDCOVER_WRAP_INCHES * 2;
  const insideInches = getKdpInsideMarginInches(effectivePageCount);
  const outsideInches = getKdpOutsideMarginInches(input.bleed);
  const cover = dimension(coverWidthInches, coverHeightInches, dpi);
  const segmentBase: KdpCoverSegment[] = binding === "paperback"
    ? [
      { label: "Outer bleed", widthInches: coverBleedWidth },
      { label: "Back", widthInches: trim.widthInches },
      { label: "Spine", widthInches: spineWidthInches },
      { label: "Front", widthInches: trim.widthInches },
      { label: "Outer bleed", widthInches: coverBleedWidth },
    ]
    : [
      { label: "Outer wrap", widthInches: KDP_HARDCOVER_WRAP_INCHES },
      { label: "Back", widthInches: trim.widthInches },
      { label: "Hinge", widthInches: KDP_HARDCOVER_HINGE_INCHES },
      { label: "Spine estimate", widthInches: spineWidthInches },
      { label: "Hinge", widthInches: KDP_HARDCOVER_HINGE_INCHES },
      { label: "Front", widthInches: trim.widthInches },
      { label: "Outer wrap", widthInches: KDP_HARDCOVER_WRAP_INCHES },
    ];
  const segments = input.direction === "rtl"
    ? [segmentBase[0], ...segmentBase.slice(1, -1).reverse(), segmentBase.at(-1)!]
    : segmentBase;
  return {
    status: "valid",
    values: {
      binding,
      trimId: trim.id,
      trimLabel: trim.label,
      pageCount,
      effectivePageCount,
      interior: input.interior,
      paper: input.paper,
      bleed: input.bleed,
      direction: input.direction,
      units: input.units,
      dpi,
      trim: trimDimensions,
      page,
      margins: { insideInches: insideInches, outsideInches, topInches: outsideInches, bottomInches: outsideInches },
      spine: { widthInches: round(spineWidthInches, 4), widthMillimeters: inchesToMillimeters(spineWidthInches), isEstimate: binding === "hardcover" },
      segments: segments.map((segment) => ({ ...segment, widthInches: round(segment.widthInches, 4) })),
      cover: { ...cover, isEstimate: binding === "hardcover" },
      eligibility: eligible ? "eligible" : "ineligible",
      pageLimit,
    },
    issues,
  };
}

export const KDP_SETUP_VERSION = KDP_SPEC_VERSION;
