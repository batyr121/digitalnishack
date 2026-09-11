import { SimpleAdminLoginForm } from '@/components/simple-admin-login';

export const metadata = { title: 'Вход в админку', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="container page-shell narrow">
      <p className="eyebrow">DIGITAL NIS FORUM</p>
      <h1>Вход в админку</h1>
      <p className="lead">Введите админ-пароль. Email и Supabase-login больше не нужны.</p>
      <SimpleAdminLoginForm />
    </main>
  );
}
