-- Home SEO should describe Version127 as a whole: a compact technical
-- directory site spanning self-host apps, tools, references, and related
-- technical resources. Do not pin the homepage meta to one product surface.

update public.version127_pages
set
  meta_title = 'version127 | Practical technical directories and tools',
  meta_description = 'Compact technical directories for self-host apps, open-source tools, home automation, AI agents, calculators, and clear references. Structured facts without the fluff.',
  updated_at = now()
where slug = '';
