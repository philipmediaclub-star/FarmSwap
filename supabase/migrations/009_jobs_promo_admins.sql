-- Run in Supabase SQL Editor. Safe to re-run.

-- 1) Jobs: "job available" vs "looking for work" ---------------------------
alter table public.jobs
  add column if not exists kind text not null default 'offer' check (kind in ('offer', 'seeking')),
  add column if not exists skills text;

-- 2) Promoted ads ("Reklame") -----------------------------------------------
alter table public.listings add column if not exists promoted_from date, add column if not exists promoted_until date;
alter table public.rentals  add column if not exists promoted_from date, add column if not exists promoted_until date;
alter table public.services add column if not exists promoted_from date, add column if not exists promoted_until date;
alter table public.jobs     add column if not exists promoted_from date, add column if not exists promoted_until date;

-- Only admins may set or change the promotion dates. Everyone else's attempts
-- are silently ignored (so owners cannot promote their own ads).
create or replace function public.protect_promotion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    if tg_op = 'INSERT' then
      new.promoted_from := null;
      new.promoted_until := null;
    else
      new.promoted_from := old.promoted_from;
      new.promoted_until := old.promoted_until;
    end if;
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['listings','rentals','services','jobs'] loop
    execute format('drop trigger if exists protect_promotion on public.%I', t);
    execute format('create trigger protect_promotion before insert or update on public.%I for each row execute function public.protect_promotion()', t);
  end loop;
end $$;

-- 3) Several admins ---------------------------------------------------------
-- SECURITY FIX: users could previously set is_admin / verified on their own
-- profile through the API. Only admins may change those two flags now.
create or replace function public.protect_profile_flags()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('farmswap.bypass', true) = '1' then
    return new;
  end if;
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    new.is_admin := old.is_admin;
    new.verified := old.verified;
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_flags on public.profiles;
create trigger protect_profile_flags before update on public.profiles
  for each row execute function public.protect_profile_flags();

-- Admins can promote / demote other users from the admin page.
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- List of email addresses that should be admins. Not readable through the API
-- (row level security on, no policies) - manage it here in the SQL editor.
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;

insert into public.admin_emails (email)
values ('sienna.christensen@icloud.com')
on conflict do nothing;

-- Makes the user an admin if their email is on the list AND confirmed.
create or replace function public.grant_admin_if_listed(uid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('farmswap.bypass', '1', true);
  update public.profiles p
     set is_admin = true
    from auth.users u
   where p.id = uid
     and u.id = uid
     and u.email_confirmed_at is not null
     and lower(u.email) in (select lower(email) from public.admin_emails);
end $$;

-- Called by the admin page for the logged-in user.
create or replace function public.claim_admin()
returns void language sql security definer set search_path = public as $$
  select public.grant_admin_if_listed(auth.uid());
$$;
grant execute on function public.claim_admin() to authenticated;

-- Apply right away if the person already has an account.
select public.grant_admin_if_listed(u.id)
from auth.users u
where lower(u.email) in (select lower(email) from public.admin_emails);
