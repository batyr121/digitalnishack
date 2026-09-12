'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { eventConfig, events } from '@/lib/config';

const slides = [
  {
    kicker: '01 / DIGITAL NIS FORUM',
    title: 'БІРГЕ\nЖАСАЙМЫЗ',
    text: 'Бір күн. Бір қоғамдастық. Ортақ цифрлық болашақ.',
    meta: '19.09.2026 · NIS AKTAU',
  },
  {
    kicker: '02 / DIGITAL APTA',
    title: 'ИДЕЯДАН\nСАХНАҒА',
    text: '14 қыркүйек — Startup + Pitching. Жоба, питч, сенімді презентация.',
    meta: '14.09 · STARTUP + PITCHING',
  },
  {
    kicker: '03 / 3D LAB',
    title: 'ARTISAN\n3D MODELING',
    text: '17 қыркүйек — Artisan Education мастер-классы. 3D модель, форма, прототип.',
    meta: '17.09 · ARTISAN EDUCATION',
  },
  {
    kicker: '04 / FINALISTS',
    title: 'ФИНАЛИСТЕР\nЖАРИЯЛАНАДЫ',
    text: '18 қыркүйек — Startup Battle, NIS EduTech Hackathon және FIFA финалистері.',
    meta: '18.09 · FINALISTS REVEAL',
  },
  {
    kicker: '05 / MAIN STAGE',
    title: 'СПИКЕРЛЕР\nПАНЕЛЬ\nФИНАЛДАР',
    text: '19 қыркүйек — форум, спикерлер, панельдік дискуссия, жарыстар және нетворкинг.',
    meta: '19.09 · THE FORUM',
  },
];

const runningLine = [
  'STARTUP BATTLE',
  'NIS EDUTECH HACKATHON',
  'FIFA 7–8 GRADES',
  'ARTISAN 3D MODELING',
  'PANEL DISCUSSION',
  'SPEAKERS',
  '200 000 TG PRIZE FUND',
  'DIGITAL PASS',
];

export function LedShow() {
  const [active, setActive] = useState(0);
  const mainEvents = useMemo(() => events.filter((event) => [14, 17, 18, 19].includes(event.day)), []);

  return (
    <div
      className="led-stage"
      onAnimationIteration={() => setActive((value) => (value + 1) % slides.length)}
    >
      <div className="led-noise" />
      <div className="led-grid" />
      <div className="led-scan" />

      <header className="led-header">
        <Image src="/logo-horizontal.svg" alt="DIGITAL NIS FORUM" width={236} height={74} priority />
        <div>
          <span>LIVE SCREEN</span>
          <strong>{eventConfig.dateLabel}</strong>
        </div>
      </header>

      <main className="led-main">
        <section className="led-copy" key={active}>
          <span className="led-kicker"><b>●</b>{slides[active].kicker}</span>
          <h1>{slides[active].title}</h1>
          <p>{slides[active].text}</p>
          <div className="led-actions">
            <span>{slides[active].meta}</span>
            <span>ҚОШ КЕЛДІҢІЗДЕР ↗</span>
          </div>
        </section>

        <section className="led-orbit" aria-label="Анимация форума">
          <div className="led-halo" />
          <div className="led-logo-mark"><Image src="/logo-mark.svg" alt="" width={430} height={300} priority /></div>
          <div className="led-pulse one">AI</div>
          <div className="led-pulse two">3D</div>
          <div className="led-pulse three">STARTUP</div>
          <div className="led-pulse four">NIS</div>
        </section>
      </main>

      <section className="led-cards">
        {mainEvents.slice(0, 4).map((event, index) => (
          <article className={index === active % 4 ? 'active' : ''} key={event.id}>
            <span>0{index + 1} / {event.day}.09</span>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
          </article>
        ))}
      </section>

      <footer className="led-footer">
        <div className="led-ticker">
          <div>
            {[...runningLine, ...runningLine].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
        <div className="led-progress"><span /></div>
      </footer>
    </div>
  );
}
