export async function upsertDirectoryPage(client, row) {
  const result = await client.query(`
    insert into public.stack127_directory_pages
      (page_id,title,intro_markdown,content_markdown,card_name,card_description)
    select page.id,$2,$3,$4,coalesce($5,current.card_name,page.label),coalesce($6,current.card_description,page.meta_description)
    from public.stack127_pages page
    left join public.stack127_directory_pages current on current.page_id=page.id
    where page.slug=$1 and page.page_family='directory'
    on conflict (page_id) do update set
      title=excluded.title, intro_markdown=excluded.intro_markdown,
      content_markdown=excluded.content_markdown, card_name=excluded.card_name,
      card_description=excluded.card_description
    where (stack127_directory_pages.title,stack127_directory_pages.intro_markdown,
      stack127_directory_pages.content_markdown,stack127_directory_pages.card_name,
      stack127_directory_pages.card_description) is distinct from
      (excluded.title,excluded.intro_markdown,excluded.content_markdown,
      excluded.card_name,excluded.card_description)
    returning page_id
  `, [row.slug, row.title, row.intro_markdown, row.content_markdown ?? null,
    row.card_name ?? null, row.card_description ?? null]);
  return result.rowCount;
}

export async function previewDirectoryPages(pool, pages, { remove = false, refresh = false, matchesRemoval } = {}) {
  if (remove && refresh) throw new Error('Choose --remove or --refresh');
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
      if (remove) {
        if (row && matchesRemoval && !matchesRemoval(row)) throw new Error(`Refusing to remove ${page.slug}: its metadata does not match the preview contract`);
      } else {
        if (!row?.has_directory_copy) throw new Error(`Directory page copy is missing for ${page.slug}; refusing to publish or refresh it`);
        if (!refresh && row.is_published) throw new Error(`A published registry row already exists for ${page.slug}; refusing to overwrite it`);
      }
    }
    for (const page of pages) {
      const row = bySlug.get(page.slug);
      if (remove) {
        if (row && (row.is_published || row.published_at || row.updated_at)) await client.query(`update public.stack127_pages
          set is_published=false,published_at=null,updated_at=null where id=$1`, [row.id]);
      } else {
        if (row.label === page.label && row.meta_title === page.title && row.meta_description === page.description
          && (refresh || row.is_published)) continue;
        await client.query(`update public.stack127_pages set label=$2,meta_title=$3,meta_description=$4,
          is_published=case when $5::boolean then is_published else true end,
          published_at=case when $5::boolean then published_at else coalesce(published_at,now()) end,
          updated_at=case when is_published or not $5::boolean then now() else null end
          where id=$1`, [row.id, page.label, page.title, page.description, refresh]);
      }
    }
    await client.query('commit');
    return rows.length;
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
    intro_markdown: app.intro,
    content_markdown: `<!-- section:print -->\n## Print the shortcuts you use\n\n[Make a printable ${app.name} sheet](/shortcuts-cheatsheet-generator?apps=${app.slug})`,
  };
}

export function adNetworkPageCopy(network) {
  return {
    slug: `ad-networks/${network.slug}`,
    title: `${network.name} publisher websites`,
    intro_markdown: `${network.summary ?? `Browse publisher websites with a verified ${network.name} relationship.`} A site can use more than one ad network.`,
    content_markdown: 'A site appears here only when its current ads.txt or live configuration supports the stated relationship. A seller authorization alone does not establish active use.',
  };
}
