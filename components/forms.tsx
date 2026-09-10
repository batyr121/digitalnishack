'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  runAction,
  sendMagicLink,
  signInWithPassword,
  signUpWithPassword,
  quickGeneratePromos,
  askQuestion,
  enterCompetition,
  type ActionResult,
} from '@/lib/actions';
const roleOptions = [
  ['Student', 'Ученик'],
  ['Teacher', 'Учитель'],
  ['Startup Founder', 'Основатель стартапа'],
  ['Developer', 'Разработчик'],
  ['Guest', 'Гость'],
  ['Partner', 'Партнёр'],
  ['Other', 'Другое'],
] as const;
const passTypeOptions = [
  ['GENERAL', 'Обычный'],
  ['GUEST', 'Гость'],
  ['PARTICIPANT', 'Участник'],
  ['STARTUP_BATTLE', 'Startup Battle'],
  ['HACKATHON', 'Хакатон'],
  ['FIFA', 'FIFA Tournament 7–8'],
  ['SPEAKER', 'Спикер'],
  ['PARTNER', 'Партнёр'],
  ['ORGANIZER', 'Организатор'],
  ['VIP_GUEST', 'VIP-гость'],
] as const;
export function Result({ result }: { result: ActionResult | null }) {
  const readable = (value?: string) =>
    value
      ?.replace('APPLICATION RECEIVED', 'Заявка принята.')
      .replace('Code copied', 'Код скопирован.')
      .replace('Coin adjustment recorded', 'Баллы начислены.')
      .replace('CHECKED IN', 'Отмечено.')
      .replace('ALREADY CHECKED IN', 'Уже отмечен.')
      .replace('INVALID PASS', 'Пропуск недействителен.')
      .replace('Access denied', 'Нет доступа.')
      .replace('Forbidden', 'Нет доступа.');
  return result ? (
    <div
      className={`notice ${result.error ? 'error' : ''}`}
      role={result.error ? 'alert' : 'status'}
    >
      {readable(result.error || result.message)}
    </div>
  ) : null;
}
export function ActionButton({
  name,
  input,
  children,
}: {
  name: string;
  input: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <button
        className="button secondary"
        disabled={pending}
        onClick={() => start(async () => setResult(await runAction(name, input)))}
      >
        {pending ? 'Сохраняем…' : children}
      </button>
      <Result result={result} />
    </div>
  );
}
export function LoginForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const email = String(f.get('email'));
        const password = String(f.get('password') || '');
        const intent = String(f.get('intent') || 'signin');
        start(async () => {
          const next =
            intent === 'magic'
              ? await sendMagicLink(email)
              : intent === 'signup'
                ? await signUpWithPassword(email, password)
                : await signInWithPassword(email, password);
          setResult(next);
          if (!next.error && intent !== 'magic') router.refresh();
        });
      }}
    >
      <label className="field">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
        />
      </label>
      <label className="field">
        Пароль
        <input
          type="password"
          name="password"
          minLength={8}
          maxLength={128}
          autoComplete="current-password"
          placeholder="минимум 8 символов"
        />
      </label>
      <div className="button-row">
        <button className="button" name="intent" value="signin" disabled={pending}>
          {pending ? 'Проверяем…' : 'Войти ↗'}
        </button>
        <button className="button secondary" name="intent" value="signup" disabled={pending}>
          Создать аккаунт
        </button>
      </div>
      <button className="text-button" name="intent" value="magic" disabled={pending}>
        Отправить ссылку на вход
      </button>
      <Result result={result} />
      <p className="form-note">
        Админка доступна для amantaibatyrkhan11@gmail.com после настройки Supabase.
      </p>
    </form>
  );
}
export function ApplyForm({
  email,
  signedIn,
  enabled,
}: {
  email?: string;
  signedIn: boolean;
  enabled: boolean;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const [role, setRole] = useState('Student');
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!signedIn) {
          setResult({ error: 'Сначала войдите в аккаунт, потом отправьте заявку.' });
          return;
        }
        const f = new FormData(e.currentTarget);
        start(async () =>
          setResult(
            await runAction('apply_forum', {
              full_name_input: f.get('name'),
              organization_input: f.get('organization'),
              participant_role_input: role,
              grade_input: f.get('grade') || null,
            }),
          ),
        );
      }}
    >
      <div className="form-grid">
        <label className="field">
          ФИО
          <input
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
            placeholder="Ваше имя и фамилия"
          />
        </label>
        <label className="field">
          Email
          <input
            type="email"
            name="email"
            required
            defaultValue={email}
            readOnly={signedIn}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="field">
        Школа / организация
        <input
          name="organization"
          autoComplete="organization"
          minLength={2}
          maxLength={180}
          required
          placeholder="Где учитесь или работаете?"
        />
      </label>
      <div className="form-grid">
        <label className="field">
          Роль
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roleOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {role === 'Student' && (
          <label className="field">
            Класс
            <input name="grade" maxLength={30} placeholder="например, 10 класс" />
          </label>
        )}
      </div>
      <label className="check-field">
        <input type="checkbox" required />
        <span>
          Я согласен с <Link href="/rules">правилами мероприятия</Link> и{' '}
          <Link href="/privacy">политикой конфиденциальности</Link>.
        </span>
      </label>
      <button className="button" disabled={pending || !enabled}>
        {pending ? 'Отправляем…' : 'Подать заявку ↗'}
      </button>
      <Result result={result} />
      {!signedIn && (
        <p className="form-note">
          <Link className="text-link" href="/login">
            Войти, чтобы отправить заявку ↗
          </Link>
        </p>
      )}
      {result?.message && (
        <p className="form-note">
          <Link href="/dashboard">Посмотреть статус заявки →</Link>
        </p>
      )}
    </form>
  );
}
export function PromoForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () =>
          setResult(await runAction('activate_promo', { invitation_code: data.get('code') })),
        );
      }}
    >
      <label className="field">
        Введите промокод
        <input
          name="code"
          required
          minLength={6}
          maxLength={50}
          placeholder="DNF-XXXX-XXXX"
          autoCapitalize="characters"
          autoComplete="off"
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Проверяем…' : 'Активировать промокод ↗'}
      </button>
      <Result result={result} />
      {result?.message && (
        <Link className="button" href="/dashboard/pass">
          Открыть пропуск ↗
        </Link>
      )}
      <p className="form-note">
        Сначала войдите и заполните <Link href="/apply">заявку</Link>. Промокод выдаёт организатор.
      </p>
    </form>
  );
}
export function QuickAdminForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const codes =
    result?.data && typeof result.data === 'object' && 'codes' in result.data
      ? ((result.data as { codes?: string[] }).codes ?? [])
      : [];
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () =>
          setResult(
            await quickGeneratePromos(
              String(f.get('adminCode')),
              String(f.get('count')),
              String(f.get('type')),
              String(f.get('uses')),
            ),
          ),
        );
      }}
    >
      <h2>Генератор промокодов</h2>
      <label className="field">
        Код админа
        <input
          name="adminCode"
          type="password"
          minLength={6}
          maxLength={100}
          required
          placeholder="Введите код админа"
          autoComplete="off"
        />
      </label>
      <div className="form-grid">
        <label className="field">
          Количество кодов
          <input name="count" type="number" min={1} max={500} defaultValue={20} required />
        </label>
        <label className="field">
          Использований на код
          <input name="uses" type="number" min={1} max={10000} defaultValue={1} required />
        </label>
      </div>
      <label className="field">
        Тип пропуска
        <select name="type" defaultValue="GENERAL">
          {passTypeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Генерируем...' : 'Сгенерировать промокоды'}
      </button>
      <Result result={result} />
      {codes.length > 0 && (
        <textarea className="code-output" readOnly value={codes.join('\n')} rows={10} />
      )}
      <p className="form-note">
        Выдайте по одному коду каждому участнику. Участник вводит его на странице активации.
      </p>
    </form>
  );
}
export function QuestionForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        start(async () => {
          const r = await askQuestion(String(f.get('question')));
          setResult(r);
          if (!r.error) form.reset();
        });
      }}
    >
      <label className="field">
        Вопрос для панельной дискуссии
        <textarea
          name="question"
          required
          minLength={10}
          maxLength={1000}
          placeholder="Что хотите спросить?"
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Отправляем…' : 'Отправить вопрос ↗'}
      </button>
      <Result result={result} />
    </form>
  );
}
export function CompetitionForm({ id }: { id: string }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () =>
          setResult(
            await enterCompetition(id, String(f.get('name')), String(f.get('description'))),
          ),
        );
      }}
    >
      <label className="field">
        Название проекта / команды / участника
        <input name="name" required minLength={2} maxLength={120} />
      </label>
      <label className="field">
        Расскажите о заявке
        <textarea name="description" required minLength={20} maxLength={2000} />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Отправляем…' : 'Отправить заявку ↗'}
      </button>
      <Result result={result} />
    </form>
  );
}
