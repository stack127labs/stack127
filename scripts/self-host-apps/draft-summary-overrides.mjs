#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";

const banned = [
  [/\bopen[- ]source\b/gi, ""],
  [/\bself[- ]hosted\b/gi, "local"],
  [/\bplatform\b/gi, "app"],
  [/\bsolution\b/gi, "tool"],
  [/\bpowerful\b/gi, ""],
  [/\bultimate\b/gi, ""],
  [/\ball[- ]in[- ]one\b/gi, ""],
  [/\bseamless\b/gi, ""],
  [/\brobust\b/gi, ""],
];

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/gi, (_, name) => ({
      nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
    })[name.toLowerCase()]);
}

function clean(value) {
  let text = decodeEntities(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s*\(https?:\/\/[^)]+\)/gi, "")
    .replace(/\[\/?(?:br|b|i|u|url|img|span|color|size)(?:=[^\]]+)?\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/`{1,3}/g, "")
    .replace(/[*_~>#]+/g, " ")
    .replace(/\s*[—–]\s*/g, ". ")
    .replace(/\s+-\s+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, replacement] of banned) text = text.replace(pattern, replacement);
  return text.replace(/\s+([,.!?;:])/g, "$1").replace(/,{2,}/g, ",").replace(/\s+/g, " ").trim();
}

function noise(text) {
  return /^(?:click to expand|the linuxserver\.io team|before proceeding|after you finish|installation|install(?:ation)? instructions?|usage|configuration|requirements?|features?|license|documentation|support|note|warning)\b/i.test(text)
    || /\b(?:docker image|release featuring|minimum server requirements)\b/i.test(text)
    || /\b(?:update|not affiliated|demo credentials|total downloads|last update|coming soon|changelog|sponsor|pull requests?|as fond as I am|no reason for me to return|does not need to be|can run on|you can|you should|feel free|thanks for|repo is archived|container\(s\) are no longer)\b/i.test(text)
    || /(?:@layer|window\.|localStorage|Object\.defineProperty|<script|<!doctype|\{\s*"@context"|K Help System|GitHub is where people build|Docker pull|Overview Tags|Table of Contents|YunoHost app store)/i.test(text)
    || /^[-|]/.test(text);
}

function candidateScore(text, record) {
  const words = text.split(/\s+/).filter(Boolean);
  let score = Math.min(words.length, 45);
  if (noise(text)) score -= 30;
  if (/^(?:when|if|after|once|for|this|it|you|my|i\b|hey\b|resolvecheq|the thirty)\b/i.test(text)) score -= 18;
  if (words.length >= 8 && words.length <= 30) score += 8;
  if (text.length >= 50 && text.length <= 160) score += 10;
  if (text.length > 220) score -= 12;
  if (text.length > 160) score -= 6;
  if (new RegExp(record.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text)) score += 10;
  if (/\b(?:app|application|server|service|tool|manager|editor|monitor|library|database|proxy|generator|client|dashboard|website|wiki|game|player|tracker|system|browser|api|bot)\b/i.test(text)) score += 8;
  if (/\b(?:install|installation|configure|configuration|download|requirements?|license|repository|demo|sponsor|support)\b/i.test(text)) score -= 8;
  if (/\b(?:feature|features|includes|supports)\b/i.test(text)) score -= 2;
  if (/\b(?:is|provides|offers|allows|lets|helps|designed|built)\b/i.test(text)) score += 10;
  const currentWords = clean(record.current_summary).toLowerCase().split(/\s+/).filter((word) => word.length > 4);
  score += currentWords.filter((word) => text.toLowerCase().includes(word)).length * 2;
  return score;
}

function firstSentence(text) {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts[0] ?? text;
}

function joinShortSentences(text) {
  const parts = String(text ?? "").split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length < 2 || parts[0].split(/\s+/).length >= 9) return parts[0] ?? text;
  return `${parts[0].replace(/[.!?]+$/, ";")} ${parts[1]}`;
}

function candidateSentences(text) {
  const parts = String(text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const options = [];
  for (let index = 0; index < parts.length; index += 1) {
    options.push(parts[index]);
    if (parts[index].split(/\s+/).length < 9 && parts[index + 1]) {
      options.push(`${parts[index]} ${parts[index + 1]}`);
    }
  }
  return options;
}

function firstUsefulPart(text) {
  return String(text ?? "")
    .split(/\s+(?=(?:see here|for examples?|check here|please read|visit|to access|to run|install via|click here|learn more|after installation|environment|this is a fork|created to fix|created by|designed to work with|once your container|you should)\b)/i)[0]
    .split(/\s*,\s*(?=(?:\[|NOTE|IMPORTANT|This|It|Created|Designed|Environment|Once|See|For|Your|The|Use|Do|Please)\b)/)[0]
    .trim();
}

function removeInstructions(text) {
  return text
    .split(/\s+(?=(?:see here|for examples?|check here|please read|visit|to run|install via|click here|learn more|after installation|environment)\b)/i)[0]
    .split(/\s+(?=(?:designed to work with|created to fix|created by|built for|this is a fork|to access)\b)/i)[0]
    .replace(/\s+(?:features?|screenshots?|installation|usage|configuration|license)\s*:.*/i, "")
    .trim();
}

function currentNeedsSource(record) {
  const text = String(record.current_summary ?? "");
  return !text.trim()
    || /\[\/?(?:br|b|i|u|url|img|span|color|size)(?:\]|[=\s])/i.test(text)
    || /<\/?[a-z][^>]*>/i.test(text)
    || /&#(?:x[0-9a-f]+|[0-9]+);|&(?:nbsp|amp|lt|gt|quot|apos);/i.test(text)
    || /https?:\/\//i.test(text)
    || /\b(?:see here|for examples?|required in|click here|learn more|visit|please read|to run)\b/i.test(text)
    || /\b(?:and|or|the|a|an|your|when)\s*[.!?]*$/i.test(text)
    || (text.match(/[.!?](\s|$)/g) ?? []).length > 1
    || /^.{2,48}:\s+\S/.test(text)
    || /\b(?:open[- ]source|self[- ]hosted|solution|platform|powerful|ultimate|all[- ]in[- ]one|seamless|robust)\b/i.test(text);
}

function phraseTail(text) {
  const lower = text.toLowerCase();
  if (/flightradar24/.test(lower)) return "for sending aircraft data to Flightradar24";
  if (/radarbox/.test(lower)) return "for sending aircraft data to RadarBox";
  if (/\badsb\b|ads-b/.test(lower)) return "for receiving and forwarding aircraft position data";
  if (/prometheus|exporter/.test(lower)) return "that exposes service metrics to Prometheus";
  if (/acestream|ace stream/.test(lower)) return "for streaming media through the Ace Stream engine";
  if (/\bairflow\b/.test(lower)) return "for orchestrating scheduled data workflows";
  if (/androidtv|firetv|googletv|\badb\b/.test(lower)) return "for controlling Android devices through the Android Debug Bridge";
  if (/anki-sync|\banki\b/.test(lower)) return "for synchronizing Anki collections across devices";
  if (/caldav|carddav/.test(lower)) return "for synchronizing calendars and contacts";
  if (/3d print|slicer|bambu studio|orcaslicer/.test(lower)) return "for preparing 3D models for printing";
  if (/\b(?:age|encryption|decryption)\b/.test(lower)) return "for generating keys and encrypting or decrypting files";
  if (/paywall|googlebot/.test(lower)) return "for fetching article pages through an alternate access path";
  if (/photo intelligence/.test(lower)) return "for describing, tagging, and searching photos with local vision models";
  if (/babybuddy|baby care|infant/.test(lower)) return "for tracking sleep, feeding, and other infant care";
  if (/\b(?:civicrm|crm)\b/.test(lower)) return "for managing contacts, organizations, and relationships";
  if (/\b(?:irc|xmpp|matrix|jabber)\b/.test(lower)) return "for connecting to and managing federated chat services";
  if (/\b(?:webdav|remotestorage)\b/.test(lower)) return "for storing and synchronizing files over the web";
  if (/\b(?:ssh|sftp|ftp)\b/.test(lower)) return "for transferring files securely over a network";
  if (/\b(?:qr code|qrcode)\b/.test(lower)) return "for generating and managing QR codes";
  if (/\b(?:hash|sha-256)\b/.test(lower)) return "for calculating and checking file hashes";
  if (/\b(?:manga|comic)\b/.test(lower)) return "for downloading, organizing, and reading comics";
  if (/\b(?:recipe|meal)\b/.test(lower)) return "for organizing recipes and planning meals";
  if (/\b(?:strava|fittrackee|garmin|workout|fitness)\b/.test(lower)) return "for tracking workouts and fitness activities";
  if (/\b(?:obs|stream deck|companion)\b/.test(lower)) return "for controlling live production equipment and applications";
  if (/\b(?:docker|container)\b/.test(lower) && /\b(?:cron|runner|registry|volume|cleanup|netboot|vim)\b/.test(lower)) return "for running and managing Docker workloads";
  if (/webhook/.test(lower)) return "for receiving HTTP requests and running configured commands";
  if (/dns server/.test(lower)) return "for filtering ads, trackers, and unwanted domains across a network";
  if (/static site generator/.test(lower)) return "for building websites from Markdown and templates";
  if (/2048|puzzle game|game clone/.test(lower)) return "for playing a browser-based tile-merging game";
  if (/ecommerce|online retail|shopping cart|storefront|commerce/.test(lower)) return "for managing products, orders, and online sales";
  if (/collaborat|groupware|team project|kanban|task manager/.test(lower)) return "for organizing shared work, tasks, and project information";
  if (/comic|manga|book|ebook|reading/.test(lower)) return "for organizing and reading a personal library";
  if (/audio|music|song|radio|podcast/.test(lower)) return "for organizing, playing, or sharing audio files";
  if (/video|movie|television|tv|media/.test(lower)) return "for organizing and streaming a personal media library";
  if (/minecraft|game server|dedicated server|game/.test(lower)) return "for hosting a dedicated multiplayer game server";
  if (/bitcoin|cryptocurrency|wallet|lightning/.test(lower)) return "for managing a node, wallet, or cryptocurrency service";
  if (/email|mailing list|smtp/.test(lower)) return "for sending, receiving, or organizing email";
  if (/calendar|schedule|appointment/.test(lower)) return "for organizing events and sharing availability";
  if (/authentication|two-factor|password|identity|sso/.test(lower)) return "for managing accounts and access credentials";
  if (/monitor|uptime|status/.test(lower)) return "for checking services and reporting availability";
  if (/proxy/.test(lower)) return "for routing web traffic through another server";
  if (/file|upload|download|storage|backup/.test(lower)) return "for storing, managing, or transferring files";
  if (/photo|photo library|image collection|image search|gallery/.test(lower)) return "for organizing and searching image collections";
  if (/database|sql/.test(lower)) return "for storing, querying, or managing structured data";
  if (/search|engine/.test(lower)) return "for searching and retrieving information from the web";
  if (/home automation|iot|sensor|smart home/.test(lower)) return "for connecting devices and automating routines";
  if (/\b(?:ai|llm|machine learning|stable diffusion)\b/.test(lower)) return "for running or managing local AI workloads";
  if (/wiki|note|knowledge/.test(lower)) return "for writing and organizing notes or pages";
  if (/web site|website|cms|content management/.test(lower)) return "for publishing and managing website content";
  if (/dns|network|firewall|vpn/.test(lower)) return "for managing network services and connections";
  if (/rss|feed reader/.test(lower)) return "for collecting and reading feeds from websites";
  return null;
}

function normalizeSummary(text, record, options = {}) {
  let value = removeInstructions(firstUsefulPart(clean(text)));
  value = options.joinShort ? joinShortSentences(value) : firstSentence(value);
  value = value
    .replace(/^A[n]?\s+/i, "")
    .replace(/\b(?:is a|is an)\s+(?:a|an)\s+/gi, "is a ")
    .replace(/\bis a AI\b/gi, "is an AI")
    .replace(/\b(?:is a|is an)\s+AI\b/gi, "is an AI")
    .replace(/\b(?:a|an)\s+(?:and|,?\s*and)\s+/gi, "a ")
    .replace(/\b(?:This|It) is\s+/g, "")
    .replace(/^[^:]{2,48}:\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (value.length < 50 || value.split(/\s+/).filter(Boolean).length < 8) {
    const tail = phraseTail(`${value} ${record.name} ${record.slug}`);
    if (tail) value = `${value.replace(/[.!?]+$/, "")}${/^(?:for|with|from|that|which)\b/i.test(tail) ? ` ${tail}` : `, ${tail}`}.`;
  }
  value = value.replace(/\s*,\s*([.!?])/g, "$1").replace(/\.{2,}/g, ".").replace(/\s+/g, " ").trim();
  if (!/[.!?]$/.test(value)) value += ".";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function bestCandidate(record) {
  const candidates = (record.candidates ?? [])
    .flatMap((candidate, sourceIndex) => candidateSentences(clean(candidate.text)).map((text, sentenceIndex) => ({ ...candidate, sourceIndex, sentenceIndex, text })))
    .map((candidate) => ({ ...candidate, text: firstUsefulPart(candidate.text) }))
    .filter((candidate) => candidate.text && !noise(candidate.text) && candidate.text.split(/\s+/).length >= 5)
    .map((candidate) => ({ ...candidate, text: normalizeSummary(candidate.text, record, { joinShort: true }) }))
    .filter((candidate) => candidate.text && !noise(candidate.text) && candidate.text.length <= 180)
    .sort((a, b) => {
      const scoreDifference = candidateScore(b.text, record) - candidateScore(a.text, record);
      if (scoreDifference !== 0) return scoreDifference;
      return (a.sourceIndex ?? 0) - (b.sourceIndex ?? 0) || (a.sentenceIndex ?? 0) - (b.sentenceIndex ?? 0);
    });
  return candidates[0]?.text ?? null;
}

function currentBasis(record) {
  const cleaned = normalizeSummary(record.current_summary, record);
  const original = String(record.current_summary ?? "");
  const source = bestCandidate(record);
  const unusableCurrent = !cleaned
    || cleaned.length < 15
    || /^(?:click to expand|the linuxserver\.io team|before proceeding|after you finish|installation|install(?:ation)? instructions?|usage|configuration|requirements?|features?|license|documentation|support|note|warning|my docker|aura stands|this repo is|the same server|when photos are|resolvecheq|const |function |\[x\]|k help|docker pull|https?:\/\/|all rights reserved|please see)\b/i.test(cleaned);
  if (
    !unusableCurrent
    && !/\b(?:and|or|the|a|an|your|when)\s*[.!?]*$/i.test(cleaned)
  ) return record.current_summary;
  if (source) return source;
  return record.current_summary;
}

async function main() {
  const args = parseArgs();
  if (!args.file || !args.out) throw new Error("Usage: node scripts/self-host-apps/draft-summary-overrides.mjs --file research.json --out draft.json");
  const input = JSON.parse(await readFile(args.file, "utf8"));
  const records = input.records ?? [];
  const apps = [];
  const blocked = [];
  for (const record of records) {
    const basis = currentNeedsSource(record) ? currentBasis(record) : record.current_summary;
    const summary = normalizeSummary(basis, record);
    if (!summary || summary === record.current_summary) {
      blocked.push({ slug: record.slug, reason: "No changed draft was produced" });
      continue;
    }
    apps.push({
      slug: record.slug,
      summary,
      source_url: record.recommended_source_url,
      expected: { summary: record.current_summary },
    });
  }
  await writeFile(args.out, `${JSON.stringify({ reviewed_at: new Date().toISOString(), scope: "Draft only; requires source and editorial review.", apps, blocked }, null, 2)}\n`);
  console.log(JSON.stringify({ input: records.length, drafts: apps.length, blocked: blocked.length, output: args.out }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
