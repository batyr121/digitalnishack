import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
// Auth/Storage fixtures only. Production migration uses Supabase Auth and pgcrypto.
await db.exec(
  `create role anon;create role authenticated;create schema auth;create schema storage;create schema extensions;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key,bucket_id text);alter table storage.objects enable row level security;create function extensions.gen_random_bytes(n integer) returns bytea language sql volatile as $$select decode(string_agg(replace(gen_random_uuid()::text,'-',''),''),'hex') from generate_series(1,(n+15)/16)$$;`,
);
const migration = readFileSync('supabase/migrations/202609070001_platform.sql', 'utf8').replace(
  'create extension if not exists pgcrypto with schema extensions;',
  '',
);
await db.exec(migration);
await db.exec(readFileSync('supabase/migrations/202609070002_rewards.sql', 'utf8'));
await db.exec(readFileSync('supabase/migrations/202609070003_capacity.sql', 'utf8'));
await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
await db.exec(
  `grant usage on schema public,auth to anon,authenticated;grant select,insert,update,delete on all tables in schema public to authenticated;grant select on all tables in schema public to anon;grant execute on function auth.uid() to anon,authenticated;`,
);
const ids = {
  admin: 'a0000000-0000-4000-8000-000000000001',
  user: 'b0000000-0000-4000-8000-000000000001',
  invite: 'b0000000-0000-4000-8000-000000000002',
  other: 'b0000000-0000-4000-8000-000000000003',
};
for (const [name, id] of Object.entries(ids))
  await db.query('insert into auth.users(id,email) values($1,$2)', [id, `${name}@example.test`]);
await db.query("update profiles set role='ADMIN' where id=$1", [ids.admin]);
async function as(name) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [ids[name] || '']);
  await db.exec(`set role ${name ? 'authenticated' : 'anon'}`);
}
async function rpc(name, args = []) {
  return (
    await db.query(`select ${name}(${args.map((_, i) => '$' + (i + 1)).join(',')}) as result`, args)
  ).rows[0].result;
}
async function fails(fn) {
  let failed = false;
  try {
    await fn();
  } catch {
    failed = true;
  }
  assert(failed, 'Expected authorization/validation failure');
}
await as('user');
await rpc('apply_forum', ['Test Participant', 'Test School', 'Student', '10']);
await rpc('apply_forum', ['Test Participant', 'Test School', 'Student', '10']);
assert.equal((await db.query('select count(*)::int n from coin_transactions')).rows[0].n, 1);
await fails(() => rpc('generate_promos', [100, 'GUEST', 1]));
await fails(() =>
  db.query("update profiles set role='ADMIN'").then(async () => {
    assert.equal((await db.query('select role from profiles')).rows[0].role, 'ADMIN');
  }),
);
await as('admin');
const app = (await db.query('select id from applications where user_id=$1', [ids.user])).rows[0].id;
await rpc('review_application', [app, 'APPROVED']);
await rpc('review_application', [app, 'APPROVED']);
let ticket = (await db.query('select * from tickets where user_id=$1', [ids.user])).rows[0];
assert.equal(ticket.token.length, 64);
assert.equal((await db.query('select count(*)::int n from tickets')).rows[0].n, 1);
console.log('PASS flow 1: application → approval → unique secure pass');
await rpc('generate_promos', [100, 'GUEST', 1]);
const code = (await db.query('select code from promo_codes limit 1')).rows[0].code;
assert.equal((await db.query('select count(*)::int n from promo_codes')).rows[0].n, 100);
console.log('PASS flow 6: bulk generation of 100 invitations');
await as('invite');
await rpc('apply_forum', ['Invited Person', 'Test School', 'Guest', null]);
const activation = await rpc('activate_promo', [code]);
assert(activation.message.includes('ACCESS GRANTED'));
assert((await rpc('activate_promo', [code])).error);
console.log('PASS flow 2: invitation activation and duplicate protection');
await as('other');
await rpc('apply_forum', ['Other Person', 'Test School', 'Guest', null]);
for (let i = 0; i < 5; i++) assert((await rpc('activate_promo', ['INVALID'])).error);
assert((await rpc('activate_promo', [code])).error.includes('Too many'));
assert.equal((await db.query('select count(*)::int n from tickets')).rows[0].n, 0);
assert.equal((await db.query('select count(*)::int n from speakers')).rows[0].n, 0);
console.log('PASS security: durable promo rate limit, own-ticket RLS and secret speakers');
await as('admin');
assert.equal((await rpc('inspect_ticket', [ticket.token])).valid, true);
assert.equal((await rpc('scan_ticket', [ticket.token, null])).message, 'CHECKED IN');
assert.equal((await rpc('scan_ticket', [ticket.token, null])).message, 'ALREADY CHECKED IN');
console.log('PASS flow 3: check-in and replay protection');
const event = '00000000-0000-4000-8000-000000000015';
await rpc('scan_ticket', [ticket.token, event]);
await rpc('scan_ticket', [ticket.token, event]);
assert.equal(
  (await db.query('select count(*)::int n from attendance where user_id=$1', [ids.user])).rows[0].n,
  1,
);
assert.equal(
  (
    await db.query(
      "select count(*)::int n from coin_transactions where user_id=$1 and source_key like 'event:%'",
      [ids.user],
    )
  ).rows[0].n,
  1,
);
console.log('PASS flow 4: attendance and exactly-once coin rewards');
await rpc('adjust_coins', [ids.user, 300, 'Test certificate threshold']);
const cert = (await db.query('select id from certificates where user_id=$1', [ids.user])).rows[0]
  .id;
await as('');
assert.equal((await rpc('verify_certificate', [cert])).recipient_name, 'Test Participant');
await fails(() => rpc('inspect_ticket', [ticket.token]));
console.log('PASS flow 5: certificate threshold and public verification');
await as('admin');
await db.query(
  "update speakers set secret=false,name='TEST PUBLISHED SPEAKER' where id='30000000-0000-4000-8000-000000000001'",
);
await as('');
assert.equal((await db.query('select name from speakers')).rows[0].name, 'TEST PUBLISHED SPEAKER');
console.log('PASS flow 7: secret speaker publication');
await as('user');
const competition = '10000000-0000-4000-8000-000000000001';
await db.query(
  'insert into competition_entries(competition_id,user_id,name,description) values($1,$2,$3,$4)',
  [competition, ids.user, 'TEST STARTUP', 'Test entry for integration verification'],
);
await as('admin');
await db.query("update competition_entries set status='FINALIST' where competition_id=$1", [
  competition,
]);
await as('');
assert.equal((await db.query('select count(*)::int n from competition_entries')).rows[0].n, 0);
await as('admin');
await db.query('update competitions set published=true where id=$1', [competition]);
await as('');
assert.equal((await db.query('select count(*)::int n from competition_entries')).rows[0].n, 1);
console.log('PASS flow 8: finalist selection and publication gating');
await as('admin');
const capacityEvent = '00000000-0000-4000-8000-000000000016';
await db.query('update events set capacity=1 where id=$1', [capacityEvent]);
await as('user');
assert((await rpc('register_event', [capacityEvent])).message.includes('schedule'));
await as('invite');
assert((await rpc('register_event', [capacityEvent])).message.includes('waitlist'));
await fails(() => rpc('award', [ids.invite, 999, 'Unauthorized', 'attack']));
console.log('PASS security: capacity waitlist and private reward function');
await db.close();
console.log(
  'Database integration checks passed. Test Auth/Storage are fixtures; live Supabase E2E remains required.',
);
