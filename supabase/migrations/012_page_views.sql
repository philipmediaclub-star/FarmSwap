-- Privacy-friendly traffic statistics: no cookies, no IP addresses, no personal data.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null check (char_length(path) <= 300),
  referrer text check (referrer is null or char_length(referrer) <= 200),
  session_id text not null check (char_length(session_id) <= 64),
  device text check (device in ('mobil', 'nettbrett', 'pc')),
  lang text check (lang is null or char_length(lang) <= 8)
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;

-- Anyone may record a visit; nobody but admins (through the function below) can read them.
drop policy if exists "Anyone can log a page view" on public.page_views;
create policy "Anyone can log a page view" on public.page_views
  for insert to anon, authenticated with check (true);

create or replace function public.admin_traffic(p_days int default 30)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  since timestamptz := date_trunc('day', now()) - ((greatest(least(p_days, 365), 1) - 1) || ' days')::interval;
  result json;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Not allowed';
  end if;

  -- keep roughly 13 months of history
  delete from public.page_views where created_at < now() - interval '400 days';

  select json_build_object(
    'views', (select count(*) from public.page_views where created_at >= since),
    'visitors', (select count(distinct session_id) from public.page_views where created_at >= since),
    'today_views', (select count(*) from public.page_views where created_at >= date_trunc('day', now())),
    'today_visitors', (select count(distinct session_id) from public.page_views where created_at >= date_trunc('day', now())),
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select g.day::date as day,
               count(v.id) as views,
               count(distinct v.session_id) as visitors
        from generate_series(since::date, now()::date, interval '1 day') g(day)
        left join public.page_views v
          on v.created_at >= g.day and v.created_at < g.day + interval '1 day'
        group by g.day
      ) d
    ),
    'pages', (
      select coalesce(json_agg(p), '[]'::json) from (
        select path, count(*) as views, count(distinct session_id) as visitors
        from public.page_views where created_at >= since
        group by path order by count(*) desc limit 15
      ) p
    ),
    'referrers', (
      select coalesce(json_agg(r), '[]'::json) from (
        select referrer, count(*) as views
        from public.page_views
        where created_at >= since and referrer is not null and referrer <> ''
        group by referrer order by count(*) desc limit 10
      ) r
    ),
    'devices', (
      select coalesce(json_agg(x), '[]'::json) from (
        select coalesce(device, 'ukjent') as device, count(distinct session_id) as visitors
        from public.page_views where created_at >= since
        group by device order by count(distinct session_id) desc
      ) x
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_traffic(int) from public, anon;
grant execute on function public.admin_traffic(int) to authenticated;
