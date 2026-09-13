update events
set title = 'FIFA League · финал',
    description = 'FIFA League: финальные раунды и главный матч.'
where id = '00000000-0000-4000-8000-000000000039';

update competitions
set title = 'FIFA LEAGUE',
    description = 'FIFA League для участников форума.'
where slug = 'fifa';

update coin_rules
set name = 'FIFA League participant'
where key = 'fifa';

update events
set description = 'Публикация финалистов Startup Battle, NIS EduTech Hackathon и FIFA League.'
where id = '00000000-0000-4000-8000-000000000027';
