export type ChmodBits = Readonly<{
  setuid: boolean;
  setgid: boolean;
  sticky: boolean;
  ownerRead: boolean;
  ownerWrite: boolean;
  ownerExecute: boolean;
  groupRead: boolean;
  groupWrite: boolean;
  groupExecute: boolean;
  othersRead: boolean;
  othersWrite: boolean;
  othersExecute: boolean;
}>;

export type ChmodClassRow = Readonly<{
  id: "owner" | "group" | "others";
  label: "Owner" | "Group" | "Others";
  digit: string;
  calculation: string;
}>;

export type ChmodValidResult = Readonly<{
  status: "valid";
  mode: number;
  octal: string;
  symbolic: string;
  bits: ChmodBits;
  classRows: readonly ChmodClassRow[];
  specialBits: Readonly<{ setuid: boolean; setgid: boolean; sticky: boolean }>;
  activeSpecialBits: readonly string[];
  specialContext: readonly string[];
  othersWrite: boolean;
  context: readonly string[];
  command: string;
}>;

export type ChmodInvalidResult = Readonly<{
  status: "invalid";
  field: "octal";
  raw: string;
  message: string;
}>;

export type ChmodCalculationResult = ChmodValidResult | ChmodInvalidResult;

export const DEFAULT_CHMOD_BITS: ChmodBits = Object.freeze({
  setuid: false,
  setgid: false,
  sticky: false,
  ownerRead: true,
  ownerWrite: true,
  ownerExecute: false,
  groupRead: true,
  groupWrite: false,
  groupExecute: false,
  othersRead: true,
  othersWrite: false,
  othersExecute: false,
});

const BIT_KEYS: readonly (keyof ChmodBits)[] = [
  "setuid",
  "setgid",
  "sticky",
  "ownerRead",
  "ownerWrite",
  "ownerExecute",
  "groupRead",
  "groupWrite",
  "groupExecute",
  "othersRead",
  "othersWrite",
  "othersExecute",
];

const CLASS_DEFINITIONS = [
  { id: "owner", label: "Owner", read: "ownerRead", write: "ownerWrite", execute: "ownerExecute", shift: 6 },
  { id: "group", label: "Group", read: "groupRead", write: "groupWrite", execute: "groupExecute", shift: 3 },
  { id: "others", label: "Others", read: "othersRead", write: "othersWrite", execute: "othersExecute", shift: 0 },
] as const;

function isChmodBits(value: unknown): value is ChmodBits {
  if (!value || typeof value !== "object") return false;
  return BIT_KEYS.every((key) => typeof (value as Record<string, unknown>)[key] === "boolean");
}

function assertMode(mode: number) {
  if (!Number.isInteger(mode) || mode < 0 || mode > 0o7777) throw new RangeError("chmod mode must be an integer from 0 through 4095");
}

function digitFor(read: boolean, write: boolean, execute: boolean) {
  return (read ? 4 : 0) + (write ? 2 : 0) + (execute ? 1 : 0);
}

function calculationFor(read: boolean, write: boolean, execute: boolean) {
  const weights = [read ? "4" : null, write ? "2" : null, execute ? "1" : null].filter((weight): weight is string => Boolean(weight));
  return weights.length ? weights.join(" + ") : "0";
}

export function parseOctalMode(raw: string): { status: "valid"; mode: number } | ChmodInvalidResult {
  if (typeof raw !== "string") return { status: "invalid", field: "octal", raw: String(raw), message: "Use 1 to 4 digits from 0 to 7." };
  const trimmed = raw.trim();
  if (!trimmed) return { status: "invalid", field: "octal", raw, message: "Enter an octal mode." };
  if (!/^[0-7]{1,4}$/.test(trimmed)) return { status: "invalid", field: "octal", raw, message: "Use 1 to 4 digits from 0 to 7." };
  return { status: "valid", mode: Number.parseInt(trimmed, 8) };
}

export function modeFromBits(bits: ChmodBits) {
  if (!isChmodBits(bits)) throw new TypeError("chmod bits must contain twelve boolean values");
  const special = (bits.setuid ? 4 : 0) + (bits.setgid ? 2 : 0) + (bits.sticky ? 1 : 0);
  const owner = digitFor(bits.ownerRead, bits.ownerWrite, bits.ownerExecute);
  const group = digitFor(bits.groupRead, bits.groupWrite, bits.groupExecute);
  const others = digitFor(bits.othersRead, bits.othersWrite, bits.othersExecute);
  return special * 512 + owner * 64 + group * 8 + others;
}

export function bitsFromMode(mode: number): ChmodBits {
  assertMode(mode);
  return {
    setuid: Boolean(mode & 0o4000),
    setgid: Boolean(mode & 0o2000),
    sticky: Boolean(mode & 0o1000),
    ownerRead: Boolean(mode & 0o400),
    ownerWrite: Boolean(mode & 0o200),
    ownerExecute: Boolean(mode & 0o100),
    groupRead: Boolean(mode & 0o40),
    groupWrite: Boolean(mode & 0o20),
    groupExecute: Boolean(mode & 0o10),
    othersRead: Boolean(mode & 0o4),
    othersWrite: Boolean(mode & 0o2),
    othersExecute: Boolean(mode & 0o1),
  };
}

export function formatOctalMode(mode: number) {
  assertMode(mode);
  return mode.toString(8).padStart(4, "0");
}

function executeChar(execute: boolean, special: boolean, lower: string, upper: string) {
  if (execute && special) return lower;
  if (!execute && special) return upper;
  return execute ? "x" : "-";
}

export function formatSymbolicMode(bits: ChmodBits) {
  if (!isChmodBits(bits)) throw new TypeError("chmod bits must contain twelve boolean values");
  return [
    bits.ownerRead ? "r" : "-",
    bits.ownerWrite ? "w" : "-",
    executeChar(bits.ownerExecute, bits.setuid, "s", "S"),
    bits.groupRead ? "r" : "-",
    bits.groupWrite ? "w" : "-",
    executeChar(bits.groupExecute, bits.setgid, "s", "S"),
    bits.othersRead ? "r" : "-",
    bits.othersWrite ? "w" : "-",
    executeChar(bits.othersExecute, bits.sticky, "t", "T"),
  ].join("");
}

function specialContext(bits: ChmodBits) {
  const context: string[] = [];
  if (bits.setuid) context.push(`Setuid is set. Owner execute is ${bits.ownerExecute ? "set" : "not set"}, so the notation uses ${bits.ownerExecute ? "lowercase s" : "uppercase S"}.`);
  if (bits.setgid) context.push(`Setgid is set. Group execute is ${bits.groupExecute ? "set" : "not set"}, so the notation uses ${bits.groupExecute ? "lowercase s" : "uppercase S"}.`);
  if (bits.sticky) context.push(`Sticky is set. Others execute is ${bits.othersExecute ? "set" : "not set"}, so the notation uses ${bits.othersExecute ? "lowercase t" : "uppercase T"}.`);
  return context;
}

function resultForMode(mode: number): ChmodValidResult {
  assertMode(mode);
  const bits = bitsFromMode(mode);
  const rows = CLASS_DEFINITIONS.map((definition) => {
    const read = bits[definition.read];
    const write = bits[definition.write];
    const execute = bits[definition.execute];
    return {
      id: definition.id,
      label: definition.label,
      digit: String(digitFor(read, write, execute)),
      calculation: calculationFor(read, write, execute),
    };
  });
  const activeSpecialBits = [
    bits.setuid ? "Setuid" : null,
    bits.setgid ? "Setgid" : null,
    bits.sticky ? "Sticky" : null,
  ].filter((value): value is string => Boolean(value));
  const context = bits.othersWrite
    ? ["Others can write to this: any user who isn't the owner and isn't in the file's group. Real access also depends on folder permissions, ACLs, and mount options."]
    : [];
  const octal = formatOctalMode(mode);
  return {
    status: "valid",
    mode,
    octal,
    symbolic: formatSymbolicMode(bits),
    bits,
    classRows: rows,
    specialBits: { setuid: bits.setuid, setgid: bits.setgid, sticky: bits.sticky },
    activeSpecialBits,
    specialContext: specialContext(bits),
    othersWrite: bits.othersWrite,
    context,
    command: `chmod ${octal} ./path/to/file`,
  };
}

export function calculateChmod(input: string | ChmodBits): ChmodCalculationResult {
  if (typeof input === "string") {
    const parsed = parseOctalMode(input);
    return parsed.status === "invalid" ? parsed : resultForMode(parsed.mode);
  }
  if (!isChmodBits(input)) return { status: "invalid", field: "octal", raw: "", message: "Choose valid permission bits." };
  return resultForMode(modeFromBits(input));
}
