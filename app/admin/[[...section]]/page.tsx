import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/supabase';
import { StatsCard } from '@/components/ui';
import {
  DataTable,
  RecordEditor,
  PromoGenerator,
  CoinAdjustment,
  AssetUploader,
} from '@/components/admin';
import { QRScanner } from '@/components/scanner';
import { adminCollections } from '@/lib/admin-config';
export const metadata = { title: 'Organizer panel', robots: { index: false, follow: false } };
export default async function Admin({
  params,
  searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<{ user?: string }>;
}) {
  const section = (await params).section?.join('/') || '';
  const filter = (await searchParams).user;
  const { client } = await requireUser(true);
  if (section === 'program') redirect('/admin/events');
  if (section && !adminCollections[section] && section !== 'check-in') notFound();
  let content: React.ReactNode;
  async function read(table: string, select = '*') {
    const { data, error } = await client.from(table).select(select).limit(2000);
    if (error) throw new Error(`Unable to load ${table}. Please retry.`);
    return data as unknown as Record<string, unknown>[];
  }
  if (!section) {
    const [
      applications,
      tickets,
      redemptions,
      coins,
      certificates,
      attendance,
      profiles,
      eventRows,
    ] = await Promise.all(
      [
        'applications',
        'tickets',
        'promo_code_redemptions',
        'coin_transactions',
        'certificates',
        'attendance',
        'profiles',
        'events',
      ].map((t) => read(t)),
    );
    const stats = [
      ['TOTAL REGISTRATIONS', applications.length],
      ['APPROVED', applications.filter((r) => r.status === 'APPROVED').length],
      ['CHECKED IN', tickets.filter((r) => r.checked_in_at).length],
      ['ACTIVE PASSES', tickets.filter((r) => r.status === 'ACTIVE').length],
      ['PROMO ACTIVATIONS', redemptions.length],
      ['COINS ISSUED', coins.reduce((n, r) => n + Math.max(0, Number(r.amount)), 0)],
      ['CERTIFICATES UNLOCKED', certificates.filter((r) => r.status === 'ISSUED').length],
    ] as [string, number][];
    const roles = Object.entries(
      profiles.reduce(
        (a: Record<string, number>, p) => ({
          ...a,
          [String(p.participant_role)]: (a[String(p.participant_role)] || 0) + 1,
        }),
        {},
      ),
    );
    const byDay = Object.entries(
      applications.reduce(
        (a: Record<string, number>, p) => ({
          ...a,
          [String(p.created_at).slice(0, 10)]: (a[String(p.created_at).slice(0, 10)] || 0) + 1,
        }),
        {},
      ),
    );
    content = (
      <>
        <div className="workspace-stats">
          {stats.map(([l, v]) => (
            <StatsCard key={l} label={l} value={v} />
          ))}
        </div>
        <div className="dashboard-grid">
          <div className="form-card">
            <h2>Participants by role</h2>
            {roles.length ? (
              roles.map(([r, n]) => (
                <div key={r}>
                  <span className="eyebrow">
                    {r} · {n}
                  </span>
                  <div
                    className="chart-bar"
                    style={{ width: `${(n / Math.max(1, profiles.length)) * 100}%` }}
                  />
                </div>
              ))
            ) : (
              <p>No participants yet.</p>
            )}
          </div>
          <div className="form-card">
            <h2>Registrations by day</h2>
            {byDay.length ? (
              byDay.map(([d, n]) => (
                <div key={d}>
                  <span className="eyebrow">
                    {d} · {n}
                  </span>
                  <div
                    className="chart-bar"
                    style={{ width: `${(n / Math.max(1, applications.length)) * 100}%` }}
                  />
                </div>
              ))
            ) : (
              <p>No applications yet.</p>
            )}
          </div>
        </div>
        <h2>Attendance & popular events</h2>
        <DataTable
          table="stats"
          rows={eventRows
            .map((e) => ({
              title: e.title,
              attendance: attendance.filter((a) => a.event_id === e.id).length,
            }))
            .sort((a, b) => b.attendance - a.attendance)}
          columns={['title', 'attendance']}
        />
        <p className="form-note">
          Dashboard displays up to 2,000 records per collection. Use database reporting for larger
          datasets.
        </p>
      </>
    );
  } else if (section === 'check-in') {
    const events = await read('events');
    content = <QRScanner events={events as { id: string; title: string }[]} />;
  } else {
    const collection = adminCollections[section];
    const allRows = await read(
      collection.table,
      ['applications', 'tickets'].includes(section)
        ? '*,profiles(full_name,email,participant_role)'
        : '*',
    );
    const rows = filter ? allRows.filter((r) => r.user_id === filter) : allRows;
    let extra: React.ReactNode = null;
    if (section === 'content') {
      const zones = await read('zones');
      extra = (
        <>
          <h2>Forum zones</h2>
          <DataTable table="zones" rows={zones} columns={['id', 'name', 'description']} />
          <RecordEditor
            table="zones"
            rows={zones}
            template={{ name: '', description: '', icon: '', sort_order: 0 }}
          />
        </>
      );
    }
    if (section === 'competitions') {
      const entries = await read('competition_entries');
      extra = (
        <>
          <h2>Competition entries & finalists</h2>
          <DataTable
            table="competition_entries"
            rows={entries}
            columns={['id', 'competition_id', 'name', 'user_id', 'status', 'place']}
          />
          <RecordEditor
            table="competition_entries"
            rows={entries}
            template={{
              name: '',
              description: '',
              logo: null,
              founders: '',
              category: '',
              website: null,
              pitch_time: 'TBA',
              status: 'APPLICATION',
              place: null,
            }}
          />
        </>
      );
    }
    if (section === 'coins') {
      const rules = await read('coin_rules');
      extra = (
        <>
          <CoinAdjustment />
          <h2>Reward rules</h2>
          <DataTable
            table="coin_rules"
            rows={rules}
            columns={['key', 'name', 'points', 'active']}
          />
          <RecordEditor
            table="coin_rules"
            rows={rules}
            template={{ key: '', name: '', points: 20, active: true }}
          />
        </>
      );
    }
    if (section === 'certificates') {
      const settings = await read('site_settings');
      extra = (
        <>
          <h2>Certificate target</h2>
          <RecordEditor
            table="site_settings"
            rows={settings.filter((s) => s.key === 'certificateThreshold')}
            template={{ value: 400 }}
          />
        </>
      );
    }
    content = (
      <>
        {section === 'promocodes' && (
          <>
            <PromoGenerator />
            <a
              className="button secondary"
              href="/admin/promocodes/export"
              style={{ marginTop: 22 }}
            >
              Export CSV ↓
            </a>
          </>
        )}
        <DataTable table={collection.table} rows={rows} columns={collection.columns} />
        {collection.template && (
          <RecordEditor table={collection.table} rows={rows} template={collection.template} />
        )}{' '}
        {extra}
        {['speakers', 'partners', 'competitions', 'content'].includes(section) && <AssetUploader />}
      </>
    );
  }
  return (
    <div className="container workspace">
      <aside className="sidebar" aria-label="Admin navigation">
        <Link href="/admin">Overview</Link>
        <Link href="/admin/check-in">QR check-in</Link>
        {Object.keys(adminCollections).map((key) => (
          <Link
            key={key}
            href={`/admin/${key}`}
            aria-current={section === key ? 'page' : undefined}
          >
            {key}
          </Link>
        ))}
        <Link href="/dashboard">← My dashboard</Link>
      </aside>
      <div className="workspace-main">
        <span className="eyebrow" style={{ marginBottom: 15 }}>
          ORGANIZER WORKSPACE
        </span>
        <h1>
          {section
            ? section.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())
            : 'A connected overview.'}
        </h1>
        {content}
      </div>
    </div>
  );
}
