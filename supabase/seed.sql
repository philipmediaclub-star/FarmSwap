-- Optional: run this AFTER schema.sql and after at least one real user has
-- signed up (it needs a real profile id to attach demo listings to).
--
-- Replace 'YOUR-USER-ID' below with a real id from:
--   select id, full_name from public.profiles;

insert into public.listings (seller_id, title, description, price, category, condition, year, hours, location)
values
  ('YOUR-USER-ID', 'John Deere 6155R', 'Godt vedlikeholdt traktor, service-historikk tilgjengelig.', 850000, 'Traktor', 'Godt brukt', 2019, 2400, 'Innlandet'),
  ('YOUR-USER-ID', 'Väderstad Carrier 500', 'Kompakt harv i god stand.', 320000, 'Jordbruksutstyr', 'Godt brukt', 2017, null, 'Trøndelag'),
  ('YOUR-USER-ID', 'Krone Tilhenger 12t', 'Solid tilhenger for daglig bruk.', 145000, 'Tilhenger', 'Brukt', 2015, null, 'Rogaland');

insert into public.rentals (owner_id, title, description, daily_price, weekly_price, category, conditions, location)
values
  ('YOUR-USER-ID', 'Vedkløyver 8 tonn', 'Kraftig vedkløyver på tilhenger.', 500, 2500, 'Redskap', 'Leietaker henter og returnerer selv.', 'Vestfold'),
  ('YOUR-USER-ID', 'Väderstad Rapid Såmaskin', '4 meter såmaskin, godt vedlikeholdt.', 1800, 9000, 'Såmaskin', 'Krever traktorførerbevis.', 'Trøndelag');
