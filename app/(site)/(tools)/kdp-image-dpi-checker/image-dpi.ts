export const KDP_IMAGE_MAX_BYTES = 25 * 1024 * 1024;
export const KDP_IMAGE_MAX_PIXELS = 40_000_000;
export const KDP_IMAGE_MAX_AXIS = 20_000;

export type PrintUnit = "in" | "cm" | "mm";
export type ImageFormat = "JPEG" | "PNG";

export type StoredDensity = Readonly<{
  source: string;
  horizontalDpi: number | null;
  verticalDpi: number | null;
  unreadable?: boolean;
}>;

export type KdpImageHeader = Readonly<{
  format: ImageFormat;
  encodedWidth: number;
  encodedHeight: number;
  width: number;
  height: number;
  orientation: number;
  densities: readonly StoredDensity[];
  densityUnreadable: boolean;
  densityConflict: boolean;
}>;

export type KdpImageErrorCode = "unsupported-type" | "too-large" | "resource-limit" | "invalid-image" | "animated" | "invalid-orientation";

export class KdpImageError extends Error {
  code: KdpImageErrorCode;

  constructor(code: KdpImageErrorCode, message: string) {
    super(message);
    this.name = "KdpImageError";
    this.code = code;
  }
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;
const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function fail(code: KdpImageErrorCode, message: string): never {
  throw new KdpImageError(code, message);
}

function hasBytes(bytes: Uint8Array, offset: number, length: number) {
  return Number.isSafeInteger(offset) && Number.isSafeInteger(length) && offset >= 0 && length >= 0 && offset + length <= bytes.byteLength;
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function littleEndianTiff(bytes: Uint8Array) {
  if (bytes.byteLength < 8) throw new Error("Short TIFF header");
  const marker = ascii(bytes, 0, 2);
  if (marker !== "II" && marker !== "MM") throw new Error("Invalid TIFF byte order");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const littleEndian = marker === "II";
  const u16 = (offset: number) => {
    if (!hasBytes(bytes, offset, 2)) throw new Error("TIFF value is outside the metadata block");
    return view.getUint16(offset, littleEndian);
  };
  const u32 = (offset: number) => {
    if (!hasBytes(bytes, offset, 4)) throw new Error("TIFF value is outside the metadata block");
    return view.getUint32(offset, littleEndian);
  };

  if (u16(2) !== 42) throw new Error("Invalid TIFF marker");
  const directoryOffset = u32(4);
  if (directoryOffset < 8) throw new Error("Invalid TIFF directory offset");
  const entryCount = u16(directoryOffset);
  if (entryCount > 1024) throw new Error("TIFF directory is too large");
  const entriesStart = directoryOffset + 2;
  if (!hasBytes(bytes, entriesStart, entryCount * 12 + 4)) throw new Error("Truncated TIFF directory");

  const typeSizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
  const readEntryValues = (entryOffset: number, type: number, count: number) => {
    const unitSize = typeSizes[type];
    if (!unitSize || count < 1 || count > 1024) throw new Error("Invalid TIFF field type or count");
    const byteLength = unitSize * count;
    const valueOffset = byteLength <= 4 ? entryOffset + 8 : u32(entryOffset + 8);
    if (!hasBytes(bytes, valueOffset, byteLength)) throw new Error("TIFF field is outside the metadata block");
    const values: number[] = [];
    for (let index = 0; index < count; index += 1) {
      const offset = valueOffset + index * unitSize;
      if (type === 3) values.push(u16(offset));
      else if (type === 4) values.push(u32(offset));
      else values.push(Number.NaN);
    }
    return { values, valueOffset };
  };

  const orientations: number[] = [];
  let xResolution: number | null = null;
  let yResolution: number | null = null;
  let resolutionUnit: number | null = null;
  let sawXResolution = false;
  let sawYResolution = false;
  let sawResolutionUnit = false;
  let hasResolutionField = false;
  let densityUnreadable = false;

  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = entriesStart + index * 12;
    const tag = u16(entryOffset);
    const type = u16(entryOffset + 2);
    const count = u32(entryOffset + 4);

    if (tag !== 0x0112 && tag !== 0x011a && tag !== 0x011b && tag !== 0x0128) continue;
    if (tag === 0x011a || tag === 0x011b || tag === 0x0128) hasResolutionField = true;

    try {
      if (tag === 0x0112) {
        if (type !== 3 || count !== 1) throw new Error("Invalid TIFF orientation field");
        const { values } = readEntryValues(entryOffset, type, count);
        const value = values[0];
        if (value === undefined) throw new Error("Missing TIFF orientation value");
        orientations.push(value);
      } else if (tag === 0x011a || tag === 0x011b) {
        if (type !== 5 || count !== 1) throw new Error("Invalid TIFF resolution field");
        const { valueOffset } = readEntryValues(entryOffset, type, count);
        const numerator = u32(valueOffset);
        const denominator = u32(valueOffset + 4);
        const resolution = denominator === 0 ? null : numerator / denominator;
        if (tag === 0x011a) {
          if (sawXResolution && xResolution !== resolution) densityUnreadable = true;
          xResolution = resolution;
          sawXResolution = true;
        } else {
          if (sawYResolution && yResolution !== resolution) densityUnreadable = true;
          yResolution = resolution;
          sawYResolution = true;
        }
      } else {
        if (type !== 3 || count !== 1) throw new Error("Invalid TIFF resolution unit");
        const { values } = readEntryValues(entryOffset, type, count);
        const value = values[0] ?? null;
        if (sawResolutionUnit && resolutionUnit !== value) densityUnreadable = true;
        resolutionUnit = value;
        sawResolutionUnit = true;
      }
    } catch {
      if (tag === 0x0112) throw new Error("Unreadable TIFF orientation field");
      densityUnreadable = true;
    }
  }

  let horizontalDpi: number | null = null;
  let verticalDpi: number | null = null;
  if (hasResolutionField && xResolution !== null && yResolution !== null && xResolution > 0 && yResolution > 0) {
    const conversion = resolutionUnit === 2 ? 1 : resolutionUnit === 3 ? 2.54 : null;
    if (conversion !== null) {
      horizontalDpi = xResolution * conversion;
      verticalDpi = yResolution * conversion;
    }
  }

  return {
    orientations,
    density: hasResolutionField ? { source: "EXIF", horizontalDpi, verticalDpi, unreadable: densityUnreadable || undefined } : null,
    densityUnreadable,
  };
}

function convertDensity(value: number, unit: number) {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (unit === 1) return value;
  if (unit === 2) return value * 2.54;
  return null;
}

function pixelsPerMetreToDpi(value: number) {
  if (!Number.isFinite(value) || value <= 0) return null;
  return value * 0.0254;
}

function dimensions(encodedWidth: number, encodedHeight: number) {
  if (encodedWidth <= 0 || encodedHeight <= 0) fail("invalid-image", "The image header has zero dimensions.");
  if (encodedWidth > KDP_IMAGE_MAX_AXIS || encodedHeight > KDP_IMAGE_MAX_AXIS || encodedWidth * encodedHeight > KDP_IMAGE_MAX_PIXELS) {
    fail("resource-limit", "The image exceeds the local pixel limit.");
  }
}

function finishHeader(format: ImageFormat, encodedWidth: number, encodedHeight: number, orientationValues: number[], orientationUnreadable: boolean, densities: StoredDensity[], densityUnreadable: boolean): KdpImageHeader {
  dimensions(encodedWidth, encodedHeight);
  const uniqueOrientations = [...new Set(orientationValues)];
  if (orientationUnreadable || uniqueOrientations.some((value) => !Number.isInteger(value) || value < 1 || value > 8) || uniqueOrientations.length > 1) {
    fail("invalid-orientation", "The image has unreadable or conflicting orientation data.");
  }
  const orientation = uniqueOrientations[0] ?? 1;
  const swapsAxes = orientation >= 5 && orientation <= 8;
  const width = swapsAxes ? encodedHeight : encodedWidth;
  const height = swapsAxes ? encodedWidth : encodedHeight;
  const orientedDensities = densities.map((density) => swapsAxes ? {
    ...density,
    horizontalDpi: density.verticalDpi,
    verticalDpi: density.horizontalDpi,
  } : density);
  const knownDensities = orientedDensities.filter((density) => density.horizontalDpi !== null && density.verticalDpi !== null && !density.unreadable);
  const densityConflict = knownDensities.some((first, index) => knownDensities.slice(index + 1).some((second) =>
    Math.abs((first.horizontalDpi ?? 0) - (second.horizontalDpi ?? 0)) > 0.000001
    || Math.abs((first.verticalDpi ?? 0) - (second.verticalDpi ?? 0)) > 0.000001));
  return { format, encodedWidth, encodedHeight, width, height, orientation, densities: orientedDensities, densityUnreadable, densityConflict };
}

function readPng(bytes: Uint8Array): KdpImageHeader {
  let position: number = PNG_SIGNATURE.length;
  let encodedWidth = 0;
  let encodedHeight = 0;
  let hasHeader = false;
  let hasImageData = false;
  let hasEnd = false;
  let chunkCount = 0;
  const orientationValues: number[] = [];
  const densities: StoredDensity[] = [];
  let orientationUnreadable = false;
  let densityUnreadable = false;

  while (position < bytes.byteLength) {
    chunkCount += 1;
    if (chunkCount > 100_000 || !hasBytes(bytes, position, 12)) fail("invalid-image", "The PNG has a truncated or invalid chunk.");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const length = view.getUint32(position, false);
    const type = ascii(bytes, position + 4, 4);
    const dataStart = position + 8;
    if (length > bytes.byteLength || !hasBytes(bytes, dataStart, length + 4)) fail("invalid-image", "The PNG contains a truncated chunk.");
    const next = dataStart + length + 4;

    if (!hasHeader && type !== "IHDR") fail("invalid-image", "The PNG header is missing.");
    if (type === "IHDR") {
      if (hasHeader || length !== 13) fail("invalid-image", "The PNG header is invalid.");
      encodedWidth = view.getUint32(dataStart, false);
      encodedHeight = view.getUint32(dataStart + 4, false);
      const bitDepth = bytes[dataStart + 8];
      const colorType = bytes[dataStart + 9];
      const allowedDepths: Record<number, number[]> = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
      if (!allowedDepths[colorType]?.includes(bitDepth)) fail("invalid-image", "The PNG color type or bit depth is invalid.");
      if (bytes[dataStart + 10] !== 0 || bytes[dataStart + 11] !== 0 || bytes[dataStart + 12] > 1) fail("invalid-image", "The PNG header uses an unsupported compression, filter, or interlace method.");
      dimensions(encodedWidth, encodedHeight);
      hasHeader = true;
    } else if (type === "acTL") {
      fail("animated", "Animated PNG files are not supported. Export one still image as PNG.");
    } else if (type === "IDAT") {
      hasImageData = true;
    } else if (type === "pHYs") {
      if (length !== 9) {
        densityUnreadable = true;
        densities.push({ source: "PNG pHYs", horizontalDpi: null, verticalDpi: null, unreadable: true });
      } else {
        const unit = bytes[dataStart + 8];
        const x = view.getUint32(dataStart, false);
        const y = view.getUint32(dataStart + 4, false);
        densities.push({ source: "PNG pHYs", horizontalDpi: unit === 1 ? pixelsPerMetreToDpi(x) : null, verticalDpi: unit === 1 ? pixelsPerMetreToDpi(y) : null });
      }
    } else if (type === "eXIf") {
      try {
        const exif = littleEndianTiff(bytes.subarray(dataStart, dataStart + length));
        orientationValues.push(...exif.orientations);
        if (exif.density) densities.push({ ...exif.density, source: "PNG eXIf" });
        densityUnreadable ||= exif.densityUnreadable;
      } catch {
        orientationUnreadable = true;
        densityUnreadable = true;
        densities.push({ source: "PNG eXIf", horizontalDpi: null, verticalDpi: null, unreadable: true });
      }
    } else if (type === "IEND") {
      if (length !== 0) fail("invalid-image", "The PNG end marker is invalid.");
      hasEnd = true;
      break;
    }

    position = next;
  }

  if (!hasHeader || !hasImageData || !hasEnd) fail("invalid-image", "The PNG is truncated or does not contain image data.");
  if (!densities.length && !densityUnreadable) densities.push({ source: "Stored density", horizontalDpi: null, verticalDpi: null });
  return finishHeader("PNG", encodedWidth, encodedHeight, orientationValues, orientationUnreadable, densities, densityUnreadable);
}

function readJpeg(bytes: Uint8Array): KdpImageHeader {
  let position = 2;
  let encodedWidth = 0;
  let encodedHeight = 0;
  let sawEoi = false;
  let segmentCount = 0;
  const orientationValues: number[] = [];
  const densities: StoredDensity[] = [];
  let orientationUnreadable = false;
  let densityUnreadable = false;

  while (position < bytes.byteLength) {
    segmentCount += 1;
    if (segmentCount > 100_000 || bytes[position] !== 0xff) fail("invalid-image", "The JPEG has a truncated or invalid marker.");
    while (position < bytes.byteLength && bytes[position] === 0xff) position += 1;
    if (position >= bytes.byteLength) fail("invalid-image", "The JPEG ends inside a marker.");
    const marker = bytes[position];
    position += 1;

    if (marker === 0xd9) {
      sawEoi = true;
      break;
    }
    if (marker === 0x00) fail("invalid-image", "The JPEG contains an invalid marker.");
    if (marker === 0xd8) fail("invalid-image", "The JPEG contains an unexpected start marker.");
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (!hasBytes(bytes, position, 2)) fail("invalid-image", "The JPEG segment is truncated.");
    const segmentLength = (bytes[position] << 8) | bytes[position + 1];
    if (segmentLength < 2 || !hasBytes(bytes, position, segmentLength)) fail("invalid-image", "The JPEG contains an invalid segment length.");
    const dataStart = position + 2;
    const dataLength = segmentLength - 2;
    const dataEnd = position + segmentLength;

    if (SOF_MARKERS.has(marker)) {
      if (dataLength < 6) fail("invalid-image", "The JPEG frame header is truncated.");
      const height = (bytes[dataStart + 1] << 8) | bytes[dataStart + 2];
      const width = (bytes[dataStart + 3] << 8) | bytes[dataStart + 4];
      const componentCount = bytes[dataStart + 5];
      if (componentCount < 1 || dataLength < 6 + componentCount * 3) fail("invalid-image", "The JPEG frame header is invalid.");
      if ((encodedWidth && encodedWidth !== width) || (encodedHeight && encodedHeight !== height)) fail("invalid-image", "The JPEG contains conflicting frame dimensions.");
      encodedWidth = width;
      encodedHeight = height;
      dimensions(encodedWidth, encodedHeight);
    } else if (marker === 0xe0 && dataLength >= 5 && ascii(bytes, dataStart, 5) === "JFIF\0") {
      if (dataLength < 14) {
        densityUnreadable = true;
        densities.push({ source: "JPEG JFIF", horizontalDpi: null, verticalDpi: null, unreadable: true });
      } else {
        const unit = bytes[dataStart + 7];
        const x = (bytes[dataStart + 8] << 8) | bytes[dataStart + 9];
        const y = (bytes[dataStart + 10] << 8) | bytes[dataStart + 11];
        densities.push({ source: "JPEG JFIF", horizontalDpi: convertDensity(x, unit), verticalDpi: convertDensity(y, unit) });
      }
    } else if (marker === 0xe1 && dataLength >= 6 && ascii(bytes, dataStart, 6) === "Exif\0\0") {
      try {
        const exif = littleEndianTiff(bytes.subarray(dataStart + 6, dataEnd));
        orientationValues.push(...exif.orientations);
        if (exif.density) densities.push(exif.density);
        densityUnreadable ||= exif.densityUnreadable;
      } catch {
        orientationUnreadable = true;
        densityUnreadable = true;
        densities.push({ source: "EXIF", horizontalDpi: null, verticalDpi: null, unreadable: true });
      }
    }

    position = dataEnd;
    if (marker === 0xda) {
      let foundNextMarker = false;
      while (position < bytes.byteLength) {
        if (bytes[position] !== 0xff) {
          position += 1;
          continue;
        }
        const markerStart = position;
        position += 1;
        while (position < bytes.byteLength && bytes[position] === 0xff) position += 1;
        if (position >= bytes.byteLength) break;
        const scanMarker = bytes[position];
        if (scanMarker === 0x00 || (scanMarker >= 0xd0 && scanMarker <= 0xd7)) {
          position += 1;
          continue;
        }
        position = markerStart;
        foundNextMarker = true;
        break;
      }
      if (!foundNextMarker) fail("invalid-image", "The JPEG scan is truncated or has no end marker.");
    }
  }

  if (!sawEoi || encodedWidth === 0 || encodedHeight === 0) fail("invalid-image", "The JPEG is truncated or has no image dimensions.");
  if (!densities.length && !densityUnreadable) densities.push({ source: "Stored density", horizontalDpi: null, verticalDpi: null });
  return finishHeader("JPEG", encodedWidth, encodedHeight, orientationValues, orientationUnreadable, densities, densityUnreadable);
}

export function parseKdpImageBytes(bytes: Uint8Array): KdpImageHeader {
  if (bytes.byteLength > KDP_IMAGE_MAX_BYTES) fail("too-large", "The image exceeds the 25 MiB file limit.");
  if (bytes.byteLength >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return readJpeg(bytes);
  if (bytes.byteLength >= PNG_SIGNATURE.length && PNG_SIGNATURE.every((value, index) => bytes[index] === value)) return readPng(bytes);
  fail("unsupported-type", "Choose a JPEG or PNG image.");
}

export function toInches(value: number, unit: PrintUnit) {
  return unit === "cm" ? value / 2.54 : unit === "mm" ? value / 25.4 : value;
}

export function fromInches(value: number, unit: PrintUnit) {
  return unit === "cm" ? value * 2.54 : unit === "mm" ? value * 25.4 : value;
}

export function formatRawMeasurement(value: number) {
  const formatted = value.toFixed(12);
  return formatted.includes(".") ? formatted.replace(/0+$/, "").replace(/\.$/, "") : formatted;
}

export function formatPhysicalMeasurement(value: number, unit: PrintUnit) {
  const displayValue = fromInches(value, unit);
  const formatted = displayValue.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return { value: formatted, approximate: Math.abs(Number(formatted) - displayValue) > 1e-10 };
}

export function formatDpi(value: number) {
  const formatted = value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const rounded = Number(value.toFixed(2));
  const nearBoundary = value < 300 && rounded === 300 || value < 200 && rounded === 200;
  return `${formatted}${nearBoundary ? " (just below threshold)" : ""}`;
}

export type DimensionParse = Readonly<{ status: "blank" } | { status: "valid"; inches: number } | { status: "invalid"; reason: "format" | "range" }>;

export function parsePrintDimension(raw: string, unit: PrintUnit): DimensionParse {
  const trimmed = raw.trim();
  if (!trimmed) return { status: "blank" };
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) return { status: "invalid", reason: "format" };
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return { status: "invalid", reason: "format" };
  const inches = toInches(value, unit);
  if (!Number.isFinite(inches) || inches < 0.01 || inches > 200) return { status: "invalid", reason: "range" };
  return { status: "valid", inches };
}

export type PlacementResult = Readonly<{
  horizontalDpi: number;
  verticalDpi: number;
  controllingDpi: number;
  tone: "success" | "warning" | "danger";
  assessment: string;
  exceeds600Dpi: boolean;
  distorted: boolean;
  maximumWidthInches: number;
  maximumHeightInches: number;
}>;

export function calculatePlacement(image: Pick<KdpImageHeader, "width" | "height">, widthInches: number, heightInches: number): PlacementResult {
  const horizontalDpi = image.width / widthInches;
  const verticalDpi = image.height / heightInches;
  const controllingDpi = Math.min(horizontalDpi, verticalDpi);
  const tone = controllingDpi >= 300 ? "success" : controllingDpi >= 200 ? "warning" : "danger";
  const assessment = controllingDpi >= 300
    ? "Meets the 300-DPI resolution target at this size."
    : controllingDpi >= 200
      ? "Below the 300-DPI target."
      : "Low resolution by KDP's stated 200-DPI threshold.";
  const sourceRatio = image.width / image.height;
  const placementRatio = widthInches / heightInches;
  return {
    horizontalDpi,
    verticalDpi,
    controllingDpi,
    tone,
    assessment,
    exceeds600Dpi: horizontalDpi > 600 || verticalDpi > 600,
    distorted: Math.abs(placementRatio / sourceRatio - 1) > 0.001,
    maximumWidthInches: image.width / 300,
    maximumHeightInches: image.height / 300,
  };
}
