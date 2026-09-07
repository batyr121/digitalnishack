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
  const [track, setTrack] = useState('ALL');
  const filtered = events.filter(
    (e) =>
      e.day === day &&
      (track === 'ALL' ||
        e.track === track ||
        (track === 'DIGITAL APTA' && e.day < 19) ||
        (track === 'EDUCATION' && ['3D', 'HACKATHON'].includes(e.track))),
  );
  return (
    <>
      <div className="filters" aria-label="Filter by track">
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
      <div className="day-tabs" aria-label="Filter by day">
        {[12, 13, 14, 15, 16, 17, 18, 19].map((d) => (
          <button
            key={d}
            className={day === d ? 'active' : ''}
            onClick={() => setDay(d)}
            aria-pressed={day === d}
          >
            {d}
            <small>SEP</small>
          </button>
        ))}
      </div>
      <p className="form-note">
        All times are local (UTC+5). Exact session times and capacities will be published by the
        organizers.
      </p>
      {filtered.length ? (
        filtered.map((e) => {
          const registration = registrations.find((r) => r.event_id === e.id);
          return (
            <article className="schedule-event" key={e.id}>
              <div className="program-time">
                {e.time}
                <small>TIME</small>
              </div>
              <div>
                <span className="eyebrow">{e.track}</span>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <div className="event-meta">
                  <span>{e.location}</span>
                  <span>{e.registration_required ? 'REGISTRATION REQUIRED' : 'OPEN SESSION'}</span>
                  <span>+{e.coins} DIGITAL COINS</span>
                  <span>
                    {e.available === 0
                      ? 'FULL'
                      : e.available != null
                        ? `${e.available} places available`
                        : e.capacity
                          ? `${e.capacity} total places`
                          : 'CAPACITY TBA'}
                  </span>
                </div>
              </div>
              <div className="event-register">
                {registration ? (
                  <span className="status">{registration.status}</span>
                ) : (
                  <ActionButton name="register_event" input={{ event_id_input: e.id }}>
                    {e.available === 0 ? 'Join waitlist ↗' : 'Add to my schedule ↗'}
                  </ActionButton>
                )}
              </div>
            </article>
          );
        })
      ) : (
        <div className="empty">
          <h3>No sessions in this view.</h3>
          <p>
            {day === 13 || day === 14
              ? 'Startup acceleration continues. Individual team schedules are provided by mentors.'
              : 'Choose a different track or day to explore the program.'}
          </p>
          <button className="button secondary" onClick={() => setTrack('ALL')}>
            Show all tracks
          </button>
        </div>
      )}
    </>
  );
}
