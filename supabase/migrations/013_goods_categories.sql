-- Sell goods as well as equipment (firewood, hay, feed ...): price per unit + more categories.
alter table public.listings add column if not exists price_unit text not null default 'stk';

-- keep "Annet" last, then add the new categories
update public.categories set sort_order = 100 where section = 'sell' and name = 'Annet';

insert into public.categories (section, name, sort_order) values
  ('sell','Ved og brensel',10),
  ('sell','Høy, halm og strø',11),
  ('sell','Fôr og kraftfôr',12),
  ('sell','Frø, planter og settepoteter',13),
  ('sell','Gjødsel og jord',14),
  ('sell','Dyr',15),
  ('sell','Mat og råvarer fra gården',16),
  ('sell','Tømmer og trevirke',17),
  ('sell','Gjerde og bygg',18),
  ('sell','Verktøy og småutstyr',19),
  ('sell','Reservedeler',20),
  ('sell','Bil, ATV og kjøretøy',21)
on conflict (section, name) do nothing;
