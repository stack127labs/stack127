-- Replace the previous audience wording in database-owned entry-page metadata.
-- Publication state, URLs, tool content, and versions are unchanged.
update public.stack127_pages as page
set meta_title = copy.title,
    meta_description = copy.description,
    updated_at = current_timestamp
from (values
  ('', 'stack127: a toolbox and reference hub for solo builders',
   'A toolbox and reference hub for solo builders, indie hackers, content creators, and tinkerers creating things online. Find practical tools, directories, references, courses, and software projects from stack127.'),
  ('about', 'About stack127',
   'Meet the person behind stack127 and explore the toolbox, directories, references, courses, and software projects built for solo builders, indie hackers, content creators, and tinkerers.')
) as copy(slug, title, description)
where page.slug = copy.slug
  and (page.meta_title, page.meta_description) is distinct from (copy.title, copy.description);
