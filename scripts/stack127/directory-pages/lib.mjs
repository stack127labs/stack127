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

export async function previewDirectoryPages(pool, pages, { remove = false, refresh = false, dryRun = false, matchesRemoval } = {}) {
  if (refresh) throw new Error('--refresh is retired; edit reviewed development fields with scripts/stack127/directory-pages/update-fields.mjs');
  const client = await pool.connect();
  try {
    await client.query('begin');
    const { rows } = await client.query(`
      select page.*, exists (
        select 1 from public.stack127_directory_pages content where content.page_id=page.id
      ) as has_directory_copy
      from public.stack127_pages page where slug=any($1::text[]) for update of page
    `, [pages.map(page => page.slug)]);
    const bySlug = new Map(rows.map(row => [row.slug, row]));
    for (const page of pages) {
      const row = bySlug.get(page.slug);
      if (row && row.page_family !== 'directory') throw new Error(`Wrong page family for ${page.slug}; refusing to change it`);
      if (remove && row && matchesRemoval && !matchesRemoval(row)) {
        throw new Error(`Refusing to remove ${page.slug}: its metadata does not match the preview contract`);
      }
    }
    for (const page of pages) {
      let row = bySlug.get(page.slug);
      if (remove) {
        if (row && (row.is_published || row.published_at || row.updated_at)) await client.query(`update public.stack127_pages
          set is_published=false,published_at=null,updated_at=null where id=$1`, [row.id]);
        continue;
      }
      if (!row) {
        await client.query(`insert into public.stack127_pages
          (slug,page_family,label,meta_title,meta_description,is_published,page_type,sitemap_priority)
          values($1,'directory',$2,$3,$4,false,$5,$6) on conflict(slug) do nothing`,
          [page.slug, page.label, page.title, page.description, page.pageType ?? 'CollectionPage', page.priority ?? 0.5]);
        row = (await client.query('select * from public.stack127_pages where slug=$1 for update', [page.slug])).rows[0];
        if (row.page_family !== 'directory') throw new Error(`Wrong page family for ${page.slug}; refusing to change it`);
        bySlug.set(page.slug, row);
      }
      if (!row.has_directory_copy) {
        await insertDirectoryPageIfMissing(client, {
          slug: page.slug, title: row.label,
        });
      }
      if (!row.is_published) await client.query(`update public.stack127_pages
        set is_published=true,published_at=coalesce(published_at,now()),updated_at=now()
        where id=$1 and not is_published`, [row.id]);
    }
    await client.query(dryRun ? 'rollback' : 'commit');
    return bySlug.size;
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export function keyboardShortcutPageCopy(app) {
  return {
    slug: `keyboard-shortcuts/${app.slug}`,
    title: `<mark>${app.name}</mark> keyboard shortcuts`,
  };
}
