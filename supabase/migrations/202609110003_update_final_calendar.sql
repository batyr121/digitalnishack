update events
set title = 'Startup + Pitching',
    description = 'Мастер-класс про стартап-мышление, сильную идею, структуру питча и уверенную презентацию проекта.',
    day = 14,
    track = 'СТАРТАПЫ',
    location = 'Главная сцена',
    published = true,
    registration_required = true,
    reward_rule_key = 'masterclass'
where id = '00000000-0000-4000-8000-000000000016';

update events
set title = 'Artisan 3D Modeling',
    description = 'Практический мастер-класс от Artisan Education: 3D-моделирование, форма, идея и аккуратный цифровой объект.',
    day = 17,
    track = '3D',
    location = '3D Lab',
    published = true,
    registration_required = true,
    reward_rule_key = '3d'
where id = '00000000-0000-4000-8000-000000000017';

update events
set title = 'Объявление финалистов',
    description = 'Публикация финалистов Startup Battle, NIS EduTech Hackathon и FIFA Tournament for 7–8 Grades.',
    day = 18,
    track = 'DIGITAL APTA',
    location = 'Онлайн',
    published = true,
    registration_required = false,
    reward_rule_key = null
where id = '00000000-0000-4000-8000-000000000027';

update events
set published = false
where id in (
  '00000000-0000-4000-8000-000000000015',
  '00000000-0000-4000-8000-000000000025',
  '00000000-0000-4000-8000-000000000018'
);
