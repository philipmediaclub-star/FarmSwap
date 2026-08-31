-- Run in Supabase SQL Editor.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Helper used by every admin policy below.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- Reports: admins need to see and update every report, not just their own.
create policy "Admins can view all reports"
  on public.reports for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin(auth.uid()));

-- Listings / rentals / services / jobs: admins can see every row
-- (including removed/inactive ones) and remove any of them.
create policy "Admins can view all listings" on public.listings for select using (public.is_admin(auth.uid()));
create policy "Admins can update any listing" on public.listings for update using (public.is_admin(auth.uid()));

create policy "Admins can view all rentals" on public.rentals for select using (public.is_admin(auth.uid()));
create policy "Admins can update any rental" on public.rentals for update using (public.is_admin(auth.uid()));

create policy "Admins can view all services" on public.services for select using (public.is_admin(auth.uid()));
create policy "Admins can update any service" on public.services for update using (public.is_admin(auth.uid()));

create policy "Admins can view all jobs" on public.jobs for select using (public.is_admin(auth.uid()));
create policy "Admins can update any job" on public.jobs for update using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------
-- After running the above, make YOURSELF an admin by running this
-- (replace with your real user id, found in Supabase ->
-- Authentication -> Users, or by running: select id, full_name from
-- public.profiles;):
--
-- update public.profiles set is_admin = true where id = 'YOUR-USER-ID';
-- ---------------------------------------------------------------
