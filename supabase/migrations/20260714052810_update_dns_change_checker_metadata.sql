update public.version127_pages
set
  meta_title = 'DNS Propagation Checker: Compare DNS Changes | Version127',
  meta_description = 'Check whether a DNS change is live at the authoritative source, then compare it with Cloudflare, Google, Quad9, and other public resolver caches.'
where slug = 'dns-tools/dns-change-checker';
