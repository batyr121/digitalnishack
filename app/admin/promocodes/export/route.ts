import { requireUser } from '@/lib/supabase';
export async function GET() {
  const { client } = await requireUser(true);
  const { data, error } = await client
    .from('promo_codes')
    .select('code,name,type,max_uses,used_count,expires_at,active')
    .order('created_at', { ascending: false });
  if (error) return new Response('Export unavailable', { status: 503 });
  const headers = ['code', 'name', 'type', 'max_uses', 'used_count', 'expires_at', 'active'];
  const safe = (value: unknown) => {
    let s = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return new Response(
    '\uFEFF' +
      [
        headers.join(','),
        ...(data ?? []).map((r) => headers.map((k) => safe(r[k as keyof typeof r])).join(',')),
      ].join('\r\n'),
    {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dnf-invitations.csv"',
        'Cache-Control': 'no-store',
      },
    },
  );
}
