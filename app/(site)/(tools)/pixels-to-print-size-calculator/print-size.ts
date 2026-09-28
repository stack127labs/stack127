export const PIXEL_MIN = 1;
export const PIXEL_MAX = 1_000_000;
export const RESOLUTION_MIN = 1;
export const RESOLUTION_MAX = 10_000;

export type ParseFailure = Readonly<{
  status: "invalid";
  reason: "missing" | "format" | "range";
}>;

export type ParseSuccess<T> = Readonly<{
  status: "valid";
  value: T;
}>;

export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

export type ParsedResolution = Readonly<{
  value: number;
  numerator: bigint;
  scale: bigint;
}>;

export type PrintSizeInput = Readonly<{
  widthPixels: number;
  heightPixels: number;
  resolution: ParsedResolution;
}>;

export type DimensionPair = Readonly<{
  width: number;
  height: number;
  displayWidth: string;
  displayHeight: string;
}>;

export type PrintSizeResult = Readonly<{
  inches: DimensionPair;
  centimeters: DimensionPair;
  millimeters: DimensionPair;
}>;

export function parsePixelDimension(raw: string): ParseResult<number> {
  const value = raw.trim();
  if (!value) return { status: "invalid", reason: "missing" };
  if (!/^\d+$/.test(value)) return { status: "invalid", reason: "format" };

  const parsed = BigInt(value);
  if (parsed < BigInt(PIXEL_MIN) || parsed > BigInt(PIXEL_MAX)) {
    return { status: "invalid", reason: "range" };
  }
  return { status: "valid", value: Number(parsed) };
}

export function parsePrintResolution(raw: string): ParseResult<ParsedResolution> {
  const value = raw.trim();
  if (!value) return { status: "invalid", reason: "missing" };
  if (!/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(value)) {
    return { status: "invalid", reason: "format" };
  }

  const [whole = "0", fraction = ""] = value.split(".");
  const scale = 10n ** BigInt(fraction.length);
  const numerator = BigInt((whole || "0") + fraction);
  if (numerator < scale || numerator > BigInt(RESOLUTION_MAX) * scale) {
    return { status: "invalid", reason: "range" };
  }

  return {
    status: "valid",
    value: {
      value: Number(numerator) / Number(scale),
      numerator,
      scale,
    },
  };
}

export function formatRoundedMeasurement(numerator: bigint, denominator: bigint): string {
  if (numerator < 0n || denominator <= 0n) throw new RangeError("Measurement must be nonnegative with a positive denominator.");
  const decimalPlaces = 10_000n;
  const scaled = numerator * decimalPlaces;
  let rounded = scaled / denominator;
  const remainder = scaled % denominator;
  if (remainder * 2n >= denominator) rounded += 1n;

  const whole = rounded / decimalPlaces;
  const fraction = (rounded % decimalPlaces).toString().padStart(4, "0").replace(/0+$/, "");
  return fraction ? whole.toString() + "." + fraction : whole.toString();
}

function pair(
  widthPixels: number,
  heightPixels: number,
  resolution: ParsedResolution,
  conversionNumerator: bigint,
  conversionDenominator: bigint,
  numericFactor: number,
): DimensionPair {
  const denominator = resolution.numerator * conversionDenominator;
  const widthNumerator = BigInt(widthPixels) * resolution.scale * conversionNumerator;
  const heightNumerator = BigInt(heightPixels) * resolution.scale * conversionNumerator;
  const factor = Number(resolution.scale) * numericFactor / Number(resolution.numerator);
  const width = widthPixels * factor;
  const height = heightPixels * factor;

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new RangeError("Calculated dimensions are not finite.");
  }

  return {
    width,
    height,
    displayWidth: formatRoundedMeasurement(widthNumerator, denominator),
    displayHeight: formatRoundedMeasurement(heightNumerator, denominator),
  };
}

export function calculatePrintSize({ widthPixels, heightPixels, resolution }: PrintSizeInput): PrintSizeResult {
  if (!Number.isInteger(widthPixels) || widthPixels < PIXEL_MIN || widthPixels > PIXEL_MAX) {
    throw new RangeError("Pixel width is outside the supported range.");
  }
  if (!Number.isInteger(heightPixels) || heightPixels < PIXEL_MIN || heightPixels > PIXEL_MAX) {
    throw new RangeError("Pixel height is outside the supported range.");
  }
  if (
    !Number.isFinite(resolution.value)
    || resolution.value < RESOLUTION_MIN
    || resolution.value > RESOLUTION_MAX
    || resolution.numerator <= 0n
    || resolution.scale <= 0n
  ) {
    throw new RangeError("Print resolution is outside the supported range.");
  }

  return {
    inches: pair(widthPixels, heightPixels, resolution, 1n, 1n, 1),
    centimeters: pair(widthPixels, heightPixels, resolution, 254n, 100n, 2.54),
    millimeters: pair(widthPixels, heightPixels, resolution, 254n, 10n, 25.4),
  };
}

export function formatResolution(resolution: ParsedResolution): string {
  return String(resolution.value);
}
