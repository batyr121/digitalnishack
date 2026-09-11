import { redirect } from 'next/navigation';
import { QuickAdminForm } from '@/components/forms';
import { QRScanner } from '@/components/scanner';
import { SimpleAdminLogoutButton } from '@/components/simple-admin-login';
import { publicRows } from '@/lib/supabase';
import { requireSimpleAdminAccess } from '@/lib/simple-admin';

export const metadata = { title: 'Админка', robots: { index: false, follow: false } };

export default async function Admin({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  await requireSimpleAdminAccess();
  const section = (await params).section?.join('/') || '';
  if (section && section !== 'check-in' && section !== 'promocodes') redirect('/admin');
  const eventRows = ((await publicRows('events')) ?? []) as Record<string, unknown>[];
  const events = eventRows.map((event) => ({
    id: String(event.id),
    title: String(event.title),
  }));
  return (
    <div className="container workspace">
      <aside className="sidebar" aria-label="Навигация админки">
        <a href="/admin">Главная</a>
        <a href="/admin/promocodes">Промокоды</a>
        <a href="/admin/check-in">QR и баллы</a>
        <SimpleAdminLogoutButton />
      </aside>
      <main className="workspace-main">
        <span className="eyebrow" style={{ marginBottom: 15 }}>
          ПРОСТАЯ АДМИНКА
        </span>
        <h1>{section === 'check-in' ? 'QR и баллы' : section === 'promocodes' ? 'Промокоды' : 'Пульт форума'}</h1>
        {!section && (
          <div className="dashboard-grid">
            <div>
              <QuickAdminForm simpleAdmin />
            </div>
            <div className="form-card">
              <h2>Как пользоваться</h2>
              <p>1. Генерируешь промокоды.</p>
              <p>2. Участники активируют код и получают QR-пропуск.</p>
              <p>3. На форуме открываешь “QR и баллы”, сканируешь QR и начисляешь баллы.</p>
              <a className="button secondary" href="/admin/check-in" style={{ marginTop: 20 }}>
                Открыть QR-сканер ↗
              </a>
            </div>
          </div>
        )}
        {section === 'promocodes' && <QuickAdminForm simpleAdmin />}
        {section === 'check-in' && <QRScanner events={events} simpleAdmin />}
      </main>
    </div>
  );
}
