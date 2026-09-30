-- Correct AllTheMons publisher and license details from its official CurseForge listing.
UPDATE public.self_host_apps AS app
SET
  publisher_name = 'ATMTeam',
  publisher_type = 'community',
  publisher_url = 'https://www.curseforge.com/members/atmteam/projects',
  docs_url = 'https://github.com/AllTheMods/All-the-Mons#readme',
  license = 'All Rights Reserved',
  license_type = 'custom',
  license_spdx_id = NULL,
  data_source_urls = COALESCE((
    SELECT array_agg(DISTINCT source_url ORDER BY source_url)
    FROM unnest(
      COALESCE(app.data_source_urls, '{}'::text[])
        || ARRAY[
          'https://github.com/AllTheMods/All-the-Mons',
          'https://www.curseforge.com/members/atmteam/projects',
          'https://www.curseforge.com/minecraft/modpacks/all-the-mons'
        ]::text[]
    ) AS source_url
  ), '{}'::text[]),
  updated_at = now()
WHERE app.slug = 'allthemons'
  AND app.website_url = 'https://www.curseforge.com/minecraft/modpacks/all-the-mons';
