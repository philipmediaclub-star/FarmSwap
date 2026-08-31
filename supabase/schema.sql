-- FarmSwap database schema
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

-- ============================================================
-- PROFILES
-- One row per user, linked 1:1 to Supabase's built-in auth.users.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  farm_name text,
  location text,
  bio text,
  date_of_birth date not null,
  avatar_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Enforce the 16+ minimum age at the database level, not just the UI.
alter table public.profiles
  add constraint minimum_age_16
  check (date_of_birth <= (current_date - interval '16 years'));

-- Automatically create a profile row when someone signs up.
-- (date_of_birth and full_name are passed in via signup metadata.)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Ny bruker'),
    (new.raw_user_meta_data->>'date_of_birth')::date
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LISTINGS (Buy & Sell)
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  category text not null,
  condition text,
  year int,
  hours int,
  brand text,
  location text not null,
  latitude numeric,
  longitude numeric,
  image_urls text[] default '{}',
  status text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Active listings are viewable by everyone"
  on public.listings for select
  using (status = 'active' or seller_id = auth.uid());

create policy "Users can create their own listings"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = seller_id);

create policy "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- ============================================================
-- RENTALS (Rent & Borrow)
-- ============================================================
create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  daily_price numeric not null,
  weekly_price numeric,
  category text not null,
  conditions text,
  location text not null,
  latitude numeric,
  longitude numeric,
  image_urls text[] default '{}',
  status text not null default 'active' check (status in ('active', 'paused', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.rentals enable row level security;

create policy "Active rentals are viewable by everyone"
  on public.rentals for select
  using (status = 'active' or owner_id = auth.uid());

create policy "Users can create their own rentals"
  on public.rentals for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own rentals"
  on public.rentals for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own rentals"
  on public.rentals for delete
  using (auth.uid() = owner_id);

-- ============================================================
-- RESERVATIONS
-- Reservation *requests* only — no payment is processed.
-- ============================================================
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

alter table public.reservations enable row level security;

create policy "Requesters and rental owners can view reservations"
  on public.reservations for select
  using (
    requester_id = auth.uid()
    or exists (
      select 1 from public.rentals
      where rentals.id = reservations.rental_id
      and rentals.owner_id = auth.uid()
    )
  );

create policy "Users can create reservation requests"
  on public.reservations for insert
  with check (auth.uid() = requester_id);

create policy "Owners can update reservation status"
  on public.reservations for update
  using (
    exists (
      select 1 from public.rentals
      where rentals.id = reservations.rental_id
      and rentals.owner_id = auth.uid()
    )
  );

-- ============================================================
-- SERVICES (offered or requested farm services)
-- ============================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  price_type text not null default 'contact' check (price_type in ('fixed', 'contact')),
  price numeric,
  location text not null,
  availability text,
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Active services are viewable by everyone"
  on public.services for select
  using (status = 'active' or provider_id = auth.uid());

create policy "Users can create their own services"
  on public.services for insert
  with check (auth.uid() = provider_id);

create policy "Users can update their own services"
  on public.services for update
  using (auth.uid() = provider_id);

create policy "Users can delete their own services"
  on public.services for delete
  using (auth.uid() = provider_id);

-- ============================================================
-- JOBS (Help & Jobs board)
-- ============================================================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text not null,
  job_date date,
  duration text,
  payment text,
  status text not null default 'active' check (status in ('active', 'filled', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Active jobs are viewable by everyone"
  on public.jobs for select
  using (status = 'active' or poster_id = auth.uid());

create policy "Users can post jobs"
  on public.jobs for insert
  with check (auth.uid() = poster_id);

create policy "Users can update their own jobs"
  on public.jobs for update
  using (auth.uid() = poster_id);

create policy "Users can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = poster_id);

-- ============================================================
-- FAVORITES
-- ============================================================
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_type text not null check (listing_type in ('listing', 'rental', 'service', 'job')),
  listing_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_type, listing_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- MESSAGES (prototype in-app messaging)
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  related_listing_id uuid,
  created_at timestamptz not null default now(),
  unique (participant_a, participant_b, related_listing_id)
);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Users can start conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Participants can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_a = auth.uid() or conversations.participant_b = auth.uid())
    )
  );

create policy "Participants can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.participant_a = auth.uid() or conversations.participant_b = auth.uid())
    )
  );

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Users can leave reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- ============================================================
-- REPORTS (content moderation)
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_type text not null check (listing_type in ('listing', 'rental', 'service', 'job', 'user')),
  listing_id uuid,
  reported_user_id uuid references public.profiles(id),
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Users can file reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- Note: admin dashboard access (viewing/resolving all reports) is handled
-- via a separate service-role-only path, never through client-side RLS.
