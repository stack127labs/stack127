-- Align existing entry-page metadata with the approved product direction.
-- Publication state, URLs, tool content, and versions are unchanged.
do $$
begin
  if (select count(*) from public.stack127_pages where slug in ('', 'about', 'terms')) <> 3 then
    raise exception 'Expected home, about, and terms registry rows before updating positioning';
  end if;
end $$;

update public.stack127_pages as page
set meta_title = copy.title,
    meta_description = copy.description,
    updated_at = current_timestamp
from (values
  ('', 'stack127: tools and directories for tinkerers and hustlers',
   'Find tools, software and hardware directories, practical references, and courses for your next project. Explore stack127, built for tech tinkerers and hustlers.'),
  ('about', 'About stack127',
   'Meet the person behind stack127 and explore the tools, directories, references, courses, and software projects built for tech tinkerers and hustlers.'),
  ('terms', 'Terms and conditions to use stack127',
   'Read the terms for using stack127 tools, directories, reference pages, and courses, including acceptable use, information accuracy, and third-party resources.')
) as copy(slug, title, description)
where page.slug = copy.slug
  and (page.meta_title, page.meta_description) is distinct from (copy.title, copy.description);
