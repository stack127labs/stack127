begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

alter table public.launch_directories
  add column cost_tag text,
  add column cost_note text,
  add constraint launch_directories_cost_tag_check check (
    cost_tag is null or (
      cost_tag !~ '^[[:space:]]|[[:space:]]$' and char_length(cost_tag) between 1 and 20
    )
  ),
  add constraint launch_directories_cost_note_check check (
    cost_note is null or (
      cost_note !~ '^[[:space:]]|[[:space:]]$' and char_length(cost_note) between 1 and 40
    )
  );

commit;
