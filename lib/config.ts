export const eventConfig = {
  eventName: 'DIGITAL NIS FORUM',
  tagline: 'БІРГЕ ЖАСАЙМЫЗ',
  startDate: '2026-09-12T09:00:00+05:00',
  mainForumDate: '2026-09-19T09:00:00+05:00',
  endDate: '2026-09-19T18:00:00+05:00',
  dateLabel: '19.09.2026',
  aptaLabel: '12–18 СЕНТЯБРЯ 2026',
  location: 'Nazarbayev Intellectual School · место скоро объявим',
  registrationEnabled: true,
  certificateThreshold: 400,
  socials: [],
  contacts: [],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};
export const tracks = [
  'ВСЁ',
  'DIGITAL APTA',
  'ГЛАВНАЯ СЦЕНА',
  'СТАРТАПЫ',
  'ХАКАТОН',
  'ОБРАЗОВАНИЕ',
  'ИГРЫ',
  '3D',
  'ВОРКШОПЫ',
];
export type EventRecord = {
  id: string;
  title: string;
  description: string;
  day: number;
  time: string;
  track: string;
  location: string;
  capacity: number | null;
  registration_required: boolean;
  coins: number;
  speaker?: string;
  available?: number | null;
};
export const events: EventRecord[] = [
  {
    id: '00000000-0000-4000-8000-000000000012',
    title: 'Открытие Digital Apta',
    description: 'Знакомство с участниками и старт недели практики.',
    day: 12,
    time: 'TBA',
    track: 'DIGITAL APTA',
    location: 'Место скоро объявим',
    capacity: null,
    registration_required: false,
    coins: 20,
  },
  {
    id: '00000000-0000-4000-8000-000000000013',
    title: 'Акселерация стартапов',
    description:
      '12–18 сентября: менторство, бизнес-модели, презентации и подготовка к Startup Battle.',
    day: 12,
    time: 'TBA',
    track: 'СТАРТАПЫ',
    location: 'Место скоро объявим',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000016',
    title: 'Startup + Pitching',
    description:
      'Мастер-класс про стартап-мышление, сильную идею, структуру питча и уверенную презентацию проекта.',
    day: 14,
    time: 'TBA',
    track: 'СТАРТАПЫ',
    location: 'Главная сцена',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000017',
    title: 'Artisan 3D Modeling',
    description:
      'Практический мастер-класс от Artisan Education: 3D-моделирование, форма, идея и аккуратный цифровой объект.',
    day: 17,
    time: 'TBA',
    track: '3D',
    location: '3D Lab',
    capacity: null,
    registration_required: true,
    coins: 50,
  },
  {
    id: '00000000-0000-4000-8000-000000000027',
    title: 'Объявление финалистов',
    description: 'Публикация финалистов Startup Battle, NIS EduTech Hackathon и FIFA Tournament for 7–8 Grades.',
    day: 18,
    time: 'TBA',
    track: 'DIGITAL APTA',
    location: 'Онлайн',
    capacity: null,
    registration_required: false,
    coins: 0,
  },
  ...[1, 2, 3].map((n) => ({
    id: `00000000-0000-4000-8000-00000000003${n}`,
    title: `Сессия 0${n} · Спикер скоро`,
    description: 'Тема скоро будет объявлена.',
    day: 19,
    time: 'TBA',
    track: 'ГЛАВНАЯ СЦЕНА',
    location: 'Главная сцена',
    capacity: null,
    registration_required: true,
    coins: 30,
  })),
  {
    id: '00000000-0000-4000-8000-000000000019',
    title: 'Панельная дискуссия',
    description: 'Три взгляда, один разговор и вопросы участников.',
    day: 19,
    time: 'TBA',
    track: 'ГЛАВНАЯ СЦЕНА',
    location: 'Главная сцена',
    capacity: null,
    registration_required: true,
    coins: 40,
  },
  {
    id: '00000000-0000-4000-8000-000000000029',
    title: 'Startup Battle · финал',
    description: 'Восемь стартапов на одной сцене.',
    day: 19,
    time: 'TBA',
    track: 'СТАРТАПЫ',
    location: 'Главная сцена',
    capacity: null,
    registration_required: true,
    coins: 30,
  },
  {
    id: '00000000-0000-4000-8000-000000000039',
    title: 'FIFA Tournament for 7–8 Grades · финал',
    description:
      'Турнир для 7–8 классов, финальные раунды и главный матч.',
    day: 19,
    time: 'TBA',
    track: 'ИГРЫ',
    location: 'Гостевая зона',
    capacity: null,
    registration_required: true,
    coins: 80,
  },
];
export const competitions = [
  {
    slug: 'startup-battle',
    title: 'STARTUP BATTLE',
    tag: 'ИДЕЯ. ПИТЧ. СЦЕНА.',
    description: '8 стартапов на одной сцене. Покажи свою идею.',
    slots: 8,
    icon: '↗',
  },
  {
    slug: 'hackathon',
    title: 'NIS EDUTECH HACKATHON',
    tag: 'СОЗДАЙ БУДУЩЕЕ ОБРАЗОВАНИЯ.',
    description: 'Реальные задачи и технологические решения для обучения.',
    slots: 0,
    icon: '⌘',
  },
  {
    slug: 'fifa',
    title: 'FIFA TOURNAMENT FOR 7–8 GRADES',
    tag: 'ТВОЯ ИГРА. ТВОЙ ФИНАЛ.',
    description: 'Турнир для учеников 7–8 классов.',
    slots: 0,
    icon: '⊕',
  },
];
export const zones = [
  {
    name: 'Главная сцена',
    description: 'Спикеры, большие идеи и панельная дискуссия.',
    icon: '01',
  },
  {
    name: 'Startup Battle',
    description: 'Восемь финалистов и их идеи.',
    icon: '02',
  },
  { name: 'Зона хакатона', description: 'Команды создают решения для образования.', icon: '03' },
  { name: '3D Lab', description: 'От цифровой модели к реальному объекту.', icon: '04' },
  {
    name: 'Digital Lab',
    description: 'Технологии через живые демонстрации.',
    icon: '05',
  },
  {
    name: 'Регистрация',
    description: 'Покажите цифровой пропуск и получите браслет.',
    icon: '06',
  },
  {
    name: 'Нетворкинг и отдых',
    description: 'Новые знакомства, разговоры и пауза между событиями.',
    icon: '07',
  },
  {
    name: 'Гостевая зона',
    description: 'Пространство для гостей, участников и партнёров.',
    icon: '08',
  },
];
export const faq = [
  [
    'Форум бесплатный?',
    'Да. Участие бесплатное. Для цифрового пропуска нужна одобренная заявка или промокод.',
  ],
  [
    'Нужно печатать пропуск?',
    'Нет. Откройте цифровой пропуск на телефоне и покажите QR-код на регистрации.',
  ],
  [
    'Как получить пропуск?',
    'Подайте заявку и дождитесь одобрения или активируйте промокод от организаторов.',
  ],
  [
    'Что такое баллы?',
    'Это баллы за участие в активностях форума. Их нельзя купить, продать или обменять на деньги.',
  ],
  [
    'Можно получить сертификат?',
    'Да. Участвуйте в активностях и наберите нужное количество баллов в личном кабинете.',
  ],
  [
    'Кто может участвовать?',
    'Ученики, учителя, основатели проектов, разработчики, приглашённые гости и технологическое сообщество.',
  ],
];
