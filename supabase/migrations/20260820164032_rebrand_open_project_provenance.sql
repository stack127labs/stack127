-- Keep public provenance labels aligned with the Stack127 brand while preserving
-- the original enrichment method represented by each value.
update public.open_projects
set
  summary_source = replace(summary_source, 'version127', 'stack127'),
  updated_at = now()
where summary_source in (
  'version127_enriched',
  'version127_manual_refinement'
);
