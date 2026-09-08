'use client';
import { useEffect, useRef, useState } from 'react';
import { awardCoinsByTicketToken, runAction, type ActionResult } from '@/lib/actions';
import { Result } from './forms';
export function QRScanner({ events }: { events: { id: string; title: string }[] }) {
  const [event, setEvent] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [coinResult, setCoinResult] = useState<ActionResult | null>(null);
  const [inspection, setInspection] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const scanner = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const scanLock = useRef(false);
  const readableMessage = (value: unknown) =>
    String(value)
      .replace('VALID PASS', 'Пропуск действителен')
      .replace('ALREADY CHECKED IN', 'Уже отмечен')
      .replace('INVALID PASS', 'Пропуск недействителен')
      .replace('Coin adjustment recorded', 'Баллы начислены')
      .replace('CHECKED IN', 'Отмечено');
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
    setCoinResult(null);
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
        error: 'Камера недоступна. Откройте сайт через HTTPS или вставьте токен вручную.',
      });
    }
  };
  return (
    <>
      <label className="field">
        Режим сканера
        <select
          value={event}
          onChange={(e) => {
            setEvent(e.target.value);
            setInspection(null);
            setResult(null);
          }}
        >
          <option value="">Вход на форум</option>
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
          Включить камеру ↗
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
              Сканировать дальше
            </button>
            <button
              className="button secondary"
              onClick={async () => {
                await scanner.current?.stop();
                setRunning(false);
              }}
            >
              Остановить камеру
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
          Или вставьте QR / токен пропуска
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            autoComplete="off"
          />
        </label>
        <button className="button secondary" disabled={busy}>
          {busy ? 'Проверяем…' : 'Проверить пропуск'}
        </button>
      </form>
      <Result result={result} />
      {inspection && (
        <div className="scanner-result">
          <strong>
            {inspection.valid ? '✓' : '✕'} {readableMessage(inspection.message)}
          </strong>
          {!!inspection.valid && (
            <>
              <p>
                {String(inspection.name)} · {String(inspection.role)} · {String(inspection.type)}
              </p>
              {!!inspection.checked_in_at && (
                <p>
                  Уже входил: {new Date(String(inspection.checked_in_at)).toLocaleString()}
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
                Отметить {event ? 'на событии' : 'на входе'} ↗
              </button>
              <form
                className="form-card"
                style={{ marginTop: 20 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  setBusy(true);
                  void awardCoinsByTicketToken(
                    token,
                    String(f.get('amount')),
                    String(f.get('reason')),
                  ).then((r) => {
                    setCoinResult(r);
                    setBusy(false);
                  });
                }}
              >
                <h2>Начислить баллы</h2>
                <div className="form-grid">
                  <label className="field">
                    Баллы
                    <input name="amount" type="number" defaultValue={50} min={-10000} max={10000} />
                  </label>
                  <label className="field">
                    Причина
                    <input name="reason" defaultValue="Активность на форуме" maxLength={500} />
                  </label>
                </div>
                <button className="button secondary" disabled={busy}>
                  {busy ? 'Сохраняем…' : 'Начислить баллы'}
                </button>
                <Result result={coinResult} />
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
