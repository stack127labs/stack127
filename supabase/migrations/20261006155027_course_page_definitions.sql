begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

create table public.stack127_course_pages (
  page_id bigint primary key references public.stack127_pages(id) on delete cascade,
  title text not null check (title=btrim(title) and length(title)>0),
  intro_markdown text not null check (intro_markdown=btrim(intro_markdown) and length(intro_markdown)>0),
  content_markdown text check (content_markdown is null or (content_markdown=btrim(content_markdown) and length(content_markdown)>0)),
  card_name text not null check (card_name=btrim(card_name) and length(card_name)>0),
  card_description text not null check (card_description=btrim(card_description) and length(card_description)>0),
  card_icon_key text check (card_icon_key ~ '^[a-z0-9-]+$'),
  card_art_key text check (card_art_key ~ '^[a-z0-9-]+$'),
  author_name text not null check (author_name=btrim(author_name) and length(author_name)>0),
  author_avatar_url text not null check (author_avatar_url=btrim(author_avatar_url) and length(author_avatar_url)>0),
  navigation_label text not null check (navigation_label=btrim(navigation_label) and length(navigation_label)>0),
  row_updated_at timestamptz not null default now()
);
create table public.stack127_course_lessons (
  page_id bigint primary key references public.stack127_pages(id) on delete cascade,
  course_page_id bigint not null references public.stack127_course_pages(page_id) on delete cascade,
  title text not null check (title=btrim(title) and length(title)>0),
  sidebar_label text not null check (sidebar_label=btrim(sidebar_label) and length(sidebar_label)>0),
  display_order integer not null check (display_order>0),
  row_updated_at timestamptz not null default now(),
  unique(course_page_id,display_order) deferrable initially deferred
);

create function public.stack127_validate_course_content()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare course_slug text; lesson_slug text;
begin
  select slug into lesson_slug from public.stack127_pages where id=new.page_id and page_family='course';
  if lesson_slug is null then raise exception 'Course content must refer to a course registry page'; end if;
  if tg_table_name='stack127_course_pages' then
    if position('/' in lesson_slug)>0 then raise exception 'Course roots must use a root slug'; end if;
  else
    select page.slug into course_slug from public.stack127_pages page where id=new.course_page_id and page_family='course';
    if course_slug is null or not (lesson_slug=course_slug or left(lesson_slug,length(course_slug)+1)=course_slug || '/') then
      raise exception 'Lesson slug must belong to its course';
    end if;
  end if;
  return new;
end;
$$;
create trigger stack127_validate_course_content before insert or update on public.stack127_course_pages
for each row execute function public.stack127_validate_course_content();
create trigger stack127_validate_course_content before insert or update on public.stack127_course_lessons
for each row execute function public.stack127_validate_course_content();
create function public.stack127_protect_course_registry()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
  if (new.page_family,new.slug) is distinct from (old.page_family,old.slug) and (
    exists(select 1 from public.stack127_course_pages where page_id=old.id) or
    exists(select 1 from public.stack127_course_lessons where page_id=old.id)) then
    raise exception 'Remove course definitions before changing their registry family or slug';
  end if;
  return new;
end;
$$;
create trigger stack127_protect_course_registry before update of page_family,slug on public.stack127_pages
for each row execute function public.stack127_protect_course_registry();

-- Seed definitions before date and cache triggers exist. Existing public dates stay intact.
insert into public.stack127_pages(slug,label,meta_title,meta_description,page_type,sitemap_priority,page_family,is_published,published_at,updated_at)
select source.slug,source.label,source.meta_title,source.meta_description,source.page_type,source.sitemap_priority,'course',false,null,null
from jsonb_to_recordset($course_registry$[{"slug": "self-hosting-for-beginners", "label": "self-hosting for beginners", "meta_title": "What Is Self-Hosting? A Beginner's Guide", "meta_description": "Self-hosting means running your own apps on a computer you control. Learn what it is, why people do it, and how to start, no Linux or Docker knowledge needed yet.", "page_type": "Course", "sitemap_priority": 0.8}, {"slug": "self-hosting-for-beginners/what-you-can-host", "label": "what I host", "meta_title": "What Can You Self-Host? Apps People Run", "meta_description": "Photos, passwords, notes, media, ad blocking and more. See what you can actually self-host, which apps are worth running first, and what's better to skip.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/basic-setup", "label": "the basic setup", "meta_title": "How Self-Hosting Works: The 5 Core Parts", "meta_description": "Every self-hosted setup is the same five parts: server, app, storage, network, and access. Understand how they fit together, with a real app as an example.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/pick-your-first-server", "label": "pick a server", "meta_title": "How to Choose a Home Server for Self-Hosting", "meta_description": "How to choose a first home server: what actually matters (RAM, storage, power, noise), why an old PC works to start, and when a mini PC or Raspberry Pi is worth buying.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/pick-your-operating-system", "label": "pick an OS", "meta_title": "How to Choose a Home Server OS", "meta_description": "How to choose an OS for your home server. Why plain Linux (Ubuntu or Debian) plus Docker is the safe pick, with honest notes on CasaOS, TrueNAS, Unraid and Proxmox.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/install-your-os", "label": "install the OS", "meta_title": "Install a Home Server OS & Find Its IP", "meta_description": "Flash a USB or use Raspberry Pi Imager, run the installer, enable SSH, connect the server to your network, find its IP, and give it a fixed address.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/linux-ssh-basics", "label": "linux + SSH", "meta_title": "Linux & SSH Basics to Run Your Home Server", "meta_description": "The little bit of Linux you need to run a server: connect over SSH, move around folders, edit files, and update the system with about ten commands.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/install-docker", "label": "meet Docker", "meta_title": "Install Docker for Self-Hosting", "meta_description": "Images, containers and ports explained simply, then install Docker and Compose on your server and run a test container to check everything works.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/install-your-first-app", "label": "install first app", "meta_title": "Install Your First Self-Hosted App with Docker", "meta_description": "A beginner walkthrough: make a folder, write a docker-compose.yml, run docker compose up, and open your first self-hosted app in the browser. No experience needed.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/understand-docker-compose", "label": "Docker Compose", "meta_title": "Docker Compose Explained for Self-Hosting", "meta_description": "Reading a docker-compose.yml for self-hosting: what image, ports, volumes, environment and restart mean, plus the commands to start, stop, log, and update apps.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/storage-and-volumes", "label": "storage & volumes", "meta_title": "Docker Volumes & Storage for Self-Hosting", "meta_description": "Where your self-hosted app data actually lives. Docker named volumes vs bind mounts, and how to keep your files safe when you update or rebuild a container.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/best-first-apps", "label": "best first apps", "meta_title": "Best Self-Hosted Apps for Beginners", "meta_description": "The best self-hosted apps for beginners to try first: Homepage, Memos, Linkwarden, FreshRSS and Uptime Kuma. Low-risk, useful, and easy to install with Docker.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/backups-before-serious-apps", "label": "backups", "meta_title": "How to Back Up Self-Hosted Apps", "meta_description": "What to back up, how to automate it, the 3-2-1 rule, and why to test a restore before you trust your server with photos, passwords, or anything you can't lose.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/access-apps-safely-at-home", "label": "access at home", "meta_title": "Access Self-Hosted Apps at Home", "meta_description": "Why server-ip:port is fine to start, using a dashboard as your front door, and the optional step up to real names and HTTPS with a reverse proxy.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/access-apps-remotely-with-tailscale", "label": "remote access", "meta_title": "Access a Home Server Remotely with Tailscale", "meta_description": "Reach your self-hosted apps from anywhere without exposing them. How Tailscale works, with honest takes on Cloudflare Tunnel, WireGuard and port forwarding.", "page_type": "LearningResource", "sitemap_priority": 0.7}, {"slug": "self-hosting-for-beginners/full-walkthrough", "label": "full walkthrough", "meta_title": "Self-Hosting Walkthrough, Start to Finish", "meta_description": "The whole path in one checklist: server, OS, SSH, Docker, your first app, storage, backups, and remote access, every step tied together from a bare machine.", "page_type": "LearningResource", "sitemap_priority": 0.7}]$course_registry$::jsonb) source(slug text,label text,meta_title text,meta_description text,page_type text,sitemap_priority numeric)
on conflict(slug) do nothing;

insert into public.stack127_course_pages(page_id,title,intro_markdown,card_name,card_description,card_icon_key,card_art_key,author_name,author_avatar_url,navigation_label)
select id,'Self-hosting for beginners','Normally, the apps you use are connected to the cloud, a.k.a somebody else''s server. Your notes stay on Notion''s servers, your passwords stay on Apple''s, and so on. That''s why you can reach them from anywhere with just your account.',label,meta_description,'self-hosting-for-beginners','self-hosting-for-beginners','Raviteja KNTS',
'https://www.gravatar.com/avatar/b04b086ad0ea05d503673f6f563a080b?s=96&d=identicon','Lessons'
from public.stack127_pages where slug='self-hosting-for-beginners';
insert into public.stack127_course_lessons(page_id,course_page_id,title,sidebar_label,display_order)
select page.id,course.page_id,source.title,source.sidebar_label,source.display_order
from jsonb_to_recordset($course_lessons$[{"slug": "", "title": "What <mark>self-hosting</mark> is, and why do you need it?", "sidebar_label": "What self-hosting is", "display_order": 1}, {"slug": "what-you-can-host", "title": "The stuff I <mark>actually run</mark> on my server", "sidebar_label": "What I host", "display_order": 2}, {"slug": "basic-setup", "title": "The <mark>five pieces</mark> every self-hosting setup has", "sidebar_label": "The basic setup", "display_order": 3}, {"slug": "pick-your-first-server", "title": "Picking your <mark>first server</mark> without overthinking it", "sidebar_label": "Pick a server", "display_order": 4}, {"slug": "pick-your-operating-system", "title": "<mark>Which OS</mark> you should put on your first server", "sidebar_label": "Pick an OS", "display_order": 5}, {"slug": "install-your-os", "title": "Getting the OS <mark>installed</mark> and onto your network", "sidebar_label": "Install the OS", "display_order": 6}, {"slug": "linux-ssh-basics", "title": "The tiny bit of <mark>Linux and SSH</mark> you actually need", "sidebar_label": "Linux + SSH", "display_order": 7}, {"slug": "install-docker", "title": "Meet <mark>Docker</mark>, and get it installed", "sidebar_label": "Meet Docker", "display_order": 8}, {"slug": "install-your-first-app", "title": "Installing your <mark>first app</mark> and making it real", "sidebar_label": "Install first app", "display_order": 9}, {"slug": "understand-docker-compose", "title": "Docker Compose, <mark>explained</mark>", "sidebar_label": "Docker Compose", "display_order": 10}, {"slug": "storage-and-volumes", "title": "Where your <mark>data actually lives</mark>, and why it matters", "sidebar_label": "Storage & volumes", "display_order": 11}, {"slug": "best-first-apps", "title": "The apps I'd <mark>install next</mark> to build confidence", "sidebar_label": "Best first apps", "display_order": 12}, {"slug": "backups-before-serious-apps", "title": "Making <mark>backups boring</mark> before you trust anything important", "sidebar_label": "Backups", "display_order": 13}, {"slug": "access-apps-safely-at-home", "title": "Reaching your apps <mark>at home</mark>, nicely", "sidebar_label": "Access at home", "display_order": 14}, {"slug": "access-apps-remotely-with-tailscale", "title": "Reaching your apps <mark>from anywhere</mark>, the easy way", "sidebar_label": "Remote access", "display_order": 15}, {"slug": "full-walkthrough", "title": "Hosting a real app from <mark>start to finish</mark>", "sidebar_label": "Full walkthrough", "display_order": 16}]$course_lessons$::jsonb) source(slug text,title text,sidebar_label text,display_order integer)
join public.stack127_pages page on page.slug='self-hosting-for-beginners' || case when source.slug='' then '' else '/' || source.slug end
cross join public.stack127_course_pages course;

create function public.stack127_queue_course_pages(p_course_id bigint, p_reason text)
returns void language plpgsql security invoker set search_path=pg_catalog as $$
declare target record;
begin
  for target in select slug from public.stack127_pages page where page.id=p_course_id or
    page.id in(select page_id from public.stack127_course_lessons where course_page_id=p_course_id)
  loop perform public.stack127_enqueue_revalidation('page',target.slug,p_reason); end loop;
end;
$$;
create function public.stack127_touch_course_content()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare value record; owner_id bigint;
begin
  if tg_op='UPDATE' and (to_jsonb(new)-'row_updated_at') is not distinct from (to_jsonb(old)-'row_updated_at') then return null; end if;
  for value in select distinct page_id,course_page_id from (
    select old.page_id,case when tg_table_name='stack127_course_pages' then old.page_id else (to_jsonb(old)->>'course_page_id')::bigint end course_page_id where tg_op<>'INSERT'
    union all
    select new.page_id,case when tg_table_name='stack127_course_pages' then new.page_id else (to_jsonb(new)->>'course_page_id')::bigint end where tg_op<>'DELETE'
  ) changed loop
    perform public.stack127_touch_page((select slug from public.stack127_pages where id=value.page_id),'course_content');
    perform public.stack127_queue_course_pages(value.course_page_id,'course_navigation');
  end loop;
  return null;
end;
$$;
create trigger stack127_course_pages_row_updated_at before update on public.stack127_course_pages
for each row execute function public.set_row_updated_at();
create trigger stack127_course_lessons_row_updated_at before update on public.stack127_course_lessons
for each row execute function public.set_row_updated_at();
create trigger stack127_touch_course_content after insert or update or delete on public.stack127_course_pages
for each row execute function public.stack127_touch_course_content();
create trigger stack127_touch_course_content after insert or update or delete on public.stack127_course_lessons
for each row execute function public.stack127_touch_course_content();

create function public.stack127_queue_course_registry()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare owner_id bigint;
begin
  if tg_op='UPDATE' and (new.is_published,new.label,new.slug,new.page_family) is not distinct from
    (old.is_published,old.label,old.slug,old.page_family) then return null; end if;
  if tg_op<>'DELETE' and new.page_family='course' then
    select course_page_id into owner_id from public.stack127_course_lessons where page_id=new.id;
    if owner_id is not null then perform public.stack127_queue_course_pages(owner_id,'course_publication'); end if;
  end if;
  if tg_op<>'INSERT' and old.page_family='course' then
    select course_page_id into owner_id from public.stack127_course_lessons where page_id=old.id;
    if owner_id is not null then perform public.stack127_queue_course_pages(owner_id,'course_publication'); end if;
  end if;
  return null;
end;
$$;
create trigger stack127_queue_course_registry after insert or update or delete on public.stack127_pages
for each row execute function public.stack127_queue_course_registry();

alter table public.stack127_course_pages enable row level security;
alter table public.stack127_course_lessons enable row level security;
create policy stack127_course_pages_public_read on public.stack127_course_pages for select to anon,authenticated
using(exists(select 1 from public.stack127_pages where id=page_id and is_published));
-- Draft lesson titles stay visible in the published course's coming-soon sidebar.
create policy stack127_course_lessons_public_read on public.stack127_course_lessons for select to anon,authenticated
using(exists(select 1 from public.stack127_pages where id=course_page_id and is_published));
revoke all on public.stack127_course_pages,public.stack127_course_lessons from public,anon,authenticated;
grant select on public.stack127_course_pages,public.stack127_course_lessons to anon,authenticated;
grant all on public.stack127_course_pages,public.stack127_course_lessons to service_role;
revoke all on function public.stack127_validate_course_content() from public,anon,authenticated;
grant execute on function public.stack127_validate_course_content() to service_role;
revoke all on function public.stack127_protect_course_registry() from public,anon,authenticated;
grant execute on function public.stack127_protect_course_registry() to service_role;
revoke all on function public.stack127_touch_course_content() from public,anon,authenticated;
grant execute on function public.stack127_touch_course_content() to service_role;
revoke all on function public.stack127_queue_course_registry() from public,anon,authenticated;
grant execute on function public.stack127_queue_course_registry() to service_role;
revoke all on function public.stack127_queue_course_pages(bigint,text) from public,anon,authenticated;
grant execute on function public.stack127_queue_course_pages(bigint,text) to service_role;

create or replace function public.stack127_cache_source_revisions(p_types text[] default null, p_slugs text[] default null)
returns table(entity_type text, slug text, fingerprint text)
language sql stable set search_path = pg_catalog, public as $$
  select 'page', page.slug,
    md5(to_jsonb(page)::text || coalesce(to_jsonb(tool)::text, '') ||
      coalesce((select to_jsonb(course)::text from public.stack127_course_pages course where course.page_id=page.id), '') ||
      coalesce((select to_jsonb(lesson)::text from public.stack127_course_lessons lesson where lesson.page_id=page.id), '') ||
      coalesce((select string_agg((to_jsonb(lesson)-'row_updated_at')::text || registry.is_published::text, '' order by lesson.display_order) from public.stack127_course_lessons lesson join public.stack127_pages registry on registry.id=lesson.page_id where lesson.course_page_id=page.id), '') ||
      coalesce((select to_jsonb(directory)::text from public.stack127_directory_pages directory where directory.page_id=page.id), '') ||
      coalesce((select to_jsonb(catalog)::text from public.stack127_catalog_pages catalog
        where catalog.page_id = page.id), '') ||
      coalesce((select string_agg(to_jsonb(member)::text, '' order by member.tool_page_id)
        from public.stack127_tool_catalog_memberships member where member.catalog_page_id = page.id), ''))
  from public.stack127_pages page
  left join public.stack127_tool_pages tool on tool.page_id = page.id
  where (p_types is null or 'page' = any(p_types)) and (p_slugs is null or page.slug = any(p_slugs))
  union all
  select 'self_host_app', app.slug, md5(to_jsonb(app)::text ||
    coalesce((select string_agg(to_jsonb(resource)::text, '' order by to_jsonb(resource)::text)
      from public.self_host_app_resource_estimates resource where resource.app_id = app.id), '') ||
    coalesce((select string_agg(to_jsonb(inst)::text, '' order by to_jsonb(inst)::text)
      from public.self_host_app_install_options inst where inst.app_id = app.id), '') ||
    coalesce((select string_agg(to_jsonb(link)::text, '' order by link.category_id)
      from public.self_host_app_category_links link where link.app_id = app.id), ''))
  from public.self_host_apps app where app.published
    and (p_types is null or 'self_host_app' = any(p_types)) and (p_slugs is null or app.slug = any(p_slugs))
  union all
  select 'cli_apps', 'cli-apps', md5(coalesce(string_agg(md5(to_jsonb(app)::text), '' order by app.slug), ''))
  from public.terminal_apps app
  having (p_types is null or 'cli_apps' = any(p_types)) and (p_slugs is null or 'cli-apps' = any(p_slugs))
  union all
  select 'self_host_catalog', 'all', md5(
    coalesce((select string_agg(md5(to_jsonb(g)::text), '' order by g.id) from public.github_projects g), '') ||
    coalesce((select string_agg(md5(to_jsonb(c)::text), '' order by c.id) from public.self_host_app_categories c), ''))
  where (p_types is null or 'self_host_catalog' = any(p_types)) and (p_slugs is null or 'all' = any(p_slugs))
  union all
  select 'platform_fees', section.id, md5(to_jsonb(section)::text ||
    coalesce((select string_agg(to_jsonb(entry)::text, '' order by entry.id)
      from public.platform_fee_entries entry where entry.section_id = section.id), ''))
  from public.platform_fee_sections section
  where (p_types is null or 'platform_fees' = any(p_types)) and (p_slugs is null or section.id = any(p_slugs))
  union all
  select 'ad_networks', network.slug, md5(to_jsonb(network)::text ||
    coalesce((select string_agg(to_jsonb(relationship)::text || to_jsonb(publisher)::text, '' order by relationship.publisher_id)
      from public.ad_network_publisher_relationships relationship
      join public.ad_network_publishers publisher on publisher.id = relationship.publisher_id
      where relationship.ad_network_id = network.id), ''))
  from public.ad_networks network
  where (p_types is null or 'ad_networks' = any(p_types)) and (p_slugs is null or network.slug = any(p_slugs))
  union all
  select 'launch_directories', 'launch-directories', md5(coalesce(string_agg(to_jsonb(directory)::text, '' order by directory.slug), ''))
  from public.launch_directories directory
  having (p_types is null or 'launch_directories' = any(p_types)) and (p_slugs is null or 'launch-directories' = any(p_slugs))
$$;

notify pgrst, 'reload schema';
commit;
