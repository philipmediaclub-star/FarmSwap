-- Run in Supabase SQL Editor. Safe to re-run.

-- ===================================================================
-- 1) Removing users: kept 6 months, then permanently deleted
-- ===================================================================
alter table public.profiles add column if not exists deleted_at timestamptz;

-- Removed users are hidden from the public (admins and the user themselves still see the row).
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (deleted_at is null or auth.uid() = id or public.is_admin(auth.uid()));

-- Remove a user: they can no longer log in, their ads are hidden, the data is kept.
create or replace function public.admin_remove_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Only admins can remove users'; end if;
  if p_user = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  if public.is_admin(p_user) then raise exception 'Remove the admin rights first'; end if;

  update public.profiles set deleted_at = now() where id = p_user;
  update auth.users set banned_until = now() + interval '100 years' where id = p_user;

  update public.listings set status = 'removed' where seller_id   = p_user and status <> 'removed';
  update public.rentals  set status = 'removed' where owner_id    = p_user and status <> 'removed';
  update public.services set status = 'removed' where provider_id = p_user and status <> 'removed';
  update public.jobs     set status = 'removed' where poster_id   = p_user and status <> 'removed';
  update public.reservations set status = 'cancelled' where requester_id = p_user and status = 'pending';
end $$;

-- Undo a removal (within the 6 months). Their ads stay removed - they can repost them.
create or replace function public.admin_restore_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Only admins can restore users'; end if;
  update public.profiles set deleted_at = null where id = p_user;
  update auth.users set banned_until = null where id = p_user;
end $$;

-- Permanently delete one already-removed user right now (all their data goes with them).
create or replace function public.admin_purge_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Only admins can delete users'; end if;
  if not exists (select 1 from public.profiles where id = p_user and deleted_at is not null) then
    raise exception 'The user must be removed first';
  end if;
  delete from auth.users where id = p_user;
end $$;

-- Permanently delete everyone who was removed more than 6 months ago.
create or replace function public.purge_expired_users()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    raise exception 'Only admins can run this';
  end if;
  with gone as (
    delete from auth.users u
    using public.profiles p
    where p.id = u.id and p.deleted_at is not null and p.deleted_at < now() - interval '6 months'
    returning u.id
  )
  select count(*) into n from gone;
  return n;
end $$;

-- Lets admins see each user's email on the Users tab.
create or replace function public.admin_user_emails()
returns table (id uuid, email text)
language sql security definer set search_path = public as $$
  select u.id, u.email::text from auth.users u where public.is_admin(auth.uid());
$$;

grant execute on function public.admin_remove_user(uuid)  to authenticated;
grant execute on function public.admin_restore_user(uuid) to authenticated;
grant execute on function public.admin_purge_user(uuid)   to authenticated;
grant execute on function public.purge_expired_users()    to authenticated;
grant execute on function public.admin_user_emails()      to authenticated;

-- Daily automatic clean-up (needs the pg_cron extension). If this is not available
-- on your plan, nothing breaks: the admin page runs the same clean-up whenever an
-- admin opens it.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('farmswap-purge-removed-users', '30 3 * * *', 'select public.purge_expired_users()');
exception when others then
  raise notice 'pg_cron not available - expired users are purged when an admin opens the admin page.';
end $$;

-- ===================================================================
-- 2) Categories managed by admins
-- ===================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('sell', 'rent', 'service')),
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (section, name)
);

alter table public.categories enable row level security;

drop policy if exists "Categories are readable by everyone" on public.categories;
create policy "Categories are readable by everyone"
  on public.categories for select using (true);

drop policy if exists "Admins can add categories" on public.categories;
create policy "Admins can add categories"
  on public.categories for insert with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can change categories" on public.categories;
create policy "Admins can change categories"
  on public.categories for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete using (public.is_admin(auth.uid()));

insert into public.categories (section, name, sort_order) values
  ('sell','Traktor',1), ('sell','Jordbruksutstyr',2), ('sell','Tilhenger',3),
  ('sell','Skurtresker',4), ('sell','Redskap',5), ('sell','Annet',6),
  ('rent','Redskap',1), ('rent','Såmaskin',2), ('rent','Tilhenger',3),
  ('rent','Vintervedlikehold',4), ('rent','Annet',5),
  ('service','Leiekjøring',1), ('service','Høsting',2), ('service','Transport',3),
  ('service','Snømåking',4), ('service','Skogsarbeid',5), ('service','Reparasjon',6),
  ('service','Annet',7)
on conflict (section, name) do nothing;
