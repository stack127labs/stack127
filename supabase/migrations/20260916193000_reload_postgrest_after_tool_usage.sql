-- PostgREST caches the exposed schema. Reload it after adding usage_markdown so
-- development and production Data API reads can select the new column.
notify pgrst, 'reload schema';
