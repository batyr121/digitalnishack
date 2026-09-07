import { QuickAdminForm } from '@/components/forms';

export const metadata = { title: 'Quick admin', robots: { index: false, follow: false } };

export default function QuickAdminPage() {
  return (
    <main className="container page-shell narrow">
      <p className="eyebrow">Organizer tool</p>
      <h1>Quick admin</h1>
      <p className="lead">
        Generate invitation promo codes without email login. Keep the admin code private.
      </p>
      <QuickAdminForm />
    </main>
  );
}
