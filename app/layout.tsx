import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
import { Navbar, Footer } from '@/components/navigation';
import { locale } from '@/lib/locale';
import { eventConfig } from '@/lib/config';
export const metadata: Metadata = {
  metadataBase: new URL(eventConfig.siteUrl),
  title: { default: 'DIGITAL NIS FORUM 2026 — DIGITAL UNITES', template: '%s · DIGITAL NIS FORUM' },
  description: 'Technology, startups, education and innovation. DIGITAL NIS FORUM 2026.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'DIGITAL NIS FORUM 2026 — DIGITAL UNITES',
    description: '12–18 SEP · DIGITAL APTA. 19 SEP · THE FORUM.',
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: { card: 'summary_large_image' },
};
export default async function Layout({ children }: { children: React.ReactNode }) {
  const { lang } = await locale();
  return (
    <html lang={lang === 'kz' ? 'kk' : lang}>
      <body id="top">
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Navbar lang={lang} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
