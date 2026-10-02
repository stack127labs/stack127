import type { HardwareDirectoryRecord } from "./index";
import { hardwareDirectoryCard, type HardwareDirectoryCardRecord } from "./card";

/** Card data and the fields used by browser filters and search. */
export type HardwareIndexRecord = HardwareDirectoryCardRecord & Pick<HardwareDirectoryRecord, "features" | "search_terms"> & {
  amazon: boolean;
};

export function hardwareIndexRecord(record: HardwareDirectoryRecord): HardwareIndexRecord {
  return {
    ...hardwareDirectoryCard(record),
    amazon: Boolean(record.amazon),
    features: record.features,
    // Matter records include full product descriptions among their search terms.
    search_terms: record.certification_variant_kind === "matter" || record.card?.compatibility.label === "Matter certification"
      ? record.search_terms.filter((term) => term.length <= 160)
      : record.search_terms,
  };
}
