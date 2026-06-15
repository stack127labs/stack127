alter table public.categories
  add column if not exists icon_key text;

update public.categories
set icon_key = case slug
  when 'photos' then 'images'
  when 'cloud-workspace' then 'folder-sync'
  when 'media' then 'tv'
  when 'home-automation' then 'house-plug'
  when 'password-managers' then 'key-round'
  when 'documents' then 'file-text'
  when 'monitoring' then 'activity'
  when 'dns' then 'network'
  when 'development-tools' then 'code-2'
  else icon_key
end
where slug in (
  'photos',
  'cloud-workspace',
  'media',
  'home-automation',
  'password-managers',
  'documents',
  'monitoring',
  'dns',
  'development-tools'
);
