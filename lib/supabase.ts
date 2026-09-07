import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const configured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export async function db() {
  if (!configured())
    throw new Error(
      'Registration is not open yet. The organizers are connecting the event platform. Please check back soon.',
    );
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) => jar.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}
export async function requireUser(admin = false) {
  if (!configured()) redirect('/login?notice=setup');
  const client = await db();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await client.from('profiles').select('*').eq('id', user.id).single();
  if (admin && !['ADMIN', 'ORGANIZER'].includes(profile?.role))
    redirect('/dashboard?notice=forbidden');
  return { client, user, profile };
}
export async function publicRows(table: string) {
  if (!configured()) return null;
  const client = await db();
  const { data, error } = await client.from(table).select('*');
  if (error) throw new Error('Event information is temporarily unavailable.');
  if (table === 'events') {
    const { data: availability, error: capacityError } = await client.rpc('event_availability');
    if (capacityError) throw new Error('Event availability is temporarily unavailable.');
    return data.map((e) => ({
      ...e,
      available: availability?.find((a: { event_id: string }) => a.event_id === e.id)?.available,
    }));
  }
  return data;
}
