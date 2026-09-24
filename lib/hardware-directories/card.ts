import type { HardwareDirectoryCompatibility, HardwareDirectoryFact, HardwareDirectoryRecord } from "./index";

export type HardwareDirectoryCardRecord = Pick<HardwareDirectoryRecord, "slug" | "name" | "vendor" | "model" | "image_path"> & {
  cardFacts: HardwareDirectoryFact[];
  compatibility: HardwareDirectoryCompatibility;
};

const unresolvedValue = /^(unknown|not recorded|no or unknown|not published)$/i;

export function hardwareDirectoryCard(record: HardwareDirectoryRecord): HardwareDirectoryCardRecord {
  const compatibility = record.card?.compatibility ?? {
    label: record.evidence[0]?.label ?? "Compatibility",
    status: "reported" as const,
    value: record.evidence[0]?.value ?? "Source record",
  };
  const preferred = record.card?.facts ?? record.stats;
  const cardFacts = preferred.filter((fact) => fact.value && !unresolvedValue.test(fact.value)).slice(0, 2);
  if (cardFacts.length < 2) {
    for (const fact of record.facts) {
      if (!fact.value || unresolvedValue.test(fact.value) || cardFacts.some((item) => item.label === fact.label)) continue;
      cardFacts.push(fact);
      if (cardFacts.length === 2) break;
    }
  }
  return {
    slug: record.slug,
    name: record.name,
    vendor: record.vendor,
    model: record.model,
    image_path: record.image_path,
    cardFacts,
    compatibility,
  };
}
