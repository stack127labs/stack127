alter table public.terminal_apps
  add constraint terminal_apps_icon_url_managed
  check (
    icon_url is null
    or icon_url ~ '^https?://[^/]+/storage/v1/object/public/stack127-media/directories/cli-apps/icons/[a-z0-9][a-z0-9._-]*-[0-9a-f]{16}\.(png|jpg|webp|avif|gif)$'
  );

alter table public.terminal_apps
  add constraint terminal_apps_screenshot_url_managed
  check (
    screenshot_url is null
    or screenshot_url ~ '^https?://[^/]+/storage/v1/object/public/stack127-media/directories/cli-apps/screenshots/[a-z0-9][a-z0-9._-]*-[0-9a-f]{16}\.(png|jpg|webp|avif|gif)$'
  );

alter table public.self_host_apps
  add constraint self_host_apps_icon_url_managed
  check (
    icon_url is null
    or icon_url ~ '^https?://[^/]+/storage/v1/object/public/stack127-media/directories/self-host-apps/icons/[a-z0-9][a-z0-9._-]*-[0-9a-f]{16}\.(png|jpg|webp|avif|gif)$'
  );
