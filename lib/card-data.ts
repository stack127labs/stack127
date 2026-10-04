import { selectPublicRows } from "./public-data-api";

const legacyDirectoryKeys = new Set([
  "cli-apps", "epp-status-codes", "keyboard-shortcuts", "launch-directories",
  "platform-fees", "self-host-apps", "software-licenses-for-self-hosting", "tld-directory",
]);

type CardAssets = {
  card_icon_key?: string | null;
  card_art_key?: string | null;
  icon_key?: string;
  home_art_key?: string;
  legacy_card_assets?: boolean;
};

// PR builds read production before the release applies the card-field migration.
export function normalizeCardAssets<T extends CardAssets>(row: T, family: string, slug: string) {
  const { legacy_card_assets, icon_key, home_art_key, ...content } = row;
  const hasFields = legacy_card_assets === undefined
    ? Object.hasOwn(row, "card_icon_key") : !legacy_card_assets;
  const directoryKey = family === "directory" && legacyDirectoryKeys.has(slug) ? slug : null;
  return {
    ...content,
    card_icon_key: hasFields ? row.card_icon_key ?? null
      : family === "catalog" ? row.card_icon_key ?? icon_key ?? null : directoryKey,
    card_art_key: hasFields ? row.card_art_key ?? null
      : family === "catalog" ? row.card_art_key ?? home_art_key ?? null : directoryKey,
  };
}

export async function selectCardRows<T>(
  table: "stack127_tool_pages" | "stack127_directory_pages" | "stack127_catalog_pages",
  parameters: Readonly<Record<string, string>>,
): Promise<T[]> {
  try {
    return await selectPublicRows<T>(table, parameters);
  } catch (error) {
    if (table === "stack127_tool_pages" || !(error instanceof Error)
      || error.message !== "Supabase public Data API read failed with status 400.") throw error;
    const select = parameters.select.split(",").flatMap(column => {
      if (!["card_icon_key", "card_art_key"].includes(column)) return [column];
      if (table === "stack127_directory_pages") return [];
      return [column === "card_icon_key" ? "card_icon_key:icon_key" : "card_art_key:home_art_key"];
    }).join(",");
    const rows = await selectPublicRows<T>(table, { ...parameters, select });
    return rows.map(row => ({ ...row, legacy_card_assets: true }));
  }
}
