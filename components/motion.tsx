'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { eventConfig } from '@/lib/config';
import { dictionaries, type Locale } from '@/locales';
export function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { opacity: [0.65, 1], y: [16, 0] }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
export function Countdown({ lang }: { lang: Locale }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const tick = () =>
      setRemaining(Math.max(0, new Date(eventConfig.mainForumDate).getTime() - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const t = dictionaries[lang];
  const units =
    remaining === null
      ? ['—', '—', '—', '—']
      : [
          Math.floor(remaining / 86400000),
          Math.floor(remaining / 3600000) % 24,
          Math.floor(remaining / 60000) % 60,
          Math.floor(remaining / 1000) % 60,
        ].map((v) => String(v).padStart(2, '0'));
  return (
    <div className="countdown">
      <div className="count-label">
        <i className="live-dot" />
        {t.until}
      </div>
      <div className="count-units">
        {units.map((v, i) => (
          <div key={i}>
            <strong>{v}</strong>
            <span>{[t.days, t.hours, t.minutes, t.seconds][i]}</span>
          </div>
        ))}
      </div>
      <div className="count-note">
        12–18 SEP <span>DIGITAL APTA</span>
        <br />
        19 SEP <span>THE MAIN EVENT ↗</span>
      </div>
    </div>
  );
}
