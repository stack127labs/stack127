begin;
set local lock_timeout='10s';
set local statement_timeout='120s';
select pg_advisory_xact_lock(hashtext('ad-networks-reviewed-sync'));

-- Verified current tag paths/configuration; provenance is retained per signature.
-- No bare-domain rule is added for Concert, Media.net or Sovrn.
with signatures(slug,program_signatures) as (values
  ('adpushup', '[{"kind":"html_substring","value":"cdn.adpushup.com/","relationship_type":"active_network_use","source_url":"https://www.adpushup.com/"}]'::jsonb),
  ('mediavine', '[{"kind":"html_substring","value":"scripts.mediavine.com/tags/","relationship_type":"active_network_use","source_url":"https://help.mediavine.com/switching-your-script-wrapper-to-the-mediavine-control-panel-plugin"}]'::jsonb),
  ('she-media', '[{"kind":"html_substring","value":"ads.blogherads.com/static/blogherads.js","relationship_type":"active_network_use","source_url":"https://support.shemedia.com/hc/en-us/articles/32102543764763-Why-isn-t-my-site-passing-the-Configure-Ads-step"},{"kind":"html_substring","value":"blogherads.adq.push","relationship_type":"active_network_use","source_url":"https://support.shemedia.com/hc/en-us/articles/32102543764763-Why-isn-t-my-site-passing-the-Configure-Ads-step"}]'::jsonb),
  ('nitropay', '[{"kind":"html_substring","value":"s.nitropay.com/ads-","relationship_type":"active_network_use","source_url":"https://nitropay.com/docs/installing-the-ad-script-on-your-page/"}]'::jsonb),
  ('publisher-collective', '[{"kind":"html_substring","value":"cdn.snigelweb.com/adengine/","relationship_type":"active_network_use","source_url":"https://www.publisher-collective.com/faq"}]'::jsonb),
  ('adapex', '[{"kind":"html_substring","value":"cdn.adapex.io/hb/aaw.","relationship_type":"active_network_use","source_url":"https://adapex.io/"}]'::jsonb),
  ('infolinks', '[{"kind":"html_substring","value":"resources.infolinks.com/js/infolinks_main.js","relationship_type":"active_network_use","source_url":"https://www.infolinks.com/wp-content/uploads/2016/03/Optimization-guide-2016.pdf"}]'::jsonb),
  ('the-moneytizer', '[{"kind":"html_substring","value":"ads.themoneytizer.com/s/gen.js","relationship_type":"active_network_use","source_url":"https://us.themoneytizer.com/publisherguide"}]'::jsonb)
)
update public.ad_networks as n set program_signatures=s.program_signatures,
  identity_reviewed_at='2026-10-16T00:00:00Z'
from signatures s where n.slug=s.slug and n.program_signatures is distinct from s.program_signatures;
commit;
