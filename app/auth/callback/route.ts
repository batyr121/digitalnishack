import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    try {
      const client = await db();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL('/dashboard', url.origin));
    } catch {}
  }
  return NextResponse.redirect(new URL('/login?error=auth', url.origin));
}
