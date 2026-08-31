-- Run this AFTER schema.sql, in the same SQL Editor.
-- Creates a public storage bucket for listing/rental photos, with policies
-- so anyone can view images but only the uploader can manage their own.

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload their own listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Images are expected to be uploaded to paths like:
--   {user_id}/{listing_id}/{filename}
-- so the folder-based policy above can check ownership correctly.
