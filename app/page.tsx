import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ArrowDown,
  Lock,
  Globe,
  ScanLine,
  Sparkles,
  MoveUpRight,
} from 'lucide-react';
import { Button, SectionHeader, SecretSpeakerCard, StatsCard } from '@/components/ui';
import { Countdown, Reveal } from '@/components/motion';
import { translatedFaq } from '@/locales/pages';
import { locale } from '@/lib/locale';
import { competitions, zones, faq, eventConfig, events } from '@/lib/config';
import { publicRows } from '@/lib/supabase';
export default async function Home() {
  const { lang, t } = await locale();
  const [speakerData, zoneData, partnerData, settings, eventData] = await Promise.all(
    ['speakers', 'zones', 'partners', 'site_settings', 'events'].map(publicRows),
  );
  const speakers = speakerData?.filter((s) => s.kind === 'KEYNOTE');
  const program = eventData ?? events;
  const hardcodedPartners = [
    {
      id: 'artisan-education-general',
      name: 'Artisan Education',
      logo: '/partners/artisan-education.svg',
      website: 'https://artisan.education',
      type: 'GENERAL PARTNER',
    },
    {
      id: 's7-robotics-tech',
      name: 'S7 Robotics',
      logo: '/partners/s7-robotics-logo.svg',
      website: '#partners',
      type: 'TECH PARTNER',
    },
    {
      id: 'nis-aktau-operational',
      name: 'NIS Aktau',
      logo: '/partners/nis-aktau-logo.svg',
      website: '#partners',
      type: 'OPERATIONAL PARTNER',
    },
  ];
  const featuredPartners = [
    ...hardcodedPartners,
    ...(partnerData ?? []).filter((p) => !hardcodedPartners.some((partner) => partner.name === p.name)),
  ];
  const content = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: eventConfig.eventName,
            startDate: eventConfig.mainForumDate,
            endDate: eventConfig.endDate,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            isAccessibleForFree: true,
            description: 'Технологии, стартапы, образование и инновации.',
            location: { '@type': 'Place', name: eventConfig.location },
            organizer: { '@type': 'Organization', name: 'Nazarbayev Intellectual School' },
            url: eventConfig.siteUrl,
          }).replace(/</g, '\\u003c'),
        }}
      />
      {content.announcement && <div className="announcement">{String(content.announcement)}</div>}
      <section className="hero">
        <div className="hero-meta">
          <span>
            <i className="live-dot" />
            {lang === 'kz' ? t.eyebrow : 'Форум технологий и идей'}
          </span>
          <span>
            NIS · Қазақстан <Globe size={13} />
          </span>
        </div>
        <div className="hero-main">
          <div className="hero-copy">
            <h1>
              DIGITAL
              <br />
              NIS FORUM<span className="year">2026</span>
            </h1>
            <div className="hero-tagline">
              <span />
              Бірге жасаймыз
              <span />
            </div>
            <p className="hero-description">{t.intro}</p>
            <div className="hero-buttons">
              <Button href="/apply">{t.cta}</Button>
              <Button href="/program" secondary>
                {t.explore}
              </Button>
            </div>
            <div className="free-label">
              <span>↳</span>
              {t.free}
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-coordinate top">ФОРУМ / 2026</div>
            <svg viewBox="0 0 640 550" className="connection-art">
              <defs>
                <linearGradient id="beam" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#36540a" />
                  <stop offset=".45" stopColor="#c1ff53" />
                  <stop offset=".7" stopColor="#98d52d" />
                  <stop offset="1" stopColor="#edffc8" />
                </linearGradient>
                <linearGradient id="side" x1="0" x2="1">
                  <stop stopColor="#263711" />
                  <stop offset="1" stopColor="#749d35" />
                </linearGradient>
                <pattern id="lines" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M0 0V5" stroke="#071004" strokeWidth="1.4" opacity=".35" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="28" />
                </filter>
              </defs>
              <ellipse
                cx="330"
                cy="430"
                rx="205"
                ry="32"
                fill="#a9ff32"
                opacity=".08"
                filter="url(#glow)"
              />
              <g transform="translate(20 2)">
                <path d="M74 299 209 168 301 168 164 302 164 400 74 400Z" fill="url(#side)" />
                <path d="M74 299 209 168 257 195 122 328 122 430 74 400Z" fill="url(#beam)" />
                <path d="M122 328 257 195 349 195 211 329 211 429 122 430Z" fill="url(#beam)" />
                <path d="M122 328 257 195 349 195 211 329 211 429 122 430Z" fill="url(#lines)" />
                <path
                  d="M303 145 393 145 528 277 528 377 439 377 439 304 303 171Z"
                  fill="url(#side)"
                />
                <path d="M303 145 350 117 443 117 576 249 528 277 393 145Z" fill="url(#beam)" />
                <path d="M393 145 443 117 576 249 576 350 528 377 528 277Z" fill="url(#beam)" />
                <path d="M393 145 443 117 576 249 576 350 528 377 528 277Z" fill="url(#lines)" />
                <path d="M235 287 326 198 373 225 283 314 283 414 235 388Z" fill="url(#side)" />
                <path d="M283 314 373 225 464 225 372 315 372 414 283 414Z" fill="url(#beam)" />
                <path d="M283 314 373 225 464 225 372 315 372 414 283 414Z" fill="url(#lines)" />
                <path d="m326 198 91 0 47 27-91 0Z" fill="#ceff82" />
                <path
                  d="m74 299 135-131h92M303 145h90l135 132M283 314l90-89h91"
                  fill="none"
                  stroke="#e4ffb2"
                  strokeWidth="1"
                />
              </g>
              <g stroke="#748462" strokeWidth=".6" fill="none" opacity=".6">
                <path d="M80 125h72M116 89v72M516 436h70M551 401v70" />
                <circle cx="334" cy="278" r="236" strokeDasharray="2 11" />
              </g>
            </svg>
            <div className="art-caption">
              <span>
                Идея.
                <br />
                Команда. Нәтиже.
              </span>
              <span className="art-index">
                ↗<br />
                01 / 03
              </span>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="big-date">
            19.09<span>.2026</span>
            <small>БАСТЫ ФОРУМ</small>
          </div>
          <div className="hero-topics">
            {t.hero.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <Link href="#discover" className="scroll-link">
            СМОТРЕТЬ ДАЛЬШЕ
            <ArrowDown size={18} />
          </Link>
        </div>
      </section>
      <div className="ticker">
        <div>
          {Array.from({ length: 2 }, (_, i) => (
            <span key={i}>
              СТАРТАПЫ <i>✳</i> ЖИ <i>✳</i> РОБОТОТЕХНИКА <i>✳</i> БІЛІМ <i>✳</i> КОД <i>✳</i> 3D{' '}
              <i>✳</i> ИННОВАЦИИ <i>✳</i> АДАМДАР <i>✳</i> БІРГЕ <i>✳</i>{' '}
            </span>
          ))}
        </div>
      </div>
      <div className="container">
        <Countdown lang={lang} />
        <Reveal>
          <section id="about" className="manifesto section">
            <div className="eyebrow" id="discover">
              01 / БІРГЕ ЖАСАЙМЫЗ
            </div>
            <div>
              <h2>{t.manifesto}</h2>
              <p>{t.manifestoText}</p>
              <span className="mini-label">ИДЕИ. ЛЮДИ. НОВЫЕ СВЯЗИ.</span>
            </div>
            <MoveUpRight size={96} strokeWidth={0.6} />
          </section>
          <div className="stats-row">
            {(
              content.stats ?? [
                ['01', 'ФОРУМ'],
                ['07', 'ДНЕЙ DIGITAL APTA'],
                ['04', 'СОРЕВНОВАНИЯ'],
                ['06', 'СПИКЕРОВ'],
                ['08', 'ФИНАЛИСТОВ'],
              ]
            ).map(([v, l]: string[]) => (
              <StatsCard key={l} value={v} label={l} />
            ))}
          </div>
        </Reveal>
        <Reveal>
          <section className="section" id="apta">
            <SectionHeader
              number="02"
              label="НЕДЕЛЯ ПОДГОТОВКИ"
              title={t.week}
              href="/digital-apta"
              link="Смотреть Digital Apta"
            />
            <div className="apta-panel">
              <div className="apta-copy">
                <span className="pill">12—18 СЕНТЯБРЯ 2026</span>
                <h3>
                  DIGITAL
                  <br />
                  <span>APTA.</span>
                </h3>
                <p>
                  Семь дней практики, встреч и подготовки.
                  <br />
                  Форум начинается ещё до главного дня.
                </p>
                <Button href="/digital-apta" secondary>
                  Смотреть неделю
                </Button>
              </div>
              <div className="apta-agenda">
                {[
                  ['12', 'СТАРТ', 'Открытие и акселерация стартапов'],
                  ['15', 'ПРАКТИКА', 'Кодинг и коммерциализация'],
                  ['16', 'ПИТЧИНГ', 'Презентация проекта'],
                  ['17', 'СОЗДАТЕЛИ', '3D-печать и финалисты'],
                  ['18', 'РЕПЕТИЦИЯ', 'Пробный питчинг'],
                ].map(([d, n, s]) => (
                  <Link href={`/program?day=${d}`} key={d}>
                    <span className="agenda-day">
                      {d}
                      <small>СЕН</small>
                    </span>
                    <div>
                      <h4>{n}</h4>
                      <p>{s}</p>
                    </div>
                    <ArrowUpRight size={19} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="main-day">
            <span className="eyebrow">03 / ГЛАВНЫЙ ДЕНЬ</span>
            <div>
              <h2>{t.main}</h2>
              <p>Идеи встречают возможности. Команды находят поддержку.</p>
            </div>
            <Link href="/program?day=19">
              19<span>СЕН ↗</span>
            </Link>
          </section>
        </Reveal>
        <Reveal>
          <section className="section">
            <SectionHeader
              number="04"
              label="ПРОГРАММА"
              title={t.programTitle}
              href="/program"
              link="Вся программа"
            />
            <div className="preview-tabs">
              <span className="active">19 СЕНТЯБРЯ</span>
              <span>БАСТЫ ФОРУМ</span>
              <span className="schedule-note">ТОЧНОЕ ВРЕМЯ СКОРО</span>
            </div>
            {program
              .filter((e) => e.day === 19)
              .slice(0, 4)
              .map((e, i) => (
                <Link className="program-row" href="/program?day=19" key={e.id}>
                  <div className="program-time">
                    0{i + 1}
                    <small>СЕССИЯ</small>
                  </div>
                  <div>
                    <span className="eyebrow">{e.track}</span>
                    <h3>{e.title}</h3>
                  </div>
                  <span className="program-location">{e.location}</span>
                  <ArrowUpRight size={21} />
                </Link>
              ))}
          </section>
        </Reveal>
        <Reveal>
          <section className="section" id="speakers">
            <SectionHeader
              number="05"
              label="СПИКЕРЫ"
              title={t.speakersTitle}
              href="/speakers"
              link="Все спикеры"
            />
            <div className="speaker-grid">
              {[1, 2, 3].map((n) => (
                <SecretSpeakerCard key={n} index={n} speaker={speakers?.[n - 1]} />
              ))}
            </div>
            <div className="section-footnote">
              <Lock size={12} /> Имена спикеров скоро откроем.
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="section" id="battles">
            <SectionHeader number="06" label="СОРЕВНОВАНИЯ" title={t.battlesTitle} />
            <div className="competition-grid">
              {competitions.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className={`competition-card competition-${i}`}
                >
                  <div className="competition-top">
                    <span className="eyebrow">0{i + 1} / СОРЕВНОВАНИЕ</span>
                    <ArrowUpRight size={22} />
                  </div>
                  <span className="competition-symbol">{c.icon}</span>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <div className="competition-bottom">
                    19 СЕНТЯБРЯ <span>СМОТРЕТЬ ↗</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="reveal-banner">
              <span>ПРИЗОВОЙ ФОНД</span>
              <strong>200 000 ТГ НА ВСЕ КОНКУРСЫ</strong>
              <span className="pill">ОБЩИЙ</span>
            </div>
            <div className="reveal-banner">
              <Lock size={20} />
              <span>17.09</span>
              <strong>ФИНАЛИСТЫ БУДУТ ОПУБЛИКОВАНЫ.</strong>
              <span className="pill">
                {content.finalists_published ? 'ОПУБЛИКОВАНО' : 'СКОРО'}
              </span>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="panel-banner">
            <span className="eyebrow">07 / ПАНЕЛЬНАЯ ДИСКУССИЯ</span>
            <h2>
              Три взгляда.
              <br />
              Один разговор.
              <br />
              <span>Ваши вопросы.</span>
            </h2>
            <div>
              <p>
                Спикеры обсудят технологии, идеи и будущее образования.
              </p>
              <Button href="/dashboard/questions" secondary>
                Задать вопрос
              </Button>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="section">
            <SectionHeader
              number="08"
              label="ЗОНЫ ФОРУМА"
              title={t.zoneTitle}
              href="/zones"
              link="Все зоны"
            />
            <div className="zones-grid">
              {(zoneData ?? zones).slice(0, 8).map((z, i) => (
                <Link href="/zones" className="zone-card" key={z.name}>
                  <span className="zone-icon">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{z.name}</h3>
                  <p>{z.description}</p>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="rewards section">
            <div className="coin-feature">
              <span className="eyebrow">09 / БАЛЛЫ ЗА АКТИВНОСТЬ</span>
              <h2>
                Приходи.
                <br />
                Участвуй.
                <br />
                <span>Получай баллы.</span>
              </h2>
              <p>
                Собирайте баллы за участие в событиях форума. Баллы помогут получить сертификат.
              </p>
              <Button href="/dashboard/coins" secondary>
                Смотреть баллы
              </Button>
              <div className="coin-object" aria-hidden="true">
                <span>↗</span>
                <small>БАЛЛЫ</small>
              </div>
              <span className="coin-disclaimer">ЭТО БАЛЛЫ УЧАСТИЯ.</span>
            </div>
            <div className="pass-feature">
              <span className="eyebrow">10 / ВАШ ПРОПУСК</span>
              <h2>
                Один пропуск.
                <br />
                Все события.
              </h2>
              <div className="sample-pass">
                <div className="sample-pass-top">
                  <img src="/logo-mark.svg" width="29" height="29" alt="" />
                  <strong>
                    DIGITAL
                    <br />
                    NIS FORUM
                  </strong>
                  <span>2026 ↗</span>
                </div>
                <span className="eyebrow">ВАШ ЦИФРОВОЙ ПРОПУСК</span>
                <h3>
                  Будущее
                  <br />
                  начинается с вас.
                </h3>
                <div className="sample-pass-bottom">
                  <span>
                    19.09.2026
                    <br />
                    <small>ЛИЧНЫЙ · ЦИФРОВОЙ</small>
                  </span>
                  <ScanLine size={52} strokeWidth={1} />
                </div>
              </div>
              <Button href="/activate" secondary>
                Активировать промокод
              </Button>
              <p>
                Уже подали заявку? <Link href="/dashboard/pass">Открыть пропуск ↗</Link>
              </p>
            </div>
          </section>
        </Reveal>
        <section className="section partners" id="partners">
          <SectionHeader number="11" label="ПАРТНЁРЫ" title="Вместе сильнее." />
          <div className="partner-columns">
            <div>
              <span className="eyebrow">ОРГАНИЗАТОР</span>
              <div className="organizer-placeholder">
                <span className="partner-monogram">NIS</span>
                <p>
                  Nazarbayev
                  <br />
                  Intellectual School<small>ЛОГОТИП СКОРО</small>
                </p>
              </div>
            </div>
            <div>
              <span className="eyebrow">ПАРТНЁРЫ</span>
              <div className="partner-list">
                {featuredPartners.length ? (
                  featuredPartners.map((p) => (
                    <a
                      key={p.id}
                      href={p.website || '#partners'}
                      rel="noreferrer"
                      className="partner-placeholder"
                    >
                      {p.logo ? (
                        <Image
                          src={p.logo}
                          width={160}
                          height={65}
                          unoptimized
                          alt={p.name}
                          className="partner-logo"
                        />
                      ) : (
                        p.name
                      )}
                      <small>{p.type.replaceAll('_', ' ')}</small>
                    </a>
                  ))
                ) : (
                  <>
                    <span className="partner-placeholder">
                      МЕСТО ДЛЯ ЛОГОТИПА <small>ПАРТНЁР</small>
                    </span>
                    <span className="partner-placeholder">
                      ДЕЛАЕМ ВМЕСТЕ <small>ТЕХНОЛОГИЧЕСКИЙ ПАРТНЁР</small>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="section faq">
          <SectionHeader number="12" label="ВОПРОСЫ" title={t.faqTitle} />
          <div>
            {(content.faq ?? (lang === 'kz' ? translatedFaq.kz : faq)).map(
              ([q, a]: string[], i: number) => (
                <details key={q}>
                  <summary>
                    <span>0{i + 1}</span>
                    {q}
                    <b>+</b>
                  </summary>
                  <p>{a}</p>
                </details>
              ),
            )}
          </div>
        </section>
      </div>
      <section className="final-cta">
        <div className="container">
          <span className="eyebrow">
            <i className="live-dot" />
            19 СЕНТЯБРЯ 2026 · NIS · ҚАЗАҚСТАН
          </span>
          <h2>
            {t.future}
            <br />
            <span>БІРГЕ ЖАСАЙМЫЗ.</span>
          </h2>
          <Button href="/apply">{t.apply}</Button>
          <div className="final-bottom">
            <span>{t.free}</span>
            <span>УВИДИМСЯ НА ФОРУМЕ. ↗</span>
          </div>
        </div>
      </section>
    </>
  );
}
