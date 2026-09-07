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
    'THE PROGRAM',
    'Ideas on the agenda.',
    'Eight days of learning, building and connecting. Find your next experience.',
  ],
  'digital-apta': [
    '12—18 SEPTEMBER 2026',
    'DIGITAL\nAPTA.',
    'A week before the forum. Seven days of learning, building and preparing.',
  ],
  speakers: [
    'THE VOICES OF TOMORROW',
    'Big minds.\nStill under wraps.',
    'Three keynote speakers. Three independent panelists. Six perspectives to move you forward.',
  ],
  zones: [
    'EXPLORE THE FORUM',
    'Find your space.',
    'From the main stage to the makers’ lab. Follow your curiosity.',
  ],
  apply: [
    'FREE ENTRY · REGISTRATION REQUIRED',
    'Your next connection\nstarts here.',
    'Apply to DIGITAL NIS FORUM. After approval, your personal Digital Pass will be waiting in your dashboard.',
  ],
  activate: [
    'YOU’RE INVITED',
    'Unlock your\ndigital future.',
    'An invitation from your organizer. One code. Your personal Digital Pass.',
  ],
  login: [
    'YOUR DIGITAL NIS JOURNEY',
    'Welcome to\nwhat’s next.',
    'Sign in to manage your application, Digital Pass, schedule and achievements.',
  ],
  privacy: ['YOUR DATA', 'Privacy policy', 'Transparency is part of a good connection.'],
  rules: ['BEFORE YOU JOIN', 'Event rules', 'A shared space for learning, building and respect.'],
  contact: [
    'LET’S CONNECT',
    'Contact the forum.',
    'Official organizer contact details will be published here.',
  ],
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
            <strong>FINALISTS REVEALED</strong>
            <span className="pill">STARTUP BATTLE / HACKATHON / JAS STARTUPER / FIFA</span>
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
          <h2>Three minds. One conversation.</h2>
          <p style={{ margin: '20px 0 30px' }}>
            Your questions. Expert perspectives. An open dialogue on the future.
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
            <Button href="/dashboard/questions">Ask a question</Button>
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
            Applications will open when the organizers connect the registration service.
          </div>
        )}
        {!enabled && <div className="notice">Applications are currently closed.</div>}
        <ApplyForm signedIn={!!user} email={user?.email} enabled={enabled} />
        <p className="form-note">
          Have an invitation code? <Link href="/activate">Activate it here ↗</Link>
        </p>
      </>
    );
  } else if (slug === 'activate') body = <PromoForm />;
  else if (slug === 'login')
    body = (
      <>
        {search.notice === 'setup' && (
          <div className="notice">
            The account service is not connected yet. Public program pages are available.
          </div>
        )}
        {search.error && (
          <div className="notice error">
            Your sign-in link has expired or could not be verified. Request a new link.
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
          <span className="active">19 SEPTEMBER 2026</span>
          <span>FINALISTS · 17 SEPTEMBER</span>
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
                        ? 'WINNER'
                        : e.place === 2
                          ? '2ND PLACE'
                          : e.place === 3
                            ? '3RD PLACE'
                            : e.status}
                    </span>
                    <h3 style={{ marginTop: 20 }}>{e.name}</h3>
                    <p>{e.description}</p>
                    {e.founders && <p>{e.founders}</p>}
                    {e.pitch_time && <p>PITCH · {e.pitch_time}</p>}
                    {e.website && (
                      <a href={e.website} className="text-link">
                        Project website ↗
                      </a>
                    )}
                  </article>
                ))
              : Array.from({ length: competition.slots || 4 }, (_, i) => (
                  <article className="locked-slot" key={i}>
                    <Lock size={28} />
                    <h3>
                      {slug === 'startup-battle' ? 'STARTUP' : 'PARTICIPANT'}{' '}
                      {String(i + 1).padStart(2, '0')}
                    </h3>
                    <p>LOCKED · REVEAL 17 SEPTEMBER</p>
                  </article>
                ))}
          </div>
          <div className="prose">
            <h2>How it works</h2>
            <p>APPLICATION → REVIEW → FINALIST → FINAL → WINNER</p>
            <h2>Rules & judging</h2>
            <p>
              {record?.rules ||
                'Detailed rules and eligibility will be published by the organizers before selection.'}
            </p>
            <p>
              {record?.judging || 'Judging criteria and the final schedule are to be announced.'}
            </p>
          </div>
          {slug === 'fifa' && (
            <>
              <h2 style={{ margin: '35px 0 20px' }}>Tournament bracket</h2>
              <div className="bracket">
                {(record?.bracket?.length
                  ? record.bracket
                  : [
                      {
                        name: 'QUARTERFINALS',
                        matches: ['TBA vs TBA', 'TBA vs TBA', 'TBA vs TBA', 'TBA vs TBA'],
                      },
                      { name: 'SEMIFINALS', matches: ['TBA vs TBA', 'TBA vs TBA'] },
                      { name: 'FINAL', matches: ['TBA vs TBA'] },
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
        <h2 style={{ marginBottom: 25 }}>Bring your idea.</h2>
        {record ? (
          <CompetitionForm id={record.id} />
        ) : (
          <Empty title="Competition applications open soon.">
            <p>Start with your forum application to join the community.</p>
            <Button href="/apply">Apply to forum</Button>
          </Empty>
        )}
      </>
    );
  } else if (slug === 'privacy')
    body = (
      <div className="prose">
        <h2>Information we collect</h2>
        <p>
          We collect your name, verified email, school or organization, role and optional grade to
          process your application and issue a personal pass. We record activity attendance, points
          and questions you submit.
        </p>
        <h2>How it is used</h2>
        <p>
          Authorized organizers use this information to manage admission, event capacity and
          certificates. QR passes contain only a random token. Certificate verification displays the
          recipient’s name and issuance status to anyone with the verification link.
        </p>
        <h2>Access and retention</h2>
        <p>
          Your account data is accessible to you and authorized organizers. Do not share your
          personal QR code. Organizer contact details and the final retention period must be
          published before registration opens.
        </p>
        <div className="notice">
          Pre-launch policy. The organizing institution must confirm the data controller, contact
          channel, retention period and requirements for minors before accepting applications.
        </div>
      </div>
    );
  else if (slug === 'rules')
    body = (
      <div className="prose">
        <h2>Participation</h2>
        <p>
          The forum is free. Admission requires an active personal Digital Pass. Applications are
          reviewed by the organizers. Passes are personal and must not be shared.
        </p>
        <h2>A respectful community</h2>
        <p>
          Respect other participants, speakers, staff and the venue. Harassment, discrimination and
          disruption are not permitted. Follow staff instructions and activity-specific safety
          guidance.
        </p>
        <h2>Activities and points</h2>
        <p>
          Some activities have limited capacity. Attendance is recorded by organizers. Digital Coins
          are internal, non-transferable event points with no monetary value. Duplicate attendance
          does not earn additional points.
        </p>
        <h2>Competitions</h2>
        <p>
          Each competition will publish its own eligibility, submission and judging rules before
          selection. Final venue information and requirements for younger participants will be
          published by the organizers.
        </p>
      </div>
    );
  else
    body = (
      <Empty title="Official contacts coming soon.">
        <p>
          Please contact your school’s forum organizing team. No public email, phone number or
          social account has been announced yet.
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
