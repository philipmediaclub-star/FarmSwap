-- Safe to re-run. Ensures admins can see and remove every type of ad.
create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

do $$
declare t text;
begin
  foreach t in array array['listings','rentals','services','jobs'] loop
    execute format('drop policy if exists "Admins can view all %1$s" on public.%1$s', t);
    execute format('drop policy if exists "Admins can update any %1$s" on public.%1$s', t);
    execute format('create policy "Admins can view all %1$s" on public.%1$s for select using (public.is_admin(auth.uid()))', t);
    execute format('create policy "Admins can update any %1$s" on public.%1$s for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))', t);
  end loop;
end $$;
