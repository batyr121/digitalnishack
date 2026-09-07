'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  runAction,
  sendMagicLink,
  askQuestion,
  enterCompetition,
  type ActionResult,
} from '@/lib/actions';
export function Result({ result }: { result: ActionResult | null }) {
  return result ? (
    <div
      className={`notice ${result.error ? 'error' : ''}`}
      role={result.error ? 'alert' : 'status'}
    >
      {result.error || result.message}
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
        {pending ? 'Saving…' : children}
      </button>
      <Result result={result} />
    </div>
  );
}
export function LoginForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => setResult(await sendMagicLink(String(f.get('email')))));
      }}
    >
      <label className="field">
        Email address
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Sending…' : 'Send sign-in link ↗'}
      </button>
      <Result result={result} />
      <p className="form-note">
        No password to remember. We’ll send you a secure link to sign in or create your account.
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
          setResult({ error: 'Please sign in using the link below to submit your application.' });
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
          Full name
          <input
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
            placeholder="Your full name"
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
        School / Organization
        <input
          name="organization"
          autoComplete="organization"
          minLength={2}
          maxLength={180}
          required
          placeholder="Where do you learn or work?"
        />
      </label>
      <div className="form-grid">
        <label className="field">
          Your role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {[
              'Student',
              'Teacher',
              'Startup Founder',
              'Developer',
              'Guest',
              'Partner',
              'Other',
            ].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        {role === 'Student' && (
          <label className="field">
            Class / Grade (optional)
            <input name="grade" maxLength={30} placeholder="e.g. Grade 10" />
          </label>
        )}
      </div>
      <label className="check-field">
        <input type="checkbox" required />
        <span>
          I agree to the <Link href="/rules">event rules</Link> and{' '}
          <Link href="/privacy">privacy policy</Link>.
        </span>
      </label>
      <button className="button" disabled={pending || !enabled}>
        {pending ? 'Submitting…' : 'Apply to Digital NIS Forum ↗'}
      </button>
      <Result result={result} />
      {!signedIn && (
        <p className="form-note">
          <Link className="text-link" href="/login">
            Sign in to submit your application ↗
          </Link>
        </p>
      )}
      {result?.message && (
        <p className="form-note">
          <Link href="/dashboard">View your application status →</Link>
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
        Enter your invitation code
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
        {pending ? 'Checking…' : 'Activate invitation ↗'}
      </button>
      <Result result={result} />
      {result?.message && (
        <Link className="button" href="/dashboard/pass">
          Open Digital Pass ↗
        </Link>
      )}
      <p className="form-note">
        Sign in and complete your <Link href="/apply">application details</Link> before activating.
        Your organizer supplies the invitation code.
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
        Your question for the panel
        <textarea
          name="question"
          required
          minLength={10}
          maxLength={1000}
          placeholder="What would you like to ask?"
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit question ↗'}
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
        Project / team / participant name
        <input name="name" required minLength={2} maxLength={120} />
      </label>
      <label className="field">
        Tell us about your application
        <textarea name="description" required minLength={20} maxLength={2000} />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit competition application ↗'}
      </button>
      <Result result={result} />
    </form>
  );
}
