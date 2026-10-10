import { feeGroups, groupPath } from '../../lib/platform-fees/groups.ts';
import { syncRecords } from '../stack127/database/sync-records.mjs';

export async function syncPlatformFeeRecords(client,data) {
  // Remove retired entries before their sections, then load only changed rows.
  const incomingEntries = data.entries.map(row=>row.id);
  const removedEntries = await client.query('delete from public.platform_fee_entries where not(id=any($1::text[]))',[incomingEntries]);
  const sections = await syncRecords(client,{table:'platform_fee_sections',rows:data.sections,keys:['id']});
  const entries = await syncRecords(client,{table:'platform_fee_entries',rows:data.entries,keys:['id']});
  const removedSections = await client.query('delete from public.platform_fee_sections where not(id=any($1::text[]))',[data.sections.map(row=>row.id)]);
  return {sections:sections.changed,entries:entries.changed,removedSections:removedSections.rowCount,removedEntries:removedEntries.rowCount};
}

export async function ensurePlatformFeePages(client) {
  const pages = [{slug:'platform-fees',name:'Platform fees'},...feeGroups.map(group=>({slug:groupPath(group.name).slice(1),name:group.name}))];
  // Insert missing titles and card fields. Page words live in MDX.
  for (const page of pages) {
    await client.query(`insert into public.stack127_pages
      (slug,page_family,label,meta_title,meta_description,is_published,page_type,sitemap_priority)
      values($1,'directory',$2,$2,$3,false,'CollectionPage',0.6) on conflict(slug) do nothing`,
      [page.slug,page.name,`Compare fees and official sources for ${page.name.toLowerCase()}.`]);
    const identity = (await client.query('select page_family from public.stack127_pages where slug=$1',[page.slug])).rows[0];
    if (identity.page_family!=='directory') throw new Error(`Wrong page family: ${page.slug}`);
    await client.query(`insert into public.stack127_directory_pages
      (page_id,title,card_name,card_description)
      select id,label,label,meta_description from public.stack127_pages where slug=$1
      on conflict(page_id) do nothing`,[page.slug]);
  }
  const slugs = pages.slice(1).map(page=>page.slug);
  await client.query("update public.stack127_pages set is_published=false,published_at=null,updated_at=null where slug like 'platform-fees/%' and not(slug=any($1::text[])) and is_published",[slugs]);
  return slugs;
}
