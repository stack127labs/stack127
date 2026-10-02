-- Update database-owned entry-page metadata for the indie hacker audience.
-- Keep publication state, URLs, tool content, and versions unchanged.
update public.stack127_pages as page
set meta_title = copy.title,
    meta_description = copy.description,
    updated_at = current_timestamp
from (values
  ('', 'stack127: a toolbox and reference hub for indie hackers',
   'Free tools, calculators, directories, and reference data for indie hackers, solo developers, and digital creators who build and run projects online.'),
  ('about', 'About stack127',
   'Meet the person behind stack127 and see the tools, directories, references, and courses built for indie hackers, solo developers, and digital creators.')
) as copy(slug, title, description)
where page.slug = copy.slug
  and (page.meta_title, page.meta_description) is distinct from (copy.title, copy.description);
