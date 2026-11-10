export async function insertDirectoryPageIfMissing(client, row) {
  const result = await client.query(`
    insert into public.stack127_directory_pages
      (page_id,title,card_name,card_description)
    select page.id,$2,coalesce($3,page.label),coalesce($4,page.meta_description)
    from public.stack127_pages page
    where page.slug=$1 and page.page_family='directory'
    on conflict (page_id) do nothing
    returning page_id
  `, [row.slug, row.title, row.card_name ?? null, row.card_description ?? null]);
  return result.rowCount;
}

export function keyboardShortcutPageCopy(app) {
  return {
    slug: `keyboard-shortcuts/${app.slug}`,
    title: `<mark>${app.name}</mark> keyboard shortcuts`,
  };
}
