import { requireUser } from '@/lib/supabase';
import { PageIntro } from '@/components/ui';
import { ActionButton } from '@/components/forms';
export const metadata = { title: 'Verify pass', robots: { index: false, follow: false } };
export default async function Verify({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { client } = await requireUser(true);
  const { data, error } = await client.rpc('inspect_ticket', { ticket_token: token });
  return (
    <div className="container page-body">
      <PageIntro
        label="ORGANIZER VERIFICATION"
        title={error ? 'Unable to verify' : data?.message || 'INVALID PASS'}
      />
      {data?.valid && (
        <>
          <p>
            {data.name} · {data.role} · {data.type}
          </p>
          <ActionButton name="scan_ticket" input={{ ticket_token: token, event_id_input: null }}>
            Check in
          </ActionButton>
        </>
      )}
    </div>
  );
}
