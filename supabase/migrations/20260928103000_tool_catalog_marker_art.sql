update public.stack127_tool_pages as tool
set card_art_key = page.slug
from public.stack127_pages as page
where page.id = tool.page_id
  and page.page_family = 'tool'
  and page.slug = any (array[
    'chmod-calculator',
    'docker-compose-checker',
    'ip-asn-lookup',
    'kdp-book-setup-calculator',
    'kdp-image-dpi-checker',
    'kdp-metadata-checker',
    'kdp-page-count-estimator',
    'kdp-payment-date-calculator',
    'kdp-pdf-preflight-checker',
    'kdp-royalty-calculator',
    'lxc-idmap-checker',
    'mqtt-discovery-checker',
    'restic-retention-simulator',
    'rsync-filter-tester',
    'self-hosted-app-resource-planner',
    'shortcuts-cheatsheet-generator'
  ]::text[])
  and tool.card_art_key is distinct from page.slug;
