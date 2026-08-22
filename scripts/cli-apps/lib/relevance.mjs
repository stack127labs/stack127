/**
 * Terminal-relevance predicate for package registries that are not
 * terminal-scoped (NixOS, Arch, Ubuntu). These catalogues contain every kind
 * of software; ingesting all of them would flood the queue with fonts,
 * libraries, and GUI apps that no reviewer asked for.
 *
 * The predicate is a documented collection-time filter: records rejected by it
 * are counted in the run notes, never silently dropped from the report.
 */
const positive = [
  /\btui\b/i,
  /\bterminal\b/i,
  /\bcli\b/i,
  /\bcommand.?line\b/i,
  /\bshell\b/i,
  /\bprompt\b/i,
  /\bmultiplexer\b/i,
  /\bemulator\b/i,
  /\bconsole\b/i,
];

const strongName = /(^|[-_.])(tui|cli|term|terminal|shell|sh|zsh|bash|fish|nu)([-_.]|$)/i;

const negative = [
  /^lib/i,
  /^python[0-9]*-|^python3?\.?\d*-/,
  /^rubygem-/,
  /^perl-/,
  /^php-/,
  /^nodejs?-/,
  /^ghc-|^haskell-/,
  /^ocaml-/,
  /^rust-/,
  /^font/i,
  /-fonts?$|-icons?$/i,
  /^(xorg|x11|wayland)-/i,
  /theme|icon.?theme|wallpaper/i,
  /^(golang|lua|ruby|perl|tcl)-/,
];

export function isTerminalRelevant({ name, description }) {
  const haystack = `${name ?? ""} ${description ?? ""}`;

  for (const pattern of negative) {
    if (pattern.test(name ?? "")) return false;
  }

  if (strongName.test(name ?? "")) return true;
  return positive.some((pattern) => pattern.test(haystack));
}
