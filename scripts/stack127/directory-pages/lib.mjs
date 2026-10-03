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

export function platformFeeSectionCopy(section, slug) {
  return { slug, title: section.meta_title, intro_markdown: section.intro, content_markdown: null };
}

export function platformFeeOverviewCopy(sectionCount, entryCount) {
  return {
    slug: 'platform-fees',
    title: `Platform fees compared: ${entryCount} platforms across ${sectionCount} categories`,
    intro_markdown: 'Choose what you sell, then compare fees and start costs. Open a card for other rates and official sources. Ranges use headline percentages before fixed charges and other deductions.',
    content_markdown: null,
  };
}
