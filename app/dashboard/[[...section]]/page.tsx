import Link from 'next/link';
import { CoinNotifier } from '@/components/coin-notifier';
import { notFound } from 'next/navigation';
import { db, requireUser } from '@/lib/supabase';
import { getSimpleTicketToken } from '@/lib/simple-pass';
import { StatsCard, Empty, Button } from '@/components/ui';
import { DigitalPass } from '@/components/pass';
import { QuestionForm } from '@/components/forms';
import { ScheduleTimeline } from '@/components/schedule';
import { signOut } from '@/lib/actions';
import type { EventRecord } from '@/lib/config';
export const metadata = { title: 'Your digital journey', robots: { index: false, follow: false } };
const links = [
  ['Главная', ''],
  ['Мой пропуск', 'pass'],
  ['Программа', 'schedule'],
  ['Баллы', 'coins'],
  ['Активность', 'activity'],
  ['Сертификат', 'certificate'],
  ['Вопрос', 'questions'],
];

function SimpleDashboard({ section, pass }: { section: string; pass: any }) {
  const ticket = { id: pass.id, token: pass.token, type: pass.type, status: pass.status };
  const balance = Number(pass.balance || 0);
  const target = 400;
  const progress = Math.min(100, Math.max(0, Math.round((balance / target) * 100)));
  const passCard = <DigitalPass name={pass.name} role={pass.role || 'Участник'} ticket={ticket} />;
  const coins = (
    <div className="form-card">
      <span className="eyebrow">БАЛЛЫ ЗА АКТИВНОСТЬ</span>
      <h2>{balance} баллов</h2>
      <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
      <p className="form-note">Организатор начисляет баллы после сканирования QR на мастер-классах и событиях.</p>
    </div>
  );
  let content: React.ReactNode = (
    <>
      <p style={{ marginBottom: 25 }}>Ваш пропуск активен. Покажите QR организатору на входе или на мастер-классе.</p>
      <div className="dashboard-grid"><div>{passCard}</div><div>{coins}</div></div>
    </>
  );
  if (section === 'pass') content = passCard;
  if (section === 'coins' || section === 'activity') content = coins;
  if (section === 'schedule') content = <Empty title="Программа форума"><p>Программа доступна на главной странице сайта.</p><Button href="/program">Открыть программу</Button></Empty>;
  if (section === 'certificate') content = <Empty title="Сертификат"><p>Сертификат будет доступен после участия в активностях форума.</p></Empty>;
  if (section === 'questions') content = <Empty title="Вопросы"><p>Задайте вопрос организаторам на площадке форума.</p></Empty>;
  return (
    <div className="container workspace">
      <aside className="sidebar" aria-label="Навигация пропуска">
        {links.map(([name, href]) => (
          <Link key={name} href={`/dashboard${href ? '/' + href : ''}`} aria-current={section === href ? 'page' : undefined}>{name}</Link>
        ))}
      </aside>
      <div className="workspace-main">
        <CoinNotifier initialBalance={balance} />
        <span className="eyebrow" style={{ marginBottom: 15 }}>DIGITAL NIS FORUM</span>
        <h1>{section ? links.find((l) => l[1] === section)?.[0] : 'Ваш цифровой пропуск'}</h1>
        {content}
      </div>
    </div>
  );
}

export default async function Dashboard({ params }: { params: Promise<{ section?: string[] }> }) {
  const section = (await params).section?.join('/') || '';
  if (!links.some((l) => l[1] === section)) notFound();
  const simpleToken = await getSimpleTicketToken();
  if (simpleToken) {
    const client = await db();
    const { data: simplePass } = await client.rpc('quick_pass_by_token', { ticket_token: simpleToken });
    if (simplePass?.valid) return <SimpleDashboard section={section} pass={simplePass} />;
  }
  const { client, user, profile } = await requireUser();
  const results = await Promise.all([
    client.from('tickets').select('*').eq('user_id', user.id).maybeSingle(),
    client
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    client.from('attendance').select('*,events(title)').eq('user_id', user.id),
    client.from('event_registrations').select('*').eq('user_id', user.id),
    client.from('events').select('*').order('day'),
    client.from('certificates').select('*').eq('user_id', user.id).maybeSingle(),
    client.from('applications').select('*').eq('user_id', user.id).maybeSingle(),
    client.from('site_settings').select('value').eq('key', 'certificateThreshold').maybeSingle(),
    client.from('achievements').select('*'),
    client.from('user_achievements').select('*').eq('user_id', user.id),
    client
      .from('questions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);
  if (results.some((r) => r.error))
    throw new Error('Your dashboard is temporarily unavailable. Please try again.');
  const [
    ticket,
    transactions,
    attendance,
    registrations,
    events,
    certificate,
    application,
    setting,
    achievements,
    earned,
    questions,
  ] = results.map((r) => r.data) as any[];
  const balance = (transactions ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount,
    0,
  );
  const target = setting?.value ?? 400;
  const progress = Math.min(100, Math.max(0, Math.round((balance / target) * 100)));
  const pass = ticket ? (
    <DigitalPass name={profile.full_name} role={profile.participant_role} ticket={ticket} />
  ) : (
    <Empty title="Your Digital Pass is on its way.">
      <p>
        {application
          ? `Application status: ${application.status}. An approved application unlocks your personal pass.`
          : 'Submit your application or activate an invitation to receive a pass.'}
      </p>
      <Button href={application ? '/activate' : '/apply'}>
        {application ? 'Activate invitation' : 'Apply to forum'}
      </Button>
    </Empty>
  );
  const cert = (
    <div className="form-card">
      <span className="eyebrow">CERTIFICATE TARGET</span>
      <h2>
        {balance} / {target} DIGITAL COINS
      </h2>
      <div className="progress-track">
        <div style={{ width: `${progress}%` }} />
      </div>
      <p>{progress}% COMPLETE</p>
      {certificate?.status === 'ISSUED' ? (
        <Button href={`/certificate/${certificate.id}`}>Open certificate</Button>
      ) : (
        <p className="form-note">
          {certificate?.status === 'REVOKED'
            ? 'This certificate has been revoked. Contact an organizer.'
            : 'Attend activities to unlock your participation certificate.'}
        </p>
      )}
    </div>
  );
  let content: React.ReactNode;
  if (section === 'pass') content = pass;
  else if (section === 'schedule')
    content = <ScheduleTimeline events={events as EventRecord[]} registrations={registrations} />;
  else if (section === 'coins')
    content = (
      <>
        <div className="coin-balance">{balance}</div>
        <span className="eyebrow">DIGITAL COINS · LEARN. BUILD. CONNECT. EARN.</span>
        <p style={{ marginTop: 20 }}>
          Internal event points. Non-transferable, with no monetary value.
        </p>
        <h2>Transaction history</h2>
        {transactions.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Points</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t.id}>
                    <td>{t.reason}</td>
                    <td style={{ color: 'var(--lime)' }}>
                      {t.amount > 0 ? '+' : ''}
                      {t.amount}
                    </td>
                    <td>{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Your first experience awaits.">
            <p>Earn coins when an organizer records your activity attendance.</p>
          </Empty>
        )}
        {cert}
      </>
    );
  else if (section === 'certificate') content = cert;
  else if (section === 'questions')
    content = (
      <>
        <QuestionForm />
        {questions.map((q: any) => (
          <div className="notice" key={q.id}>
            <span className="status">{q.status}</span>
            <p>{q.body}</p>
          </div>
        ))}
      </>
    );
  else if (section === 'activity')
    content = (
      <>
        {attendance.length ? (
          attendance.map((a: any) => (
            <div className="program-row" key={a.id}>
              <span className="status">ATTENDED</span>
              <h3>{a.events?.title}</h3>
              <span>+{a.coins_awarded} coins</span>
            </div>
          ))
        ) : (
          <Empty title="Your journey is just beginning.">
            <p>Visit a session and have your QR scanned to record your attendance.</p>
          </Empty>
        )}
        <h2>Achievements</h2>
        <div className="badge-grid">
          {achievements.map((a: any) => (
            <div
              key={a.id}
              className={`achievement ${earned.some((e: any) => e.achievement_id === a.id) ? 'earned' : ''}`}
            >
              <span style={{ fontSize: 26, color: 'var(--lime)' }}>✳</span>
              <h3>{a.name}</h3>
              <p>{a.description}</p>
            </div>
          ))}
        </div>
      </>
    );
  else
    content = (
      <>
        <p style={{ marginBottom: 25 }}>
          Hello, {profile?.full_name || 'future innovator'}. Your next connection is waiting.
        </p>
        <div className="workspace-stats">
          <StatsCard value={balance} label="DIGITAL COINS" />
          <StatsCard value={attendance.length} label="EVENTS ATTENDED" />
          <StatsCard
            value={registrations.filter((r: any) => r.status === 'REGISTERED').length}
            label="UPCOMING EVENTS"
          />
        </div>
        <div className="dashboard-grid">
          <div>{pass}</div>
          <div>
            {cert}
            <div className="empty">
              <span className="eyebrow">APPLICATION</span>
              <h3>{application?.status || 'NOT SUBMITTED'}</h3>
              <Button href="/program">Explore the program</Button>
            </div>
          </div>
        </div>
      </>
    );
  return (
    <div className="container workspace">
      <aside className="sidebar" aria-label="Account navigation">
        {links.map(([name, href]) => (
          <Link
            key={name}
            href={`/dashboard${href ? '/' + href : ''}`}
            aria-current={section === href ? 'page' : undefined}
          >
            {name}
          </Link>
        ))}
        {['ADMIN', 'ORGANIZER'].includes(profile?.role) && (
          <Link href="/admin">Organizer panel ↗</Link>
        )}
        <form action={signOut}>
          <button className="button secondary" style={{ fontSize: 8, marginTop: 20 }}>
            Sign out
          </button>
        </form>
      </aside>
      <div className="workspace-main">
        <CoinNotifier initialBalance={balance} />
        <span className="eyebrow" style={{ marginBottom: 15 }}>
          YOUR DIGITAL NIS JOURNEY
        </span>
        <h1>
          {section ? links.find((l) => l[1] === section)?.[0] : 'Everything starts with you.'}
        </h1>
        {content}
      </div>
    </div>
  );
}
