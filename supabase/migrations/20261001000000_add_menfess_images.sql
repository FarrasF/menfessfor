alter table public.menfess
  add column if not exists url_gambar text;

create table if not exists public.menfess_image_deletions (
  upload_token uuid primary key,
  menfess_id text unique,
  image_url text not null,
  delete_url text not null,
  created_at timestamptz not null default now()
);

alter table public.menfess_image_deletions enable row level security;
revoke all on table public.menfess_image_deletions from anon, authenticated;
grant all on table public.menfess_image_deletions to service_role;

create table if not exists public.imgbb_upload_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.imgbb_upload_rate_limits enable row level security;
revoke all on table public.imgbb_upload_rate_limits from anon, authenticated;
grant all on table public.imgbb_upload_rate_limits to service_role;

create or replace function public.consume_imgbb_upload_rate_limit(
  p_ip_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_count integer;
begin
  insert into public.imgbb_upload_rate_limits (ip_hash, window_started_at, request_count)
  values (p_ip_hash, clock_timestamp(), 1)
  on conflict (ip_hash) do update
  set
    window_started_at = case
      when public.imgbb_upload_rate_limits.window_started_at
        + make_interval(secs => p_window_seconds) <= clock_timestamp()
      then clock_timestamp()
      else public.imgbb_upload_rate_limits.window_started_at
    end,
    request_count = case
      when public.imgbb_upload_rate_limits.window_started_at
        + make_interval(secs => p_window_seconds) <= clock_timestamp()
      then 1
      else public.imgbb_upload_rate_limits.request_count + 1
    end
  returning request_count into current_count;

  delete from public.imgbb_upload_rate_limits
  where window_started_at < clock_timestamp() - interval '1 day';

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_imgbb_upload_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_imgbb_upload_rate_limit(text, integer, integer)
  to service_role;
