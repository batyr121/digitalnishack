import { ImageResponse } from 'next/og';
export const runtime = 'nodejs';
export const alt = 'DIGITAL NIS FORUM 2026 — DIGITAL UNITES';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#070908',
        color: '#f0f2eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 75,
      }}
    >
      <div style={{ fontSize: 17, letterSpacing: 5, color: '#bcf75a', marginBottom: 35 }}>
        19 SEPTEMBER 2026 · KAZAKHSTAN
      </div>
      <div
        style={{
          fontSize: 106,
          lineHeight: 0.94,
          letterSpacing: -7,
          fontWeight: 800,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <span>DIGITAL</span>
        <span>NIS FORUM 2026</span>
      </div>
      <div style={{ fontSize: 33, letterSpacing: 10, color: '#bcf75a', marginTop: 40 }}>
        DIGITAL UNITES
      </div>
    </div>,
    size,
  );
}
