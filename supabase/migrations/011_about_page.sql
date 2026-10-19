-- Editable site pages (About us). Everyone can read, only admins can write.
create table if not exists public.site_pages (
  slug text primary key,
  content text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_pages enable row level security;

drop policy if exists "Site pages are public" on public.site_pages;
create policy "Site pages are public" on public.site_pages
  for select using (true);

drop policy if exists "Admins insert site pages" on public.site_pages;
create policy "Admins insert site pages" on public.site_pages
  for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

drop policy if exists "Admins update site pages" on public.site_pages;
create policy "Admins update site pages" on public.site_pages
  for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));
