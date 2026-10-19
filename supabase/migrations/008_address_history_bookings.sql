-- Run in Supabase SQL Editor AFTER 007_postal_codes.sql. Safe to re-run.

-- 1) Profile address -------------------------------------------------
-- Zip + city are public (shown on the profile as the place). The street
-- address is PRIVATE: it lives in its own table that only the owner can read.
alter table public.profiles
  add column if not exists postal_code text check (postal_code is null or postal_code ~ '^[0-9]{4}$'),
  add column if not exists city text;

create table if not exists public.profile_addresses (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  street text,
  updated_at timestamptz not null default now()
);

alter table public.profile_addresses enable row level security;

drop policy if exists "Owners can read their address" on public.profile_addresses;
create policy "Owners can read their address"
  on public.profile_addresses for select using (auth.uid() = user_id);

drop policy if exists "Owners can insert their address" on public.profile_addresses;
create policy "Owners can insert their address"
  on public.profile_addresses for insert with check (auth.uid() = user_id);

drop policy if exists "Owners can update their address" on public.profile_addresses;
create policy "Owners can update their address"
  on public.profile_addresses for update using (auth.uid() = user_id);

-- 2) History: remember when an ad changed status (sold / removed / ...) ---
alter table public.listings add column if not exists status_changed_at timestamptz;
alter table public.rentals  add column if not exists status_changed_at timestamptz;

create or replace function public.touch_status_changed_at()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end $$;

drop trigger if exists listings_status_changed on public.listings;
create trigger listings_status_changed before update on public.listings
  for each row execute function public.touch_status_changed_at();

drop trigger if exists rentals_status_changed on public.rentals;
create trigger rentals_status_changed before update on public.rentals
  for each row execute function public.touch_status_changed_at();

-- 3) Reservations ----------------------------------------------------
-- Everyone can see which dates are already booked (confirmed) - but nothing else.
create or replace function public.rental_booked_dates(p_rental uuid)
returns table (start_date date, end_date date)
language sql security definer set search_path = public as $$
  select r.start_date, r.end_date
  from public.reservations r
  where r.rental_id = p_rental and r.status = 'confirmed';
$$;
grant execute on function public.rental_booked_dates(uuid) to anon, authenticated;

-- You cannot request your own equipment.
drop policy if exists "Users can create reservation requests" on public.reservations;
create policy "Users can create reservation requests"
  on public.reservations for insert
  with check (
    auth.uid() = requester_id
    and not exists (
      select 1 from public.rentals
      where rentals.id = reservations.rental_id and rentals.owner_id = auth.uid()
    )
  );

-- The person who asked can withdraw a request (set it to 'cancelled').
drop policy if exists "Requesters can cancel their requests" on public.reservations;
create policy "Requesters can cancel their requests"
  on public.reservations for update
  using (requester_id = auth.uid())
  with check (requester_id = auth.uid() and status = 'cancelled');
