import { notFound } from 'next/navigation';
import { db, configured } from '@/lib/supabase';
import { QRCodeCard, PrintButton } from '@/components/pass';
import { eventConfig } from '@/lib/config';
export const metadata = {
  title: 'Certificate verification',
  robots: { index: false, follow: false },
};
export default async function Certificate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !configured()) notFound();
  const client = await db();
  const { data, error } = await client.rpc('verify_certificate', { certificate_id: id });
  if (error || !data) notFound();
  return (
    <div className="container page-body">
      <article className="certificate">
        <span className="eyebrow" style={{ justifyContent: 'center', color: '#465d33' }}>
          DIGITAL UNITES
        </span>
        <h1>DIGITAL NIS FORUM 2026</h1>
        <p>Certificate of Participation</p>
        <p style={{ marginTop: 30 }}>This certificate is awarded to</p>
        <h2>{data.recipient_name}</h2>
        <p>
          for active participation in
          <br />
          DIGITAL NIS FORUM 2026 and DIGITAL APTA.
        </p>
        <p style={{ marginTop: 30 }}>19 September 2026</p>
        <QRCodeCard value={`${eventConfig.siteUrl}/certificate/${id}`} size={110} />
        <small>VERIFIED · {id}</small>
        <p style={{ fontSize: 11, marginTop: 25 }}>Organizers / signatures to be confirmed</p>
      </article>
      <PrintButton />
    </div>
  );
}
