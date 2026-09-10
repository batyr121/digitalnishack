update events
set title = 'Startup & Pitching',
    description = 'Startup thinking, a strong idea, pitch structure and confident project presentation.',
    day = 14,
    track = 'STARTUPS',
    location = 'Main Stage'
where id = '00000000-0000-4000-8000-000000000016';

update events
set title = 'Artisan 3D Modeling',
    description = 'A practical 3D modeling masterclass: from form and idea to a clean digital object.',
    day = 16,
    track = '3D',
    location = '3D Lab'
where id = '00000000-0000-4000-8000-000000000017';

update events
set title = 'Mock Day: Hackathon & Startup Battle',
    description = 'Test day for hackathon and Startup Battle teams: solution run-throughs, pitches and feedback before the final.',
    day = 17,
    track = 'HACKATHON',
    location = 'Main Stage'
where id = '00000000-0000-4000-8000-000000000018';

update events
set reward_rule_key = case
  when track = '3D' then '3d'
  else 'masterclass'
end
where id in (
  '00000000-0000-4000-8000-000000000016',
  '00000000-0000-4000-8000-000000000017',
  '00000000-0000-4000-8000-000000000018'
);
