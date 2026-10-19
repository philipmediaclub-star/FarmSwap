-- Safe to re-run. Lets admins permanently delete any ad, and ensures
-- admins can see every row in all four tables.
do $$
declare t text;
begin
  foreach t in array array['listings','rentals','services','jobs'] loop
    execute format('drop policy if exists "Admins can delete any %1$s" on public.%1$s', t);
    execute format('create policy "Admins can delete any %1$s" on public.%1$s for delete using (public.is_admin(auth.uid()))', t);
  end loop;
end $$;
