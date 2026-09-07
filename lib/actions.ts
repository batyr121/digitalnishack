'use server';
import { z } from 'zod';
import { db } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { eventConfig } from '@/lib/config';
export type ActionResult = { message?: string; error?: string; data?: unknown };
const adminEmail = 'amantaibatyrkhan11@gmail.com';
const uuid = z.string().uuid();
const schemas: Record<string, z.ZodType> = {
  apply_forum: z.object({
    full_name_input: z.string().trim().min(2).max(120),
    organization_input: z.string().trim().min(2).max(180),
    participant_role_input: z.enum([
      'Student',
      'Teacher',
      'Startup Founder',
      'Developer',
      'Guest',
      'Partner',
      'Other',
    ]),
    grade_input: z.string().max(30).nullable(),
  }),
  activate_promo: z.object({ invitation_code: z.string().trim().min(6).max(50) }),
  register_event: z.object({ event_id_input: uuid }),
  review_application: z.object({
    application_id: uuid,
    new_status: z.enum(['APPROVED', 'WAITLIST', 'REJECTED']),
  }),
  inspect_ticket: z.object({ ticket_token: z.string().regex(/^[a-f0-9]{64}$/) }),
  scan_ticket: z.object({
    ticket_token: z.string().regex(/^[a-f0-9]{64}$/),
    event_id_input: uuid.nullable(),
  }),
  generate_promos: z.object({
    count_input: z.coerce.number().int().min(1).max(500),
    type_input: z.enum([
      'GENERAL',
      'GUEST',
      'PARTICIPANT',
      'STARTUP_BATTLE',
      'HACKATHON',
      'JAS_STARTUPER',
      'FIFA',
      'SPEAKER',
      'PARTNER',
      'ORGANIZER',
      'VIP_GUEST',
    ]),
    max_uses_input: z.coerce.number().int().min(1).max(10000),
  }),
  adjust_coins: z.object({
    user_id_input: uuid,
    amount_input: z.coerce.number().int().min(-10000).max(10000),
    reason_input: z.string().trim().min(3).max(500),
  }),
  manage_ticket: z.object({ ticket_id_input: uuid, status_input: z.enum(['ACTIVE', 'REVOKED']) }),
  manage_certificate: z.object({
    user_id_input: uuid,
    status_input: z.enum(['ISSUED', 'REVOKED']),
  }),
};
const userOperations = ['apply_forum', 'activate_promo', 'register_event'];
export async function runAction(name: string, input: unknown): Promise<ActionResult> {
  try {
    const schema = schemas[name];
    if (!schema) return { error: 'Unknown action' };
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join('. ') };
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { error: 'Please sign in to continue.' };
    if (!userOperations.includes(name)) {
      const { data: profile } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!['ADMIN', 'ORGANIZER'].includes(profile?.role)) return { error: 'Access denied' };
    }
    const { data, error } = await client.rpc(name, parsed.data);
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };
    revalidatePath('/', 'layout');
    return { message: data?.message || 'Saved', data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unable to complete this action' };
  }
}
export async function sendMagicLink(email: string): Promise<ActionResult> {
  try {
    const parsed = z.email().safeParse(email);
    if (!parsed.success) return { error: 'Enter a valid email address.' };
    const client = await db();
    const { error } = await client.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: `${eventConfig.siteUrl}/auth/callback` },
    });
    return error
      ? { error: error.message }
      : { message: 'Check your email for a secure sign-in link.' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sign-in unavailable' };
  }
}
export async function signInWithPassword(email: string, password: string): Promise<ActionResult> {
  try {
    const parsed = z
      .object({ email: z.email(), password: z.string().min(8).max(128) })
      .safeParse({ email, password });
    if (!parsed.success) return { error: 'Enter a valid email and a password with 8+ characters.' };
    const client = await db();
    const { error } = await client.auth.signInWithPassword(parsed.data);
    if (error) return { error: error.message };
    revalidatePath('/', 'layout');
    return {
      message:
        parsed.data.email.toLowerCase() === adminEmail
          ? 'Signed in. Open the admin panel.'
          : 'Signed in.',
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sign-in unavailable' };
  }
}
export async function signUpWithPassword(email: string, password: string): Promise<ActionResult> {
  try {
    const parsed = z
      .object({ email: z.email(), password: z.string().min(8).max(128) })
      .safeParse({ email, password });
    if (!parsed.success) return { error: 'Enter a valid email and a password with 8+ characters.' };
    const client = await db();
    const { error } = await client.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${eventConfig.siteUrl}/auth/callback` },
    });
    if (error) return { error: error.message };
    revalidatePath('/', 'layout');
    return {
      message:
        'Account created. If email confirmation is disabled in Supabase, you are signed in now.',
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sign-up unavailable' };
  }
}
export async function signOut() {
  const client = await db();
  await client.auth.signOut();
  revalidatePath('/', 'layout');
}
export async function askQuestion(body: string): Promise<ActionResult> {
  try {
    if (body.trim().length < 10 || body.length > 1000)
      return { error: 'Your question must contain 10–1,000 characters.' };
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { error: 'Sign in first' };
    const { error } = await client
      .from('questions')
      .insert({ user_id: user.id, body: body.trim() });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/questions');
    return { message: 'Question submitted for moderation.' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unable to submit' };
  }
}
const editable: Record<string, string[]> = {
  events: [
    'title',
    'description',
    'day',
    'time',
    'track',
    'location',
    'speaker_id',
    'capacity',
    'registration_required',
    'coins',
    'published',
    'reward_rule_key',
  ],
  speakers: [
    'secret',
    'kind',
    'name',
    'position',
    'company',
    'photo',
    'bio',
    'topic',
    'session',
    'social',
    'sort_order',
  ],
  competitions: ['slug', 'title', 'description', 'rules', 'judging', 'published', 'bracket'],
  competition_entries: [
    'name',
    'description',
    'logo',
    'founders',
    'category',
    'website',
    'pitch_time',
    'status',
    'place',
  ],
  zones: ['name', 'description', 'icon', 'sort_order'],
  partners: ['name', 'logo', 'website', 'type'],
  site_settings: ['value'],
  coin_rules: ['key', 'name', 'points', 'active'],
  promo_codes: ['code', 'name', 'type', 'max_uses', 'expires_at', 'active', 'notes'],
  questions: ['status'],
};
export async function saveRecord(
  table: string,
  id: string,
  values: unknown,
  remove = false,
): Promise<ActionResult> {
  try {
    if (!editable[table]) return { error: 'This collection cannot be edited' };
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { error: 'Sign in first' };
    const { data: p } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (!['ADMIN', 'ORGANIZER'].includes(p?.role)) return { error: 'Access denied' };
    if (typeof values !== 'object' || values === null || Array.isArray(values))
      return { error: 'Expected an object' };
    const entries = Object.entries(values);
    if (entries.some(([k]) => !editable[table].includes(k))) return { error: 'Unsupported field' };
    if (JSON.stringify(values).length > 30000) return { error: 'Record is too large' };
    for (const [key, value] of entries) {
      if (['website', 'photo', 'logo'].includes(key) && value && !/^https:\/\//.test(String(value)))
        return { error: 'Asset and website URLs must use HTTPS' };
    }
    if (
      table === 'site_settings' &&
      id === 'certificateThreshold' &&
      (!Number.isInteger((values as { value: number }).value) ||
        (values as { value: number }).value < 1)
    )
      return { error: 'Certificate target must be a positive integer' };
    if (
      table === 'site_settings' &&
      ![
        'certificateThreshold',
        'registrationEnabled',
        'finalists_published',
        'faq',
        'stats',
        'announcement',
        'contacts',
      ].includes(id)
    )
      return { error: 'Unsupported setting' };
    const key = table === 'site_settings' ? 'key' : 'id';
    if (id && key === 'id' && !uuid.safeParse(id).success) return { error: 'Invalid record ID' };
    const payload = values as Record<string, unknown>;
    const query = remove
      ? client.from(table).delete().eq(key, id)
      : id
        ? table === 'site_settings'
          ? client.from(table).upsert({ key: id, ...payload })
          : client.from(table).update(payload).eq(key, id)
        : client.from(table).insert(payload);
    const { error } = await query;
    if (error) return { error: error.message };
    revalidatePath('/', 'layout');
    return { message: remove ? 'Record deleted' : 'Changes saved' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unable to save' };
  }
}
export async function enterCompetition(
  competitionId: string,
  name: string,
  description: string,
): Promise<ActionResult> {
  try {
    if (
      !uuid.safeParse(competitionId).success ||
      name.length < 2 ||
      name.length > 120 ||
      description.length < 20 ||
      description.length > 2000
    )
      return { error: 'Enter a project name and a description (20–2,000 characters).' };
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { error: 'Sign in first to submit your project.' };
    const { error } = await client
      .from('competition_entries')
      .insert({ competition_id: competitionId, user_id: user.id, name, description });
    if (error)
      return {
        error:
          error.code === '23505'
            ? 'You already submitted an application to this competition.'
            : error.message,
      };
    revalidatePath('/dashboard');
    return { message: 'Competition application received.' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unable to submit' };
  }
}
export async function uploadAsset(form: FormData): Promise<ActionResult> {
  try {
    const file = form.get('file');
    if (
      !(file instanceof File) ||
      file.size > 5242880 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
      return { error: 'Upload a JPG, PNG or WebP image under 5 MB.' };
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { error: 'Sign in first' };
    const { data: p } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (!['ADMIN', 'ORGANIZER'].includes(p?.role)) return { error: 'Access denied' };
    const path = `${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    const { error } = await client.storage.from('forum-assets').upload(path, file);
    if (error) return { error: error.message };
    return { message: client.storage.from('forum-assets').getPublicUrl(path).data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed' };
  }
}
export async function currentBalance(): Promise<number | null> {
  try {
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return null;
    const { data, error } = await client
      .from('coin_transactions')
      .select('amount')
      .eq('user_id', user.id);
    return error ? null : (data ?? []).reduce((n, r) => n + r.amount, 0);
  } catch {
    return null;
  }
}
export async function resendPassAccess(ticketId: string): Promise<ActionResult> {
  try {
    if (!uuid.safeParse(ticketId).success) return { error: 'Invalid pass ID' };
    const client = await db();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { error: 'Sign in first' };
    const { data: staff } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (!['ADMIN', 'ORGANIZER'].includes(staff?.role)) return { error: 'Access denied' };
    const { data: ticket } = await client
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();
    if (!ticket) return { error: 'Pass not found' };
    const { data: holder } = await client
      .from('profiles')
      .select('email')
      .eq('id', ticket.user_id)
      .single();
    if (!holder) return { error: 'Pass holder not found' };
    const { error } = await client.auth.signInWithOtp({
      email: holder.email,
      options: { shouldCreateUser: false, emailRedirectTo: `${eventConfig.siteUrl}/auth/callback` },
    });
    return error
      ? { error: error.message }
      : { message: 'A secure account access link was sent to the pass holder.' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unable to send' };
  }
}
