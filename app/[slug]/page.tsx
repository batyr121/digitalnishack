import { locale } from '@/lib/locale';
import { translatedPage } from '@/locales/pages';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowUpRight } from 'lucide-react';
import { PageIntro, Button, SecretSpeakerCard, Empty } from '@/components/ui';
import { ApplyForm, PromoForm, LoginForm, CompetitionForm } from '@/components/forms';
import { ScheduleTimeline } from '@/components/schedule';
import { events, competitions, zones, eventConfig } from '@/lib/config';
import { configured, db, publicRows } from '@/lib/supabase';
const pages: Record<string, [string, string, string]> = {
  program: [
    'ПРОГРАММА',
    'Идеи в расписании.',
    'Восемь дней обучения, практики и новых знакомств.',
  ],
  'digital-apta': [
    '12—18 СЕНТЯБРЯ 2026',
    'DIGITAL\nAPTA.',
    'Неделя перед форумом: практика, подготовка и командная работа.',
  ],
  speakers: [
    'СПИКЕРЫ',
    'Большие идеи.\nПока под секретом.',
    'Три спикера и три участника панельной дискуссии.',
  ],
  zones: [
    'ЗОНЫ ФОРУМА',
    'Найдите своё место.',
    'Главная сцена, лаборатории, нетворкинг и зоны практики.',
  ],
  apply: [
    'ВХОД БЕСПЛАТНЫЙ · НУЖНА РЕГИСТРАЦИЯ',
    'Подайте заявку\nна форум.',
    'После одобрения цифровой пропуск появится в личном кабинете.',
  ],
  activate: [
    'ПРОМОКОД',
    'Активируйте\nпропуск.',
    'Введите код от организатора, чтобы получить цифровой пропуск.',
  ],
  login: [
    'ВХОД',
    'Добро пожаловать.',
    'Войдите, чтобы управлять заявкой, пропуском, расписанием и баллами.',
  ],
  privacy: ['ДАННЫЕ', 'Политика конфиденциальности', 'Как мы работаем с данными участников.'],
  rules: ['ПРАВИЛА', 'Правила мероприятия', 'Общее пространство для обучения и уважения.'],
  contact: ['КОНТАКТЫ', 'Связь с форумом.', 'Контакты организаторов появятся здесь.'],
};
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title:
      pages[slug]?.[1].replace('\n', ' ') ||
      competitions.find((c) => c.slug === slug)?.title ||
      'Not found',
  };
}
export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const { lang } = await locale();
  const search = await searchParams;
  const competition = competitions.find((c) => c.slug === slug);
  const page = pages[slug] ? translatedPage(lang, slug, pages[slug]) : undefined;
  if (!page && !competition) notFound();
  let body: React.ReactNode;
  const info = competition ? [competition.tag, competition.title, competition.description] : page!;
  if (slug === 'program' || slug === 'digital-apta') {
    const data = await publicRows('events');
    const all = (data ?? events) as typeof events;
    body = (
      <>
        {slug === 'digital-apta' && (
          <div className="reveal-banner">
            <Lock size={22} />
            <span>17.09</span>
            <strong>ФИНАЛИСТЫ БУДУТ ОПУБЛИКОВАНЫ</strong>
            <span className="pill">STARTUP BATTLE / STARTUP WOMEN / HACKATHON / FIFA 7–8</span>
          </div>
        )}
        <ScheduleTimeline
          events={slug === 'digital-apta' ? all.filter((e) => e.day < 19) : all}
          initialDay={
            Number(search.day) >= 12 && Number(search.day) <= 19
              ? Number(search.day)
              : slug === 'digital-apta'
                ? 12
                : 19
          }
        />
      </>
    );
  } else if (slug === 'speakers') {
    const data = await publicRows('speakers');
    body = (
      <>
        <div className="speaker-grid">
          {[1, 2, 3].map((n) => (
            <SecretSpeakerCard
              key={n}
              index={n}
              speaker={data?.filter((s) => s.kind === 'KEYNOTE')[n - 1]}
            />
          ))}
        </div>
        <div className="section">
          <h2>Три взгляда. Один разговор.</h2>
          <p style={{ margin: '20px 0 30px' }}>
            Ваши вопросы, опыт спикеров и открытый разговор о будущем.
          </p>
          <div className="speaker-grid">
            {[1, 2, 3].map((n) => (
              <SecretSpeakerCard
                key={n}
                panel
                index={n}
                speaker={data?.filter((s) => s.kind === 'PANELIST')[n - 1]}
              />
            ))}
          </div>
          <div style={{ marginTop: 30 }}>
            <Button href="/dashboard/questions">Задать вопрос</Button>
          </div>
        </div>
      </>
    );
  } else if (slug === 'zones') {
    const data = await publicRows('zones');
    body = (
      <div className="zones-grid">
        {(data ?? zones).map((z, i) => (
          <article key={z.name} className="zone-card">
            <span className="zone-icon">0{i + 1}</span>
            <h3>{z.name}</h3>
            <p>{z.description}</p>
          </article>
        ))}
      </div>
    );
  } else if (slug === 'apply') {
    let user = null;
    let enabled = eventConfig.registrationEnabled;
    if (configured()) {
      const client = await db();
      user = (await client.auth.getUser()).data.user;
      const { data } = await client
        .from('site_settings')
        .select('value')
        .eq('key', 'registrationEnabled')
        .maybeSingle();
      if (data) enabled = data.value;
    }
    body = (
      <>
        {!configured() && (
          <div className="notice">
            Заявки откроются после подключения сервиса регистрации.
          </div>
        )}
        {!enabled && <div className="notice">Приём заявок сейчас закрыт.</div>}
        <ApplyForm signedIn={!!user} email={user?.email} enabled={enabled} />
        <p className="form-note">
          Есть промокод? <Link href="/activate">Активировать здесь ↗</Link>
        </p>
      </>
    );
  } else if (slug === 'activate') body = <PromoForm />;
  else if (slug === 'login')
    body = (
      <>
        {search.notice === 'setup' && (
          <div className="notice">
            Сервис аккаунтов ещё не подключён. Публичные страницы программы доступны.
          </div>
        )}
        {search.error && (
          <div className="notice error">
            Ссылка для входа устарела или не прошла проверку. Запросите новую ссылку.
          </div>
        )}
        <LoginForm />
      </>
    );
  else if (competition) {
    const records = await publicRows('competitions');
    const record = records?.find((c) => c.slug === slug);
    const entries = record?.published
      ? (await publicRows('competition_entries'))?.filter(
          (e) =>
            e.competition_id === record.id && ['FINALIST', 'FINAL', 'WINNER'].includes(e.status),
        )
      : [];
    body = (
      <>
        <div className="preview-tabs">
          <span className="active">19 СЕНТЯБРЯ 2026</span>
          <span>ФИНАЛИСТЫ · 17 СЕНТЯБРЯ</span>
        </div>
        <div className="section">
          <h2>{competition.tag}</h2>
          <p style={{ marginTop: 20, maxWidth: 700 }}>
            {record?.description || competition.description}
          </p>
          <div className="locked-slots">
            {entries?.length
              ? entries.map((e) => (
                  <article className="locked-slot" key={e.id}>
                    <span className="status">
                      {e.place === 1
                        ? 'ПОБЕДИТЕЛЬ'
                        : e.place === 2
                          ? '2 МЕСТО'
                          : e.place === 3
                            ? '3 МЕСТО'
                            : e.status}
                    </span>
                    <h3 style={{ marginTop: 20 }}>{e.name}</h3>
                    <p>{e.description}</p>
                    {e.founders && <p>{e.founders}</p>}
                    {e.pitch_time && <p>ПИТЧ · {e.pitch_time}</p>}
                    {e.website && (
                      <a href={e.website} className="text-link">
                        Сайт проекта ↗
                      </a>
                    )}
                  </article>
                ))
              : Array.from({ length: competition.slots || 4 }, (_, i) => (
                  <article className="locked-slot" key={i}>
                    <Lock size={28} />
                    <h3>
                      {slug === 'startup-battle' ? 'СТАРТАП' : 'УЧАСТНИК'}{' '}
                      {String(i + 1).padStart(2, '0')}
                    </h3>
                    <p>СКОРО · 17 СЕНТЯБРЯ</p>
                  </article>
                ))}
          </div>
          <div className="prose">
            <h2>Как проходит</h2>
            <p>ЗАЯВКА → ОТБОР → ФИНАЛИСТ → ФИНАЛ → ПОБЕДИТЕЛЬ</p>
            <h2>Правила и оценка</h2>
            <p>
              {record?.rules ||
                'Подробные правила организаторы опубликуют до отбора.'}
            </p>
            <p>
              {record?.judging || 'Критерии оценки и финальное расписание скоро объявим.'}
            </p>
          </div>
          {slug === 'fifa' && (
            <>
              <h2 style={{ margin: '35px 0 20px' }}>Турнирная сетка</h2>
              <div className="bracket">
                {(record?.bracket?.length
                  ? record.bracket
                  : [
                      {
                        name: 'ЧЕТВЕРТЬФИНАЛ',
                        matches: ['Скоро', 'Скоро', 'Скоро', 'Скоро'],
                      },
                      { name: 'ПОЛУФИНАЛ', matches: ['Скоро', 'Скоро'] },
                      { name: 'ФИНАЛ', matches: ['Скоро'] },
                    ]
                ).map((r: { name: string; matches: string[] }) => (
                  <div key={r.name} className="bracket-round">
                    <span className="eyebrow">{r.name}</span>
                    {r.matches.map((m, i) => (
                      <div key={i} className="bracket-match">
                        {m}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <h2 style={{ marginBottom: 25 }}>Принесите свою идею.</h2>
        {record ? (
          <CompetitionForm id={record.id} />
        ) : (
          <Empty title="Заявки на соревнование скоро откроются.">
            <p>Сначала подайте заявку на форум.</p>
            <Button href="/apply">Подать заявку</Button>
          </Empty>
        )}
      </>
    );
  } else if (slug === 'privacy')
    body = (
      <div className="prose">
        <h2>Какие данные собираем</h2>
        <p>
          Мы собираем имя, email, школу или организацию, роль и класс, чтобы обработать заявку и
          выдать личный пропуск. Также сохраняем посещение событий, баллы и вопросы.
        </p>
        <h2>Как используются данные</h2>
        <p>
          Организаторы используют данные для входа, расписания и сертификатов. QR-пропуск содержит
          только случайный токен. Проверка сертификата показывает имя участника и статус выдачи.
        </p>
        <h2>Доступ и хранение</h2>
        <p>
          Данные аккаунта доступны вам и организаторам. Не передавайте личный QR-код другим людям.
          Контакты организаторов и срок хранения данных будут опубликованы до старта регистрации.
        </p>
        <div className="notice">
          Черновая политика перед запуском. Организаторы должны подтвердить ответственного за
          данные, канал связи, срок хранения и требования для несовершеннолетних участников.
        </div>
      </div>
    );
  else if (slug === 'rules')
    body = (
      <div className="prose">
        <h2>Участие</h2>
        <p>
          Форум бесплатный. Для входа нужен активный личный цифровой пропуск. Заявки проверяют
          организаторы. Пропуск нельзя передавать другим людям.
        </p>
        <h2>Уважение</h2>
        <p>
          Уважайте участников, спикеров, команду и площадку. Оскорбления, дискриминация и срыв
          событий запрещены. Следуйте инструкциям организаторов.
        </p>
        <h2>Активности и баллы</h2>
        <p>
          На некоторых событиях количество мест ограничено. Посещение отмечают организаторы. Баллы
          форума нельзя передавать или обменивать на деньги. Повторная отметка не даёт баллы ещё раз.
        </p>
        <h2>Соревнования</h2>
        <p>
          Для каждого соревнования будут опубликованы правила участия, подачи заявки и оценки.
          Финальная информация по площадке появится от организаторов.
        </p>
      </div>
    );
  else
    body = (
      <Empty title="Контакты скоро появятся.">
        <p>
          Пока обращайтесь к команде организаторов форума в школе. Публичный email, телефон и
          соцсети ещё не объявлены.
        </p>
      </Empty>
    );
  return (
    <div className="container page-body">
      <PageIntro label={info[0]} title={info[1]} description={info[2]} />
      {body}
    </div>
  );
}
