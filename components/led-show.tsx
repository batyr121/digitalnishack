'use client';

import Image from 'next/image';
import { useState } from 'react';
import { eventConfig } from '@/lib/config';

const slides = [
  {
    kicker: '01 / DIGITAL NIS FORUM',
    title: 'DIGITAL\nNIS FORUM',
    text: 'Бір күн. Бір қоғамдастық. Ортақ цифрлық болашақ.',
    meta: '19.09.2026 · NIS AKTAU',
    label: 'БІРГЕ ЖАСАЙМЫЗ',
  },
  {
    kicker: '02 / DIGITAL APTA',
    title: 'STARTUP\n+ PITCHING',
    text: '14 қыркүйек · 16:20–17:20. Идеяны сахнаға дайындаймыз.',
    meta: '14.09 · 16:20–17:20',
    label: 'МАСТЕР-КЛАСС',
  },
  {
    kicker: '03 / ARTISAN EDUCATION',
    title: 'ARTISAN\n3D MODELING',
    text: '17 қыркүйек. 3D модель, форма және прототип.',
    meta: '17.09 · 3D LAB',
    label: 'GENERAL PARTNER',
  },
  {
    kicker: '04 / FINALISTS',
    title: 'ФИНАЛИСТЕР\nЖАРИЯЛАНАДЫ',
    text: 'Startup Battle, NIS EduTech Hackathon және FIFA League.',
    meta: '18.09 · FINALISTS',
    label: 'КЕЛЕСІ ҚАДАМ',
  },
];

const runningLine = [
  'DIGITAL NIS FORUM',
  'STARTUP BATTLE',
  'NIS EDUTECH HACKATHON',
  'FIFA LEAGUE',
  'ARTISAN 3D MODELING',
  'ПАНЕЛЬДІК ДИСКУССИЯ',
  '200 000 TG PRIZE FUND',
];

const speakerSlots = [
  ['СПИКЕР 01', 'Тақырып жақында жарияланады', 'KEYNOTE'],
  ['СПИКЕР 02', 'Технологиялар және идеялар', 'MAIN STAGE'],
  ['СПИКЕР 03', 'Болашаққа жаңа көзқарас', 'DIGITAL NIS'],
];

export function LedAnnouncement() {
  return (
    <LedStaticFrame mode="announce" kicker="ХАБАРЛАНДЫРУ" title={"БАҒДАРЛАМА\nБАСТАЛАДЫ"} text="Қатысушыларды басты сахнаға шақырамыз. DIGITAL NIS FORUM · бірге жасаймыз." meta="NIS AKTAU · 19.09.2026" />
  );
}

export function LedSpeakerIntro() {
  return (
    <div className="led-stage led-static led-speaker-screen">
      <div className="led-grid" />
      <div className="led-scan" />
      <header className="led-header"><Image src="/logo-horizontal.svg" alt="DIGITAL NIS FORUM" width={236} height={74} priority /><div><span>KEYNOTE SESSION</span><strong>MAIN STAGE</strong></div></header>
      <main className="led-speaker-main">
        <section className="led-speaker-copy">
          <span className="led-kicker"><b>●</b>КЕЛЕСІ СПИКЕР</span>
          <h1>{"САХНАҒА\nШАҚЫРАМЫЗ"}</h1>
          <p>Қатысушылар, басты сахнаға назар аударыңыздар.</p>
          <div className="led-actions"><span>DIGITAL NIS FORUM</span><span>ҚОЛ ШАПАЛАҚТАЙМЫЗ ↗</span></div>
        </section>
        <section className="led-speaker-cards">
          {speakerSlots.map(([name, text, label], index) => <article key={name} className={index === 0 ? 'active' : ''}><div className="led-speaker-avatar"><span>{String(index + 1).padStart(2, '0')}</span></div><div><small>{label}</small><h2>{name}</h2><p>{text}</p></div></article>)}
        </section>
      </main>
      <LedTicker />
    </div>
  );
}

export function LedPanelScreen() {
  return (
    <div className="led-stage led-static led-panel-screen">
      <div className="led-grid" />
      <div className="led-scan" />
      <header className="led-header"><Image src="/logo-horizontal.svg" alt="DIGITAL NIS FORUM" width={236} height={74} priority /><div><span>PANEL DISCUSSION</span><strong>1 + 3</strong></div></header>
      <main className="led-panel-main">
        <section>
          <span className="led-kicker"><b>●</b>ПАНЕЛЬДІК ДИСКУССИЯ</span>
          <h1>{"ҮШ КӨЗҚАРАС.\nБІР САХНА."}</h1>
          <p>Модератор және үш спикер: технология, білім, стартап және болашақ туралы ашық әңгіме.</p>
        </section>
        <section className="led-panel-people">
          <article className="moderator"><span>MODERATOR</span><h2>МОДЕРАТОР</h2><p>Сұрақтар мен диалог бағыты</p></article>
          {speakerSlots.map(([name, text], index) => <article key={name}><div className="led-panel-avatar">0{index + 1}</div><span>0{index + 1} / SPEAKER</span><h2>{name}</h2><p>{text}</p></article>)}
        </section>
      </main>
      <LedTicker />
    </div>
  );
}

function LedStaticFrame({ mode, kicker, title, text, meta }: { mode: string; kicker: string; title: string; text: string; meta: string }) {
  return (
    <div className={`led-stage led-static led-${mode}`}>
      <div className="led-grid" />
      <div className="led-scan" />
      <header className="led-header"><Image src="/logo-horizontal.svg" alt="DIGITAL NIS FORUM" width={236} height={74} priority /><div><span>LIVE SCREEN</span><strong>{eventConfig.dateLabel}</strong></div></header>
      <main className="led-static-main">
        <span className="led-kicker"><b>●</b>{kicker}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="led-actions"><span>{meta}</span><span>НАЗАР АУДАРЫҢЫЗДАР ↗</span></div>
      </main>
      <LedTicker />
    </div>
  );
}

function LedTicker() {
  return (
    <footer className="led-footer">
      <div className="led-ticker"><div>{[...runningLine, ...runningLine].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div>
      <div className="led-progress"><span /></div>
    </footer>
  );
}

export function LedShow() {
  const [active, setActive] = useState(0);

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
          <div className="led-focus-tag">{slides[active].label}</div>
        </section>
      </main>

      <section className="led-focus-row">
        <article><span>14.09</span><b>Startup + Pitching</b></article>
        <article><span>17.09</span><b>Artisan 3D Modeling</b></article>
        <article><span>18.09</span><b>Финалистер</b></article>
        <article><span>19.09</span><b>Форум</b></article>
      </section>

      <LedTicker />
    </div>
  );
}
