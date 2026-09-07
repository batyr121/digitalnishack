update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmed_at = coalesce(confirmed_at, now()),
  updated_at = now()
where lower(email) = 'amantaibatyrkhan11@gmail.com';

insert into public.profiles(id, email, role)
select id, email, 'ADMIN'
from auth.users
where lower(email) = 'amantaibatyrkhan11@gmail.com'
on conflict (id) do update
set
  email = excluded.email,
  role = 'ADMIN';
