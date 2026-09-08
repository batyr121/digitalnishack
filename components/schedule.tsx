'use client';
import { useState } from 'react';
import { tracks, type EventRecord } from '@/lib/config';
import { ActionButton } from './forms';
export function ScheduleTimeline({
  events,
  initialDay = 19,
  registrations = [],
}: {
  events: EventRecord[];
  initialDay?: number;
  registrations?: { event_id: string; status: string }[];
}) {
  const [day, setDay] = useState(initialDay);
  const [track, setTrack] = useState('ВСЁ');
  const filtered = events.filter(
    (e) =>
      e.day === day &&
      (track === 'ВСЁ' ||
        e.track === track ||
        (track === 'DIGITAL APTA' && e.day < 19) ||
        (track === 'ОБРАЗОВАНИЕ' && ['3D', 'ХАКАТОН', 'HACKATHON'].includes(e.track))),
  );
  return (
    <>
      <div className="filters" aria-label="Фильтр по направлению">
        {tracks.map((t) => (
          <button
            key={t}
            className={track === t ? 'active' : ''}
            onClick={() => setTrack(t)}
            aria-pressed={track === t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="day-tabs" aria-label="Фильтр по дню">
        {[12, 13, 14, 15, 16, 17, 18, 19].map((d) => (
          <button
            key={d}
            className={day === d ? 'active' : ''}
            onClick={() => setDay(d)}
            aria-pressed={day === d}
          >
            {d}
            <small>СЕН</small>
          </button>
        ))}
      </div>
      <p className="form-note">
        Время указано по часовому поясу UTC+5. Точное расписание организаторы опубликуют отдельно.
      </p>
      {filtered.length ? (
        filtered.map((e) => {
          const registration = registrations.find((r) => r.event_id === e.id);
          return (
            <article className="schedule-event" key={e.id}>
              <div className="program-time">
                {e.time}
                <small>ВРЕМЯ</small>
              </div>
              <div>
                <span className="eyebrow">{e.track}</span>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <div className="event-meta">
                  <span>{e.location}</span>
                  <span>{e.registration_required ? 'НУЖНА РЕГИСТРАЦИЯ' : 'ОТКРЫТАЯ СЕССИЯ'}</span>
                  <span>+{e.coins} БАЛЛОВ</span>
                  <span>
                    {e.available === 0
                      ? 'МЕСТ НЕТ'
                      : e.available != null
                        ? `${e.available} мест доступно`
                        : e.capacity
                          ? `Всего мест: ${e.capacity}`
                          : 'ЛИМИТ СКОРО'}
                  </span>
                </div>
              </div>
              <div className="event-register">
                {registration ? (
                  <span className="status">{registration.status}</span>
                ) : (
                  <ActionButton name="register_event" input={{ event_id_input: e.id }}>
                    {e.available === 0 ? 'В лист ожидания ↗' : 'Добавить в расписание ↗'}
                  </ActionButton>
                )}
              </div>
            </article>
          );
        })
      ) : (
        <div className="empty">
          <h3>В этом фильтре событий нет.</h3>
          <p>
            {day === 13 || day === 14
              ? 'Акселерация стартапов продолжается. Расписание команд выдают менторы.'
              : 'Выберите другой день или направление.'}
          </p>
          <button className="button secondary" onClick={() => setTrack('ALL')}>
            Показать всё
          </button>
        </div>
      )}
    </>
  );
}
