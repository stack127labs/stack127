begin;
update public.self_host_apps
set technical_fact_status=jsonb_set(technical_fact_status,'{ram,status}','"not_published"'::jsonb),
    technical_facts_checked_at=now(),updated_at=now()
where slug in ('obsidian','vscode','lm-studio','steam')
  and published is true
  and technical_fact_status->'ram'->>'status'='estimated';
update public.self_host_apps
set technical_fact_status=jsonb_set(technical_fact_status,'{storage,status}','"not_published"'::jsonb),
    technical_facts_checked_at=now(),updated_at=now()
where slug in ('obsidian','vscode','lm-studio','steam')
  and published is true
  and technical_fact_status->'storage'->>'status'='estimated';
commit;
