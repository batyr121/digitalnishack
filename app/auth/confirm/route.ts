import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  if (tokenHash && url.searchParams.get('type') === 'email') {
    try {
      const client = await db();
      const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
      if (!error) return NextResponse.redirect(new URL('/dashboard', url.origin));
    } catch {}
  }
  return NextResponse.redirect(new URL('/login?error=auth', url.origin));
}
