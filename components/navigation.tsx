'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { dictionaries, type Locale } from '@/locales';
export function Navbar({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = dictionaries[lang];
  const links = [
    [t.program, '/program'],
    [t.apta, '/digital-apta'],
    [t.speakers, '/speakers'],
    [t.battles, '/#battles'],
    [t.zones, '/zones'],
    [t.partners, '/#partners'],
    [t.about, '/#about'],
  ];
  return (
    <header className="navbar">
      <Link href="/" aria-label="Digital NIS Forum home" className="brand">
        <img src="/logo-mark.svg" width="37" height="37" alt="" />
        <span>
          DIGITAL
          <br />
          NIS FORUM<small>DIGITAL UNITES</small>
        </span>
      </Link>
      <nav className={open ? 'navlinks open' : 'navlinks'} aria-label="Main navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <select
          aria-label="Language"
          value={lang}
          onChange={(e) => {
            document.cookie = `locale=${e.target.value};path=/;max-age=31536000;samesite=lax`;
            router.refresh();
          }}
        >
          <option value="kz">ҚАЗ</option>
          <option value="ru">РУС</option>
          <option value="en">ENG</option>
        </select>
        <Link className="nav-pass" href="/dashboard/pass">
          {t.pass}
        </Link>
        <Link className="nav-apply" href="/apply">
          {t.apply}
          <ArrowUpRight size={14} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <Link href="/" className="brand">
          <img src="/logo-mark.svg" width="44" height="44" alt="" />
          <span>
            DIGITAL
            <br />
            NIS FORUM
          </span>
        </Link>
        <p>Different minds. One digital future.</p>
        <span className="eyebrow">19.09.2026</span>
      </div>
      <div className="footer-links">
        {[
          ['Program', '/program'],
          ['Digital Apta', '/digital-apta'],
          ['Speakers', '/speakers'],
          ['Apply', '/apply'],
          ['My pass', '/dashboard/pass'],
          ['Privacy', '/privacy'],
          ['Rules', '/rules'],
          ['Contact', '/contact'],
        ].map(([n, h]) => (
          <Link key={h} href={h}>
            {n}
          </Link>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 DIGITAL NIS FORUM</span>
        <span>CONNECT. BUILD. SHARE. UNITE.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
