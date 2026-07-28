/**
 * Constants and types the multi-TLD page needs on both sides.
 *
 * Kept separate from multi-tld.ts because that module reaches the RDAP client and
 * the Postgres cache. Importing it from a client component drags `pg` into the
 * browser bundle and breaks the build.
 */

/**
 * A reviewed default set. Every entry is checkable today, so a first-time visitor
 * does not get a table of "cannot check". Readers can change the selection.
 */
export const DEFAULT_TLDS = ["com", "net", "org", "dev", "app", "ai", "io", "xyz", "info", "biz"] as const;

export const MAX_TLDS = 12;

export type MultiTldRow = {
  tld: string;
  domain: string;
  state: "not_registered" | "registered" | "cannot_check" | "check_failed";
  detail: string;
  registrar: string | null;
  expiryDate: string | null;
  fetchedAt: string | null;
  fromCache: boolean;
};

export type MultiTldResult = {
  name: string;
  unicode: string;
  checkedAt: string;
  rows: MultiTldRow[];
  checkedCount: number;
  maxTlds: number;
};
