'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { simpleAdminLogin, simpleAdminLogout, type ActionResult } from '@/lib/actions';
import { Result } from './forms';

export function SimpleAdminLoginForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const r = await simpleAdminLogin(String(f.get('password')));
          setResult(r);
          if (!r.error) router.push('/admin');
        });
      }}
    >
      <h2>Простой вход в админку</h2>
      <label className="field">
        Админ-пароль
        <input name="password" type="password" required minLength={6} autoComplete="off" />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Входим…' : 'Войти в админку'}
      </button>
      <Result result={result} />
      <p className="form-note">Пароль по умолчанию: DNF-ADMIN-2026, если на хостинге не задан ADMIN_PASSWORD.</p>
    </form>
  );
}

export function SimpleAdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      className="button secondary"
      onClick={async () => {
        await simpleAdminLogout();
        router.push('/admin-login');
      }}
    >
      Выйти
    </button>
  );
}
