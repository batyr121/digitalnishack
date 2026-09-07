import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Lock } from 'lucide-react';
import Image from 'next/image';
export function Button({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? 'secondary' : ''}`} href={href}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function SectionHeader({
  number,
  label,
  title,
  href,
  link = 'Explore all',
}: {
  number: string;
  label: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">
          <span>{number} /</span> {label}
        </div>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function SecretSpeakerCard({
  index,
  panel = false,
  speaker,
}: {
  index: number;
  panel?: boolean;
  speaker?: Record<string, unknown>;
}) {
  const secret = !speaker || speaker.secret;
  return (
    <article className="speaker-card">
      <div className="speaker-portrait">
        {!secret && speaker.photo ? (
          <Image
            src={String(speaker.photo)}
            alt={String(speaker.name)}
            fill
            unoptimized
            sizes="(max-width:700px) 100vw,33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <>
            <div className="silhouette">
              <div />
              <i />
            </div>
            <div className="scanline" />
            <span className="secret-tag">
              <Lock size={11} /> IDENTITY LOCKED
            </span>
            <span className="portrait-no">0{index}</span>
          </>
        )}
      </div>
      <div className="speaker-info">
        <span className="eyebrow">
          {panel ? 'PANEL DISCUSSION' : 'KEYNOTE SPEAKER'} / 0{index}
        </span>
        <h3>
          {secret ? `${panel ? 'PANELIST' : 'SECRET SPEAKER'} 0${index}` : String(speaker.name)}
        </h3>
        <p>
          {secret ? 'A new perspective. Coming soon.' : `${speaker.position} · ${speaker.company}`}
        </p>
        <ArrowUpRight className="speaker-arrow" size={20} />
        {!secret && <p>{String(speaker.bio || '')}</p>}
      </div>
    </article>
  );
}
export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <span className="eyebrow">DIGITAL NIS FORUM</span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function StatsCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
export function PageIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-intro">
      <Link className="back" href="/">
        ← DIGITAL NIS FORUM
      </Link>
      <div className="eyebrow">
        <i className="live-dot" />
        {label}
      </div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
