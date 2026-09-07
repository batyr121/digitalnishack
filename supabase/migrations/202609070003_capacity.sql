create function public.event_availability() returns table(event_id uuid,available integer) language sql stable security definer set search_path=public as $$select e.id,case when e.capacity is null then null else greatest(0,e.capacity-(select count(*)::integer from event_registrations r where r.event_id=e.id and r.status in ('REGISTERED','ATTENDED'))) end from events e where e.published$$;
revoke execute on function event_availability() from public;
grant execute on function event_availability() to anon,authenticated;
