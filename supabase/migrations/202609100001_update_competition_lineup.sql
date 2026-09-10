update events
set title = 'FIFA Tournament for 7–8 Grades · The Final',
    description = 'Tournament for 7–8 grade students, final rounds and championship match.'
where id = '00000000-0000-4000-8000-000000000039';

update competitions
set title = 'STARTUP WOMEN',
    description = 'A stage for girls and young women launching their own ideas.'
where slug = 'jas-startuper';

update competitions
set title = 'FIFA TOURNAMENT FOR 7–8 GRADES',
    description = 'Tournament for 7–8 grade students.'
where slug = 'fifa';

update coin_rules
set name = 'Startup Women participant'
where key = 'jas_startuper';

update coin_rules
set name = 'FIFA Tournament 7–8 participant'
where key = 'fifa';
