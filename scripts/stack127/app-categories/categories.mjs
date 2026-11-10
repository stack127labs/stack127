import { terminalAppCategories } from '../../../lib/terminal-app-taxonomy.ts';
export async function readCategories(client, directory) {
  if (!['self-host-apps', 'cli-apps'].includes(directory)) throw new Error('Use --directory self-host-apps|cli-apps');
  if (directory === 'self-host-apps') return (await client.query(`select category.slug,category.name,count(app.id)::int as count
    from public.self_host_app_categories category left join public.self_host_app_category_links link on link.category_id=category.id
    left join public.self_host_apps app on app.id=link.app_id and app.published and app.self_hosting_status='self_hostable'
    group by category.id order by category.slug`)).rows;
  const counts = new Map((await client.query(`select category,count(*)::int as count from public.terminal_apps app
    cross join lateral unnest(app.categories) category where app.published group by category`)).rows.map(row => [row.category, row.count]));
  return terminalAppCategories.map(category => ({ slug: category.slug, name: category.name, count: counts.get(category.slug) ?? 0 }));
}
