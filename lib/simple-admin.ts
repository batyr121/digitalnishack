import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const cookieName = 'dnf_admin_access';

export function adminCode() {
  return process.env.ADMIN_PASSWORD || process.env.QUICK_ADMIN_CODE || 'DNF-ADMIN-2026';
}

export async function hasSimpleAdminAccess() {
  const jar = await cookies();
  return jar.get(cookieName)?.value === adminCode();
}

export async function requireSimpleAdminAccess() {
  if (!(await hasSimpleAdminAccess())) redirect('/admin-login');
}

export async function setSimpleAdminAccess() {
  const jar = await cookies();
  jar.set(cookieName, adminCode(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSimpleAdminAccess() {
  const jar = await cookies();
  jar.delete(cookieName);
}
