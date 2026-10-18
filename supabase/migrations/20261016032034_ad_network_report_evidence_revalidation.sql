begin;
set local lock_timeout='10s';
set local statement_timeout='120s';

create or replace function public.stack127_directory_record_value(p_table text, p_row jsonb)
returns jsonb language plpgsql immutable security invoker set search_path = pg_catalog as $$
begin
  case p_table
    when 'ad_network_publishers' then
      return p_row - array['created_at','updated_at','next_check_at','lease_until','verification_priority','check_attempt_count','consecutive_failures','last_discovered_at','ads_txt_hash','ads_txt_etag','ads_txt_last_modified'];
    when 'ad_network_publisher_relationships' then
      if p_row->>'status' not in ('confirmed','stale','ended') then return null; end if;
      -- Verification mix and retained manager evidence are public report inputs.
      return (p_row - array['created_at','updated_at','consecutive_misses','first_missed_at','last_missed_at','evidence'])
        || jsonb_build_object('manager_evidence',jsonb_build_object(
          'manager_domain',p_row->'evidence'->'manager_domain',
          'matched_signal',p_row->'evidence'->'matched_signal'));
    when 'ad_networks' then
      return jsonb_build_object('id',p_row->'id','slug',p_row->'slug','name',p_row->'name',
        'official_url',p_row->'official_url','summary',p_row->'summary',
        'manager_domains',p_row->'manager_domains','ad_system_domains',p_row->'ad_system_domains');
    when 'launch_directories' then
      if p_row->>'is_published' <> 'true' then return null; end if;
      return p_row - array['created_at','updated_at','research_notes'];
    when 'terminal_apps' then
      if p_row->>'published' <> 'true' then return null; end if;
      return p_row - array['created_at','updated_at','self_host_app_id'];
    when 'self_host_apps' then
      if p_row->>'published' <> 'true' or p_row->>'self_hosting_status' <> 'self_hostable' then return null; end if;
      return p_row - array['created_at','updated_at','data_checked_at','data_confidence','data_source_urls',
        'source_repo_id','github_repo_id','github_node_id','github_full_name','github_owner_type',
        'source_full_name','source_watchers','source_open_issues','source_languages','source_updated_at',
        'source_default_branch','source_repo_size_kb','source_disabled','source_is_fork','source_is_template',
        'github_watchers','github_open_issues','github_languages','github_updated_at','github_default_branch',
        'github_repo_size_kb','github_disabled','github_is_fork','github_is_template'];
    when 'github_projects' then
      return jsonb_build_object('id',p_row->'id','owner',p_row->'owner','repo',p_row->'repo',
        'stars',p_row->'stars','forks',p_row->'forks','primary_language',p_row->'primary_language','topics',p_row->'topics',
        'created_at',p_row->'created_at','pushed_at',p_row->'pushed_at','latest_release',p_row->'latest_release',
        'latest_release_at',p_row->'latest_release_at','last_commit_at',p_row->'last_commit_at',
        'checked_at',p_row->'checked_at','archived',p_row->'archived');
    when 'self_host_app_install_options' then
      return jsonb_build_object('app_id',p_row->'app_id','options',p_row->'options');
    else
      return p_row - array['created_at','updated_at','row_updated_at'];
  end case;
end;
$$;
revoke all on function public.stack127_directory_record_value(text,jsonb) from public, anon, authenticated;
grant execute on function public.stack127_directory_record_value(text,jsonb) to service_role;
commit;
