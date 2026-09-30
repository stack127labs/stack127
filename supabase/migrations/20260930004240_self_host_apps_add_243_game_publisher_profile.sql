BEGIN;
DO $$
DECLARE
  changed integer;
BEGIN
  IF (SELECT count(*) FROM public.self_host_apps
      WHERE slug='243-game'
        AND published IS TRUE
        AND publisher_url IS NULL
        AND publisher_name='hgentry'
        AND source_code_url='https://github.com/hgentry/81') <> 1 THEN
    RAISE EXCEPTION '243 Game publisher snapshot changed';
  END IF;

  UPDATE public.self_host_apps
  SET publisher_url='https://github.com/hgentry',
      data_source_urls=ARRAY(
        SELECT DISTINCT source_url
        FROM unnest(coalesce(data_source_urls, ARRAY[]::text[]) || ARRAY['https://apps.yunohost.org/app/243-game','https://github.com/hgentry','https://github.com/hgentry/81']::text[]) AS collected(source_url)
        WHERE source_url IS NOT NULL
        ORDER BY source_url
      ),
      data_checked_at=now(),
      updated_at=now()
  WHERE slug='243-game'
    AND published IS TRUE
    AND publisher_url IS NULL
    AND publisher_name='hgentry'
    AND source_code_url='https://github.com/hgentry/81';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION '243 Game publisher update changed % rows', changed;
  END IF;
END $$;
COMMIT;
