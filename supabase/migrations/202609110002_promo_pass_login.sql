create table if not exists public.simple_passes(
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(extensions.gen_random_bytes(32),'hex'),
  promo_code_id uuid references public.promo_codes(id),
  promo_code text not null,
  full_name text not null,
  organization text not null default '',
  participant_role text not null default 'Участник',
  grade text,
  type text not null default 'GENERAL',
  status text not null default 'ACTIVE' check(status in ('ACTIVE','REVOKED')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.simple_coin_transactions(
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references public.simple_passes(id) on delete cascade,
  amount integer not null check(amount <> 0),
  reason text not null,
  source_key text not null,
  created_at timestamptz not null default now(),
  unique(pass_id, source_key)
);

create table if not exists public.simple_attendance(
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references public.simple_passes(id) on delete cascade,
  event_id uuid references public.events(id),
  coins_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique(pass_id, event_id)
);

alter table public.simple_passes enable row level security;
alter table public.simple_coin_transactions enable row level security;
alter table public.simple_attendance enable row level security;

create or replace function public.quick_activate_promo(
  invitation_code text,
  full_name_input text,
  organization_input text default '',
  participant_role_input text default 'Участник',
  grade_input text default null
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  code_norm text := upper(trim(invitation_code));
  p promo_codes;
  existing simple_passes;
  pass simple_passes;
begin
  if code_norm = '' or length(code_norm) < 6 then
    return jsonb_build_object('error','Введите промокод.');
  end if;
  if trim(full_name_input) = '' or length(trim(full_name_input)) < 2 then
    return jsonb_build_object('error','Введите имя и фамилию.');
  end if;

  select * into p from promo_codes where upper(code) = code_norm for update;
  if p.id is null or not p.active or (p.expires_at is not null and p.expires_at <= now()) then
    return jsonb_build_object('error','Промокод недействителен или истёк.');
  end if;

  select * into existing from simple_passes
  where promo_code_id = p.id and status = 'ACTIVE'
  order by created_at desc
  limit 1;

  if p.used_count >= p.max_uses then
    if existing.id is not null then
      return jsonb_build_object(
        'message','Пропуск открыт.',
        'ticket_token',existing.token,
        'name',existing.full_name,
        'type',existing.type
      );
    end if;
    return jsonb_build_object('error','Лимит промокода уже использован.');
  end if;

  insert into simple_passes(
    promo_code_id,
    promo_code,
    full_name,
    organization,
    participant_role,
    grade,
    type
  ) values(
    p.id,
    p.code,
    trim(full_name_input),
    coalesce(nullif(trim(organization_input),''),'NIS Aktau'),
    coalesce(nullif(trim(participant_role_input),''),'Участник'),
    nullif(trim(coalesce(grade_input,'')),''),
    p.type
  ) returning * into pass;

  update promo_codes set used_count = used_count + 1 where id = p.id;

  return jsonb_build_object(
    'message','Пропуск готов.',
    'ticket_token',pass.token,
    'name',pass.full_name,
    'type',pass.type
  );
end
$$;

create or replace function public.quick_pass_by_token(ticket_token text) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  pass simple_passes;
  balance integer;
begin
  select * into pass from simple_passes where token = ticket_token;
  if pass.id is null or pass.status <> 'ACTIVE' then
    return jsonb_build_object('error','Пропуск не найден.');
  end if;

  select coalesce(sum(amount),0) into balance from simple_coin_transactions where pass_id = pass.id;

  return jsonb_build_object(
    'valid',true,
    'id',pass.id,
    'token',pass.token,
    'name',pass.full_name,
    'organization',pass.organization,
    'role',pass.participant_role,
    'grade',pass.grade,
    'type',pass.type,
    'status',pass.status,
    'checked_in_at',pass.checked_in_at,
    'balance',balance
  );
end
$$;

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
  sp simple_passes;
begin
  select value #>> '{}' into expected from site_settings where key = 'quickAdminCode';
  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;

  select * into t from tickets where token = ticket_token;
  if t.id is not null and t.status = 'ACTIVE' then
    select * into p from profiles where id = t.user_id;
    return jsonb_build_object('valid',true,'name',coalesce(p.full_name,''),'role',coalesce(p.participant_role,''),'type',t.type,'checked_in_at',t.checked_in_at,'message',case when t.checked_in_at is null then 'VALID PASS' else 'ALREADY CHECKED IN' end);
  end if;

  select * into sp from simple_passes where token = ticket_token;
  if sp.id is null or sp.status <> 'ACTIVE' then
    return jsonb_build_object('valid',false,'message','INVALID PASS');
  end if;

  return jsonb_build_object('valid',true,'name',sp.full_name,'role',sp.participant_role,'type',sp.type,'checked_in_at',sp.checked_in_at,'message',case when sp.checked_in_at is null then 'VALID PASS' else 'ALREADY CHECKED IN' end);
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
  sp simple_passes;
  points integer := 0;
begin
  select value #>> '{}' into expected from site_settings where key = 'quickAdminCode';
  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;

  select * into t from tickets where token = ticket_token for update;
  if t.id is not null and t.status = 'ACTIVE' then
    if event_id_input is null then
      if t.checked_in_at is not null then return jsonb_build_object('message','ALREADY CHECKED IN','time',t.checked_in_at); end if;
      update tickets set checked_in_at = now() where id = t.id;
      points := coalesce((select r.points from coin_rules r where key = 'check_in' and active), 0);
      perform award(t.user_id, points, 'Forum check-in', 'check_in');
    else
      select * into e from events where id = event_id_input;
      if e.id is null then return jsonb_build_object('error','EVENT NOT FOUND'); end if;
      insert into event_registrations(user_id,event_id,status) values(t.user_id,e.id,'ATTENDED') on conflict(user_id,event_id) do update set status='ATTENDED';
      insert into attendance(user_id,event_id,scanned_by,coins_awarded) values(t.user_id,e.id,t.user_id,e.coins) on conflict(user_id,event_id) do nothing;
      perform award(t.user_id,e.coins,'Attendance: '||e.title,'event:'||e.id::text);
      points := e.coins;
    end if;
    return jsonb_build_object('message','CHECKED IN','points',coalesce(points,0));
  end if;

  select * into sp from simple_passes where token = ticket_token for update;
  if sp.id is null or sp.status <> 'ACTIVE' then
    return jsonb_build_object('error','INVALID PASS');
  end if;

  if event_id_input is null then
    if sp.checked_in_at is not null then return jsonb_build_object('message','ALREADY CHECKED IN','time',sp.checked_in_at); end if;
    update simple_passes set checked_in_at = now() where id = sp.id;
    points := coalesce((select r.points from coin_rules r where key = 'check_in' and active), 0);
    if points <> 0 then
      insert into simple_coin_transactions(pass_id,amount,reason,source_key) values(sp.id,points,'Вход на форум','check_in') on conflict(pass_id,source_key) do nothing;
    end if;
  else
    select * into e from events where id = event_id_input;
    if e.id is null then return jsonb_build_object('error','EVENT NOT FOUND'); end if;
    points := coalesce(e.coins,0);
    insert into simple_attendance(pass_id,event_id,coins_awarded) values(sp.id,e.id,points) on conflict(pass_id,event_id) do nothing;
    if points <> 0 then
      insert into simple_coin_transactions(pass_id,amount,reason,source_key) values(sp.id,points,'Участие: '||e.title,'event:'||e.id::text) on conflict(pass_id,source_key) do nothing;
    end if;
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
  sp simple_passes;
begin
  select value #>> '{}' into expected from site_settings where key = 'quickAdminCode';
  if expected is null or admin_code_input is distinct from expected then
    raise exception 'Wrong admin code';
  end if;
  if amount_input = 0 or amount_input < -10000 or amount_input > 10000 then
    raise exception 'Invalid amount';
  end if;

  select * into t from tickets where token = ticket_token;
  if t.id is not null and t.status = 'ACTIVE' then
    perform award(t.user_id, amount_input, reason_input, 'quick_award:' || encode(extensions.gen_random_bytes(8),'hex'));
    return jsonb_build_object('message','Coin adjustment recorded','points',amount_input);
  end if;

  select * into sp from simple_passes where token = ticket_token;
  if sp.id is null or sp.status <> 'ACTIVE' then
    return jsonb_build_object('error','INVALID PASS');
  end if;

  insert into simple_coin_transactions(pass_id,amount,reason,source_key)
  values(sp.id,amount_input,reason_input,'quick_award:' || encode(extensions.gen_random_bytes(8),'hex'));
  return jsonb_build_object('message','Coin adjustment recorded','points',amount_input);
end
$$;

grant execute on function public.quick_activate_promo(text,text,text,text,text) to anon,authenticated;
grant execute on function public.quick_pass_by_token(text) to anon,authenticated;
grant execute on function public.quick_inspect_ticket(text,text) to anon,authenticated;
grant execute on function public.quick_scan_ticket(text,text,uuid) to anon,authenticated;
grant execute on function public.quick_award_coins_by_ticket(text,text,integer,text) to anon,authenticated;
