insert into public.site_settings(key,value)
values ('quickAdminCode','"DNF-ADMIN-2026"')
on conflict (key) do nothing;

create or replace function public.quick_inspect_ticket(
  admin_code_input text,
  ticket_token text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  expected text;
  t tickets;
  p profiles;
begin
  select value #>> '{}' into expected from site_settings where key = 'quickAdminCode';
  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;

  select * into t from tickets where token = ticket_token;
  if t.id is null or t.status <> 'ACTIVE' then
    return jsonb_build_object('valid',false,'message','INVALID PASS');
  end if;

  select * into p from profiles where id = t.user_id;
  return jsonb_build_object(
    'valid',true,
    'name',coalesce(p.full_name,''),
    'role',coalesce(p.participant_role,''),
    'type',t.type,
    'checked_in_at',t.checked_in_at,
    'message',case when t.checked_in_at is null then 'VALID PASS' else 'ALREADY CHECKED IN' end
  );
end
$$;

create or replace function public.quick_scan_ticket(
  admin_code_input text,
  ticket_token text,
  event_id_input uuid default null
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  expected text;
  t tickets;
  e events;
  points integer;
begin
  select value #>> '{}' into expected from site_settings where key = 'quickAdminCode';
  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;

  select * into t from tickets where token = ticket_token for update;
  if t.id is null or t.status <> 'ACTIVE' then
    return jsonb_build_object('error','INVALID PASS');
  end if;

  if event_id_input is null then
    if t.checked_in_at is not null then
      return jsonb_build_object('message','ALREADY CHECKED IN','time',t.checked_in_at);
    end if;
    update tickets set checked_in_at = now() where id = t.id;
    points := coalesce((select r.points from coin_rules r where key = 'check_in' and active), 0);
    perform award(t.user_id, points, 'Forum check-in', 'check_in');
  else
    select * into e from events where id = event_id_input;
    if e.id is null then
      return jsonb_build_object('error','EVENT NOT FOUND');
    end if;
    insert into event_registrations(user_id,event_id,status)
    values(t.user_id,e.id,'ATTENDED')
    on conflict(user_id,event_id) do update set status='ATTENDED';
    insert into attendance(user_id,event_id,scanned_by,coins_awarded)
    values(t.user_id,e.id,t.user_id,e.coins)
    on conflict(user_id,event_id) do nothing;
    perform award(t.user_id,e.coins,'Attendance: '||e.title,'event:'||e.id::text);
  end if;

  return jsonb_build_object('message','CHECKED IN','points',coalesce(points,0));
end
$$;

create or replace function public.quick_award_coins_by_ticket(
  admin_code_input text,
  ticket_token text,
  amount_input integer,
  reason_input text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  expected text;
  t tickets;
begin
  select value #>> '{}' into expected from site_settings where key = 'quickAdminCode';
  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;

  if amount_input = 0 or amount_input < -10000 or amount_input > 10000 then
    raise exception 'Invalid amount';
  end if;

  select * into t from tickets where token = ticket_token;
  if t.id is null or t.status <> 'ACTIVE' then
    return jsonb_build_object('error','INVALID PASS');
  end if;

  perform award(t.user_id, amount_input, reason_input, 'quick_award:' || encode(extensions.gen_random_bytes(8),'hex'));
  return jsonb_build_object('message','Coin adjustment recorded','points',amount_input);
end
$$;

grant execute on function public.quick_inspect_ticket(text,text) to anon,authenticated;
grant execute on function public.quick_scan_ticket(text,text,uuid) to anon,authenticated;
grant execute on function public.quick_award_coins_by_ticket(text,text,integer,text) to anon,authenticated;
