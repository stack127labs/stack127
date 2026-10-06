import { selectPublicRows } from "./public-data-api";

type CardAssets = {
  card_icon_key?: string | null;
  card_art_key?: string | null;
};

export function normalizeCardAssets<T extends CardAssets>(row: T) {
  return {
    ...row,
    card_icon_key: row.card_icon_key ?? null,
    card_art_key: row.card_art_key ?? null,
  };
}

export async function selectCardRows<T>(
  table: "stack127_tool_pages" | "stack127_directory_pages" | "stack127_catalog_pages" | "stack127_course_pages",
  parameters: Readonly<Record<string, string>>,
): Promise<T[]> {
  return selectPublicRows<T>(table, parameters);
}
