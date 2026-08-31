-- Run in Supabase SQL Editor.

-- View counts, one per listing type.
alter table public.listings add column if not exists view_count int not null default 0;
alter table public.rentals add column if not exists view_count int not null default 0;
alter table public.services add column if not exists view_count int not null default 0;
alter table public.jobs add column if not exists view_count int not null default 0;

-- One function per table (kept simple and explicit rather than dynamic SQL,
-- which is safer against injection). SECURITY DEFINER so any visitor
-- (even not logged in) can increment a view count without needing write
-- access to the whole listings table.
create or replace function public.increment_listing_views(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.listings set view_count = view_count + 1 where id = p_id;
end;
$$;

create or replace function public.increment_rental_views(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.rentals set view_count = view_count + 1 where id = p_id;
end;
$$;

create or replace function public.increment_service_views(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.services set view_count = view_count + 1 where id = p_id;
end;
$$;

create or replace function public.increment_job_views(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.jobs set view_count = view_count + 1 where id = p_id;
end;
$$;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
grant execute on function public.increment_rental_views(uuid) to anon, authenticated;
grant execute on function public.increment_service_views(uuid) to anon, authenticated;
grant execute on function public.increment_job_views(uuid) to anon, authenticated;

-- Listing-level reviews — "how was this specific listing/transaction",
-- separate from the person-level reviews on profiles.
create table public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('listing', 'rental', 'service', 'job')),
  listing_id uuid not null,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (listing_type, listing_id, reviewer_id)
);

alter table public.listing_reviews enable row level security;

create policy "Listing reviews are viewable by everyone"
  on public.listing_reviews for select
  using (true);

create policy "Users can review a listing"
  on public.listing_reviews for insert
  with check (auth.uid() = reviewer_id);
