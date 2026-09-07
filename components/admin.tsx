'use client';
import { useState, useTransition } from 'react';
import {
  runAction,
  saveRecord,
  uploadAsset,
  resendPassAccess,
  type ActionResult,
} from '@/lib/actions';
import { Result, ActionButton } from './forms';
export function DataTable({
  rows,
  columns,
  table,
}: {
  rows: Record<string, unknown>[];
  columns: string[];
  table: string;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const filtered = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <label className="field">
        Search records
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, role, status, type…"
        />
      </label>
      {table === 'applications' && (
        <div className="admin-actions">
          {['APPROVED', 'WAITLIST', 'REJECTED'].map((status) => (
            <button
              className="button secondary"
              key={status}
              disabled={pending || !selected.length}
              onClick={() =>
                start(async () => {
                  const results = [];
                  for (const id of selected)
                    results.push(
                      await runAction('review_application', {
                        application_id: id,
                        new_status: status,
                      }),
                    );
                  setResult(
                    results.find((r) => r.error) || {
                      message: `${selected.length} applications updated`,
                    },
                  );
                  setSelected([]);
                })
              }
            >
              {status} ({selected.length})
            </button>
          ))}
        </div>
      )}
      <Result result={result} />
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {table === 'applications' && (
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all filtered applications"
                    checked={
                      filtered.length > 0 && filtered.every((r) => selected.includes(String(r.id)))
                    }
                    onChange={(e) =>
                      setSelected(e.target.checked ? filtered.map((r) => String(r.id)) : [])
                    }
                  />
                </th>
              )}
              {columns.map((c) => (
                <th key={c}>{c.replaceAll('_', ' ')}</th>
              ))}
              {['applications', 'tickets', 'questions', 'promo_codes', 'certificates'].includes(
                table,
              ) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={String(r.id || r.key || i)}>
                {table === 'applications' && (
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select application ${r.id}`}
                      checked={selected.includes(String(r.id))}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, String(r.id)]
                            : selected.filter((id) => id !== r.id),
                        )
                      }
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c}>
                    {typeof r[c] === 'object' ? JSON.stringify(r[c]) : String(r[c] ?? '—')}
                  </td>
                ))}
                {table === 'applications' && (
                  <td>
                    <div className="admin-actions">
                      {['APPROVED', 'WAITLIST', 'REJECTED'].map((s) => (
                        <ActionButton
                          key={s}
                          name="review_application"
                          input={{ application_id: r.id, new_status: s }}
                        >
                          {s}
                        </ActionButton>
                      ))}
                    </div>
                  </td>
                )}
                {table === 'tickets' && (
                  <td>
                    <ActionButton
                      name="manage_ticket"
                      input={{
                        ticket_id_input: r.id,
                        status_input: r.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE',
                      }}
                    >
                      {r.status === 'ACTIVE' ? 'Revoke' : 'Reactivate'}
                    </ActionButton>
                    <a className="text-link" href={`/verify/${r.token}`}>
                      Verify ↗
                    </a>
                    <button
                      className="button secondary"
                      disabled={pending}
                      onClick={() =>
                        start(async () => setResult(await resendPassAccess(String(r.id))))
                      }
                    >
                      Resend access link
                    </button>
                    <a className="text-link" href={`/admin/coins?user=${r.user_id}`}>
                      View activity ↗
                    </a>
                  </td>
                )}
                {table === 'questions' && (
                  <td>
                    <div className="admin-actions">
                      {['APPROVED', 'REJECTED', 'HIGHLIGHTED'].map((s) => (
                        <button
                          key={s}
                          className="button secondary"
                          disabled={pending}
                          onClick={() =>
                            start(async () =>
                              setResult(await saveRecord('questions', String(r.id), { status: s })),
                            )
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
                {table === 'promo_codes' && (
                  <td>
                    <div className="admin-actions">
                      <button
                        className="button secondary"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(String(r.code));
                            setResult({ message: 'Code copied' });
                          } catch {
                            setResult({
                              error: 'Clipboard unavailable. Select and copy the code.',
                            });
                          }
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className="button secondary"
                        disabled={pending}
                        onClick={() =>
                          start(async () =>
                            setResult(
                              await saveRecord('promo_codes', String(r.id), { active: !r.active }),
                            ),
                          )
                        }
                      >
                        {r.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                )}
                {table === 'certificates' && (
                  <td>
                    <ActionButton
                      name="manage_certificate"
                      input={{
                        user_id_input: r.user_id,
                        status_input: r.status === 'ISSUED' ? 'REVOKED' : 'ISSUED',
                      }}
                    >
                      {r.status === 'ISSUED' ? 'Revoke' : 'Issue'}
                    </ActionButton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty">
            <p>No records match this view.</p>
          </div>
        )}
      </div>
    </>
  );
}
export function RecordEditor({
  table,
  rows,
  template,
}: {
  table: string;
  rows: Record<string, unknown>[];
  template: Record<string, unknown>;
}) {
  const [id, setId] = useState('');
  const [value, setValue] = useState(JSON.stringify(template, null, 2));
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const key = table === 'site_settings' ? 'key' : 'id';
  return (
    <form
      className="admin-editor"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          try {
            setResult(await saveRecord(table, id, JSON.parse(value)));
          } catch {
            setResult({ error: 'Invalid JSON. Check quotes, commas and brackets.' });
          }
        });
      }}
    >
      <h2>Content editor</h2>
      <p className="form-note" style={{ marginBottom: 20 }}>
        Choose an existing record or create a new one. Changes appear on public pages after saving.
      </p>
      <label className="field">
        Record
        <select
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            const row = rows.find((r) => r[key] === e.target.value);
            setValue(
              JSON.stringify(
                row
                  ? Object.fromEntries(Object.keys(template).map((k) => [k, row[k] ?? template[k]]))
                  : template,
                null,
                2,
              ),
            );
            setResult(null);
          }}
        >
          <option value="">Create new record</option>
          {rows.map((r) => (
            <option key={String(r[key])} value={String(r[key])}>
              {String(r.name || r.title || r.key || r.id)}
            </option>
          ))}
        </select>
      </label>
      {table === 'site_settings' && (
        <label className="field">
          Setting key
          <input value={id} onChange={(e) => setId(e.target.value)} required />
        </label>
      )}
      <label className="field">
        Fields (JSON)
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          spellCheck={false}
        />
      </label>
      <div className="admin-actions">
        <button className="button" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes ↗'}
        </button>
        {id && (
          <button
            type="button"
            className="button secondary"
            disabled={pending}
            onClick={() => {
              if (window.confirm('Delete this record? This cannot be undone.'))
                start(async () => setResult(await saveRecord(table, id, {}, true)));
            }}
          >
            Delete record
          </button>
        )}
      </div>
      <Result result={result} />
    </form>
  );
}
export function PromoGenerator() {
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
            await runAction('generate_promos', {
              count_input: f.get('count'),
              type_input: f.get('type'),
              max_uses_input: f.get('uses'),
            }),
          ),
        );
      }}
    >
      <h2>Create invitations</h2>
      <div className="form-grid">
        <label className="field">
          Number of codes
          <input name="count" type="number" min={1} max={500} defaultValue={100} required />
        </label>
        <label className="field">
          Uses per code
          <input name="uses" type="number" min={1} max={10000} defaultValue={1} required />
        </label>
      </div>
      <label className="field">
        Pass type
        <select name="type">
          {[
            'GENERAL',
            'GUEST',
            'PARTICIPANT',
            'STARTUP_BATTLE',
            'HACKATHON',
            'JAS_STARTUPER',
            'FIFA',
            'SPEAKER',
            'PARTNER',
            'ORGANIZER',
            'VIP_GUEST',
          ].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Generating…' : 'Generate invitation codes ↗'}
      </button>
      <Result result={result} />
      <p className="form-note">A pass type does not grant staff account permissions.</p>
    </form>
  );
}
export function CoinAdjustment() {
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
            await runAction('adjust_coins', {
              user_id_input: f.get('user'),
              amount_input: f.get('amount'),
              reason_input: f.get('reason'),
            }),
          ),
        );
      }}
    >
      <h2>Adjust Digital Coins</h2>
      <label className="field">
        Participant user ID
        <input name="user" required placeholder="UUID from participant records" />
      </label>
      <label className="field">
        Amount (negative to deduct)
        <input name="amount" type="number" min={-10000} max={10000} required />
      </label>
      <label className="field">
        Reason
        <textarea name="reason" required minLength={3} maxLength={500} />
      </label>
      <button className="button" disabled={pending}>
        Record adjustment ↗
      </button>
      <Result result={result} />
    </form>
  );
}
export function AssetUploader() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="admin-editor"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => setResult(await uploadAsset(f)));
      }}
    >
      <h2>Upload image</h2>
      <label className="field">
        JPG, PNG or WebP · up to 5 MB
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
      </label>
      <button className="button secondary" disabled={pending}>
        {pending ? 'Uploading…' : 'Upload to media library ↗'}
      </button>
      <Result result={result} />
      <p className="form-note">
        Copy the returned URL into the photo or logo field. Upload only images cleared for
        publication.
      </p>
    </form>
  );
}
