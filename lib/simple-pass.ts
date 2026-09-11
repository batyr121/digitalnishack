import 'server-only';
import { cookies } from 'next/headers';

const cookieName = 'dnf_ticket_token';

export async function getSimpleTicketToken() {
  const jar = await cookies();
  return jar.get(cookieName)?.value || null;
}

export async function setSimpleTicketToken(token: string) {
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 120,
  });
}

export async function clearSimpleTicketToken() {
  const jar = await cookies();
  jar.delete(cookieName);
}
