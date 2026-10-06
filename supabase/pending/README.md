# Pending schema cleanup

Move the Release C contract into `supabase/migrations` only after Release B is live on OVH and Cloudflare, all legacy readers and writers are retired, and rollback no longer needs the old schema. Give it a fresh migration timestamp when moving it. Files here are not applied by `supabase db push`.
