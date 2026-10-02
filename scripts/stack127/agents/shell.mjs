// A small shell lexer for the lane guard, not a shell interpreter or a security
// boundary. Keep quoted arguments intact; inspect substitutions and sh -c too.
import path from "node:path";

const operators = ["&>>", "&>", "<<-", "<<<", ">>", "<<", ">&", "<&", "<>", ">|", "&&", "||", ";;", "|&", ">", "<", ";", "|", "&", "\n"];
const redirects = new Set(["&>>", "&>", ">>", ">&", ">|", ">", "<", "<<", "<<-", "<<<", "<&", "<>"]);
const outputRedirects = new Set(["&>>", "&>", ">>", ">&", ">|", ">", "<>"]);

function tokenize(source, start = 0, terminator = null) {
  const tokens = [];
  let substitutions = [];
  let value = "";
  let active = false;
  let quote = null;
  const flush = () => {
    if (active) tokens.push({ value, substitutions });
    value = "";
    active = false;
    substitutions = [];
  };
  let i = start;
  for (; i < source.length; i += 1) {
    const char = source[i];
    if (!quote && char === terminator) break;
    if (char === "\\" && quote !== "'") {
      const next = source[i + 1];
      if (next === "\n") { i += 1; continue; }
      if (next !== undefined && (!quote || /["$`\\]/.test(next))) { value += next; active = true; i += 1; continue; }
    }
    if (quote === "'") {
      if (char === "'") quote = null;
      else value += char;
      continue;
    }
    if ((char === "'" && !quote) || char === '"') {
      if (quote === char) quote = null;
      else if (!quote) { quote = char; active = true; }
      else value += char;
      continue;
    }
    if (source.startsWith("$(", i) || char === "`") {
      const dollar = char === "$";
      const inner = tokenize(source, i + (dollar ? 2 : 1), dollar ? ")" : "`");
      substitutions.push(inner);
      value += source.slice(i, inner.end + 1);
      active = true;
      i = inner.end;
      continue;
    }
    if (quote) { value += char; continue; }
    if (char === "#" && !active) {
      while (i < source.length && source[i] !== "\n") i += 1;
      i -= 1;
      continue;
    }
    if (char === "(") {
      flush();
      const inner = tokenize(source, i + 1, ")");
      tokens.push({ group: inner });
      i = inner.end;
      continue;
    }
    if (char === ")") { flush(); tokens.push({ operator: ";" }); continue; }
    const operator = operators.find((candidate) => source.startsWith(candidate, i));
    if (operator) {
      // An adjacent number is a file descriptor: 2>file and 2>&1.
      if (redirects.has(operator) && /^\d+$/.test(value)) { value = ""; active = false; }
      flush();
      tokens.push({ operator });
      i += operator.length - 1;
    } else if (/\s/.test(char)) flush();
    else { value += char; active = true; }
  }
  flush();
  return { tokens, end: i };
}

export function unwrapCommand(words) {
  let args = [...words];
  while (args.length) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(args[0]) || ["!", "if", "then", "elif", "else", "do", "while", "until", "{"].includes(args[0])) { args.shift(); continue; }
    const verb = path.basename(args[0]);
    if (["npm", "pnpm", "yarn", "bun"].includes(verb) && ["exec", "x"].includes(args[1])) args.splice(1, 1);
    else if (["npm", "pnpm", "yarn", "bun"].includes(verb)) break;
    if (!["env", "command", "builtin", "exec", "sudo", "npx", "npm", "pnpm", "yarn", "bun", "nohup", "timeout"].includes(verb)) break;
    args.shift();
    if (verb === "env") {
      const index = args.findIndex((arg) => arg === "-S" || arg === "--split-string" || arg.startsWith("--split-string=") || arg.startsWith("-S") && arg.length > 2);
      if (index >= 0) {
        const flag = args[index];
        const separate = flag === "-S" || flag === "--split-string";
        const text = separate ? args[index + 1] : flag.startsWith("-S") ? flag.slice(2) : flag.slice("--split-string=".length);
        const split = tokenize(text ?? "").tokens.filter((token) => "value" in token).map((token) => token.value);
        args.splice(index, separate ? 2 : 1, ...split);
      }
    }
    while (args[0]?.startsWith("-")) {
      const option = args.shift();
      if (["-u", "--unset", "-C", "--chdir", "-S", "--split-string", "--user", "--group", "-g", "--package", "-p", "--signal", "-s", "--kill-after", "-k"].includes(option)) args.shift();
    }
    if (verb === "timeout") args.shift();
  }
  return args;
}

function segmentsOf(parsed, depth) {
  const segments = [];
  let words = [];
  let targets = [];
  let children = [];
  const flush = () => {
    if (words.length || targets.length || children.length) segments.push({ words: unwrapCommand(words), targets, children });
    words = [];
    targets = [];
    children = [];
  };
  for (let i = 0; i < parsed.tokens.length; i += 1) {
    const token = parsed.tokens[i];
    if (token.group) {
      flush();
      segments.push({ words: [], targets: [], children: segmentsOf(token.group, depth + 1) });
    } else if (!token.operator) {
      words.push(token.value);
      for (const substitution of token.substitutions) children.push(...segmentsOf(substitution, depth + 1));
    } else if (redirects.has(token.operator)) {
      const target = parsed.tokens[i + 1];
      if (target && !target.operator && !target.group) {
        if (outputRedirects.has(token.operator) && !(token.operator === ">&" && /^(?:\d+|-)$/.test(target.value))) targets.push(target.value);
        for (const substitution of target.substitutions) children.push(...segmentsOf(substitution, depth + 1));
        i += 1;
      }
    } else flush();
  }
  flush();
  if (depth < 12) {
    for (const segment of [...segments]) {
      const [command, ...args] = segment.words;
      const verb = command ? path.basename(command) : "";
      if (["bash", "sh", "dash", "zsh", "ksh"].includes(verb)) {
        const index = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/.test(arg));
        if (index >= 0 && args[index + 1]) segment.children.push(...shellSegments(args[index + 1], depth + 1));
      } else if (verb === "eval") segment.children.push(...shellSegments(args.join(" "), depth + 1));
    }
  }
  return segments;
}

export function shellSegments(command, depth = 0) {
  return segmentsOf(tokenize(command), depth);
}

export function writeTargets({ words, targets }) {
  const [command, ...args] = words;
  const verb = command ? path.basename(command) : "";
  const files = args.filter((word) => !word.startsWith("-"));
  const out = [...targets];
  if (["tee", "rm", "truncate", "touch"].includes(verb)) out.push(...files);
  else if (["cp", "mv", "install"].includes(verb)) {
    // mv removes the source; both cp and mv can replace files in a directory.
    const targetIndex = args.findIndex((word) => word === "-t" || word === "--target-directory");
    const directory = targetIndex >= 0 ? args[targetIndex + 1] : args.find((word) => word.startsWith("--target-directory="))?.split("=").slice(1).join("=");
    const destination = directory ?? (files.length > 1 ? files.at(-1) : null);
    if (destination) {
      out.push(destination);
      for (const source of files.slice(0, directory ? undefined : -1)) out.push(path.posix.join(destination, path.posix.basename(source)));
    }
    if (verb === "mv") out.push(...files);
  } else if (["sed", "perl"].includes(verb) && args.some((word) => /^-[a-zA-Z]*i/.test(word) || /^--in-place(?:=|$)/.test(word))) out.push(...files);
  return out;
}
