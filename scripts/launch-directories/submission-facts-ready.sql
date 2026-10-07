with expected as (
  select * from jsonb_to_recordset($1::jsonb) as fact(slug text, details jsonb)
), selected as (
  select expected.slug, expected.details as expected_details,
    directory.evidence -> 'public_submission' as details, directory.checked_on
  from expected
  left join public.launch_directories directory
    on directory.slug = expected.slug and directory.is_published
)
-- The frozen plan supplies objects validated by launchSubmissionDetails.
-- Exact comparison rejects missing or malformed observations without a second parser.
select count(*) = jsonb_array_length($1::jsonb)
  and count(*) > 0 and count(distinct slug) = count(*)
  and bool_and(coalesce(checked_on >= $2::date and details = expected_details, false)) as ready
from selected;
