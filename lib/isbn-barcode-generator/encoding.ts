// EAN-13 and EAN-5 module patterns, ISO/IEC 15420. "1" is a dark module.

const L_CODES = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G_CODES = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R_CODES = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];

// Left-half character sets chosen by the first EAN-13 digit.
const EAN13_PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

// Character sets chosen by the EAN-5 check value.
const EAN5_PARITY = ["GGLLL", "GLGLL", "GLLGL", "GLLLG", "LGGLL", "LLGGL", "LLLGG", "LGLGL", "LGLLG", "LLGLG"];

export const EAN13_MODULES = 95;
export const EAN5_MODULES = 47;

function digitsOf(text: string, length: number): number[] {
  if (!new RegExp(`^\\d{${length}}$`).test(text)) throw new Error(`Expected ${length} digits.`);
  return [...text].map(Number);
}

function code(set: string, digit: number): string {
  return (set === "G" ? G_CODES : L_CODES)[digit];
}

export function ean13Modules(digitsText: string): string {
  const digits = digitsOf(digitsText, 13);
  const parity = EAN13_PARITY[digits[0]];
  let modules = "101";
  for (let index = 1; index <= 6; index += 1) modules += code(parity[index - 1], digits[index]);
  modules += "01010";
  for (let index = 7; index <= 12; index += 1) modules += R_CODES[digits[index]];
  return modules + "101";
}

export function ean5Check(digitsText: string): number {
  const d = digitsOf(digitsText, 5);
  return (3 * (d[0] + d[2] + d[4]) + 9 * (d[1] + d[3])) % 10;
}

export function ean5Modules(digitsText: string): string {
  const digits = digitsOf(digitsText, 5);
  const parity = EAN5_PARITY[ean5Check(digitsText)];
  let modules = "1011";
  digits.forEach((digit, index) => {
    if (index > 0) modules += "01";
    modules += code(parity[index], digit);
  });
  return modules;
}

// Dark runs as [start module, width in modules].
export function darkRuns(modules: string): [number, number][] {
  const runs: [number, number][] = [];
  for (let index = 0; index < modules.length; index += 1) {
    if (modules[index] !== "1") continue;
    const start = index;
    while (modules[index + 1] === "1") index += 1;
    runs.push([start, index - start + 1]);
  }
  return runs;
}
