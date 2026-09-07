'use client';
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
export function QRCodeCard({ value, size = 220 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      marginSize={4}
      title="Secure verification QR code"
    />
  );
}
export function DigitalPass({
  name,
  role,
  ticket,
}: {
  name: string;
  role: string;
  ticket: { id: string; token: string; type: string; status: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const value = `dnf://ticket/${ticket.token}`;
  return (
    <>
      <article className="digital-pass">
        <header>
          <span>
            DIGITAL
            <br />
            NIS FORUM
          </span>
          <span>2026 ↗</span>
        </header>
        <p style={{ marginTop: 30 }}>DIGITAL PASS · {ticket.status}</p>
        <h2>{name}</h2>
        <p>
          {role} · {ticket.type}
        </p>
        <div className="qr">
          <QRCodeCard value={value} />
        </div>
        <p>19.09.2026</p>
        <p style={{ fontSize: 8, overflowWrap: 'anywhere', margin: '10px 0 22px' }}>
          ID {ticket.id}
        </p>
        <button className="button" onClick={() => dialog.current?.showModal()}>
          Show QR fullscreen ↗
        </button>
      </article>
      <dialog
        className="qr-dialog"
        ref={dialog}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <QRCodeCard value={value} size={450} />
        <p style={{ textAlign: 'center', color: '#222' }}>{name} · DIGITAL NIS FORUM</p>
        <button onClick={() => dialog.current?.close()}>Close QR</button>
      </dialog>
    </>
  );
}
export function PrintButton() {
  return (
    <button className="button no-print" onClick={() => window.print()}>
      Print / Save as PDF ↗
    </button>
  );
}
