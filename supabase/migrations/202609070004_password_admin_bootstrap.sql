create or replace function public.new_profile() returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into profiles(id,email,role)
  values(
    new.id,
    coalesce(new.email,''),
    case
      when lower(coalesce(new.email,'')) = 'amantaibatyrkhan11@gmail.com' then 'ADMIN'
      else 'USER'
    end
  );
  return new;
end
$$;

update public.profiles
set role = 'ADMIN'
where lower(email) = 'amantaibatyrkhan11@gmail.com';
