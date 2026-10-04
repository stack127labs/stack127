import type { Stack127Page } from "./page-registry";
import { getPool } from "./db";
import { readPublicData, selectPublicRows } from "./public-data-api";

export type PageCardCopy = {
  page_id: number | string;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
};

/** The caller caches these cards with the homepage publication list. */
export async function readPageCards(pages: Stack127Page[]) {
  if (!pages.length) return new Map<string, PageCardCopy>();
  const rows = await readPublicData<PageCardCopy[]>({
    dataApiRead: async () => {
      const groups = [
        ["tool", "stack127_tool_pages"],
        ["directory", "stack127_directory_pages"],
        ["catalog", "stack127_catalog_pages"],
      ] as const;
      return (await Promise.all(groups.map(async ([family, table]) => {
        const ids = pages.filter(page => page.page_family === family).map(page => page.id);
        return ids.length ? selectPublicRows<PageCardCopy>(table, {
          page_id: `in.(${ids.join(",")})`, select: "page_id,card_name,card_description,card_icon_key,card_art_key",
        }) : [];
      }))).flat();
    },
    postgresRead: async () => (await getPool().query<PageCardCopy>(`
      select page_id,card_name,card_description,card_icon_key,card_art_key from public.stack127_tool_pages where page_id=any($1::bigint[])
      union all
      select page_id,card_name,card_description,card_icon_key,card_art_key from public.stack127_directory_pages where page_id=any($1::bigint[])
      union all
      select page_id,card_name,card_description,card_icon_key,card_art_key from public.stack127_catalog_pages where page_id=any($1::bigint[])
    `, [pages.map(page => page.id)])).rows,
  });
  return new Map(rows.map(row => [String(row.page_id), row]));
}
