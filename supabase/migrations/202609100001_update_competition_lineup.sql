update events
set title = 'FIFA League · The Final',
    description = 'FIFA League finals and championship match.'
where id = '00000000-0000-4000-8000-000000000039';

update competitions
set title = 'FIFA LEAGUE',
    description = 'FIFA League tournament.'
where slug = 'fifa';


update coin_rules
set name = 'FIFA League participant'
where key = 'fifa';
