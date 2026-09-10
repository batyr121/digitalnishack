alter table partners drop constraint if exists partners_type_check;

alter table partners
  add constraint partners_type_check
  check (type in (
    'ORGANIZER',
    'GENERAL PARTNER',
    'PARTNER',
    'TECH PARTNER',
    'TECHNICAL PARTNER',
    'OPERATIONAL PARTNER',
    'COMMUNITY PARTNER',
    'MEDIA PARTNER'
  ));

insert into partners(id,name,logo,website,type)
values(
  '40000000-0000-4000-8000-000000000001',
  'Artisan Education',
  '/partners/artisan-education.svg',
  'https://artisan.education',
  'GENERAL PARTNER'
)
on conflict(id) do update
set name = excluded.name,
    logo = excluded.logo,
    website = excluded.website,
    type = excluded.type;
