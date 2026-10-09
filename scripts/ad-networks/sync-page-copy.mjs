import { parseArgs, runMutation, printResult } from '../stack127/tool-pages/lib.mjs';
import { adNetworkPageCopy, insertDirectoryPageIfMissing } from '../stack127/directory-pages/lib.mjs';

printResult(await runMutation(parseArgs(), async client => {
  const networks = (await client.query(`select network.name,network.slug,network.summary
    from public.ad_networks network join public.stack127_pages page
      on page.slug='ad-networks/' || network.slug and page.page_family='directory'
    order by network.slug`)).rows;
  let changed = 0;
  for (const network of networks) changed += await insertDirectoryPageIfMissing(client, adNetworkPageCopy(network));
  return { pages: networks.length, changed };
}));
