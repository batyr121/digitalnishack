insert into public.site_settings(key,value)
values ('quickAdminCode','"DNF-ADMIN-2026"')
on conflict (key) do nothing;

create or replace function public.quick_generate_promos(
  admin_code_input text,
  count_input integer,
  type_input text,
  max_uses_input integer default 1
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  expected text;
  generated text[];
begin
  select value #>> '{}' into expected
  from site_settings
  where key = 'quickAdminCode';

  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;

  if count_input not between 1 and 500 or max_uses_input not between 1 and 10000 then
    raise exception 'Invalid limits';
  end if;

  if type_input not in (
    'GENERAL',
    'GUEST',
    'PARTICIPANT',
    'STARTUP_BATTLE',
    'HACKATHON',
    'FIFA',
    'SPEAKER',
    'PARTNER',
    'ORGANIZER',
    'VIP_GUEST'
  ) then
    raise exception 'Invalid pass type';
  end if;

  with inserted as (
    insert into promo_codes(code,type,max_uses,name)
    select
      'DNF-' || upper(encode(extensions.gen_random_bytes(4),'hex')) || '-' || upper(encode(extensions.gen_random_bytes(4),'hex')),
      type_input,
      max_uses_input,
      'Quick generated invitation'
    from generate_series(1,count_input)
    returning code
  )
  select array_agg(code order by code) into generated
  from inserted;

  return jsonb_build_object(
    'message',
    count_input || ' invitation codes created',
    'codes',
    generated
  );
end
$$;

grant execute on function public.quick_generate_promos(text,integer,text,integer) to anon,authenticated;
