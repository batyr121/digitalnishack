'use client';
import { useEffect, useRef, useState } from 'react';
import { runAction, type ActionResult } from '@/lib/actions';
import { Result } from './forms';
export function QRScanner({ events }: { events: { id: string; title: string }[] }) {
  const [event, setEvent] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [inspection, setInspection] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const scanner = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const scanLock = useRef(false);
  useEffect(
    () => () => {
      const s = scanner.current;
      if (s?.isScanning) void s.stop().catch(() => {});
    },
    [],
  );
  const inspect = async (raw: string) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setBusy(true);
    setInspection(null);
    const normalized = raw
      .trim()
      .replace(/^dnf:\/\/ticket\//, '')
      .replace(/^https?:\/\/[^/]+\/verify\//, '');
    setToken(normalized);
    const r = await runAction('inspect_ticket', { ticket_token: normalized });
    setResult(r);
    if (!r.error) setInspection(r.data as Record<string, unknown>);
    setBusy(false);
    scanLock.current = false;
  };
  const start = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const s = new Html5Qrcode('qr-camera');
      scanner.current = s;
      await s.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        async (text) => {
          if (s.isScanning) {
            s.pause(true);
            await inspect(text);
          }
        },
        () => {},
      );
      setRunning(true);
    } catch {
      setResult({
        error: 'Camera unavailable. Allow camera access over HTTPS, or paste the pass token below.',
      });
    }
  };
  return (
    <>
      <label className="field">
        Scanner mode
        <select
          value={event}
          onChange={(e) => {
            setEvent(e.target.value);
            setInspection(null);
            setResult(null);
          }}
        >
          <option value="">GENERAL ENTRY</option>
          {events.map((e) => (
            <option value={e.id} key={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>
      <div id="qr-camera" className="scanner" />
      <div className="admin-actions">
        <button className="button" onClick={start} disabled={running}>
          Start camera ↗
        </button>
        {running && (
          <>
            <button
              className="button secondary"
              onClick={() => {
                scanner.current?.resume();
                setInspection(null);
                setResult(null);
              }}
            >
              Scan next
            </button>
            <button
              className="button secondary"
              onClick={async () => {
                await scanner.current?.stop();
                setRunning(false);
              }}
            >
              Stop camera
            </button>
          </>
        )}
      </div>
      <form
        style={{ marginTop: 25 }}
        onSubmit={(e) => {
          e.preventDefault();
          void inspect(token);
        }}
      >
        <label className="field">
          Or paste QR content / secure token
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            autoComplete="off"
          />
        </label>
        <button className="button secondary" disabled={busy}>
          {busy ? 'Checking…' : 'Verify pass'}
        </button>
      </form>
      <Result result={result} />
      {inspection && (
        <div className="scanner-result">
          <strong>
            {inspection.valid ? '✓' : '✕'} {String(inspection.message)}
          </strong>
          {!!inspection.valid && (
            <>
              <p>
                {String(inspection.name)} · {String(inspection.role)} · {String(inspection.type)}
              </p>
              {!!inspection.checked_in_at && (
                <p>
                  Previous check-in: {new Date(String(inspection.checked_in_at)).toLocaleString()}
                </p>
              )}
              <button
                style={{ marginTop: 20 }}
                className="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setResult(
                    await runAction('scan_ticket', {
                      ticket_token: token,
                      event_id_input: event || null,
                    }),
                  );
                  setInspection(null);
                  setBusy(false);
                }}
              >
                Check in {event ? 'to session' : 'to forum'} ↗
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
