# DIGITAL NIS FORUM 2026

A free technology forum platform for Nazarbayev Intellectual School. **DIGITAL UNITES.** Digital Apta: 12–18 September. Main forum: 19 September 2026, UTC+5. Venue and official contacts remain TBA.

The repository includes the public website, passwordless authentication, applications, invitation activation, Digital Passes, staff QR scanning, event registration/waitlists, attendance, Digital Coins, achievements, verifiable certificates and organizer content management. No payments, cryptocurrency, fabricated speakers or sponsors.

## Stack and architecture

Next.js App Router, React, TypeScript, Tailwind CSS 4, Framer Motion, Supabase Auth/PostgreSQL/Storage. Public pages and protected workspaces render on the server. Forms, filters, QR display, camera scanning and editors are client components. Mutations use Server Actions and permission-checked PostgreSQL functions. Public data is read through RLS, never through a service-role key.

- `app/`: public pages, dashboard, admin, auth callback, certificate verification and SEO.
- `components/`: navigation, design system, forms, schedule, passes, scanner, tables and editors.
- `lib/config.ts`: canonical event configuration and announced program, also used by the seed generator.
- `locales/`: English, Russian and Kazakh interface dictionaries. Language preference persists in a cookie. Editorial program copy and organizer-entered content currently use English; additional localized CMS content needs editorial translations.
- `supabase/migrations/`: relational schema, RLS, secure RPCs, audit and reward triggers.
- `tests/`: browser/accessibility tests and PostgreSQL integration scenarios.

## Environment

Copy `.env.example` to `.env.local`, then fill in:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

The publishable key is designed for browsers and is protected by RLS. No service-role key is needed. Never expose a Supabase service-role key in a `NEXT_PUBLIC_` variable. On deployment, set the canonical HTTPS URL before building.

Without Supabase configuration, public pages render the announced program. Account actions return an explicit unavailable message; no pass, points, application or QR is fabricated.

## Supabase setup

1. Create a Supabase project.
2. Run all migration files in timestamp order using the Supabase SQL editor, or run `supabase link --project-ref YOUR_REF` followed by `supabase db push` with the CLI.
3. Run `supabase/seed.sql` in the SQL editor. This inserts only announced events, locked speaker slots, competition definitions, zones, reward rules and achievements. Seed IDs are stable and inserts are idempotent.
4. In Auth → URL Configuration, set Site URL and allow `http://localhost:3000/auth/callback` and your production `/auth/callback` URL.
5. In Auth → Email Templates → Magic Link, use `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` as the confirmation link. This server-side token-hash flow supports opening a link on another device and resending access links from the staff panel. Keep the `/auth/callback` code-exchange route for same-browser PKCE flows. Enable email authentication and configure a production SMTP provider. Supabase delivers sign-in emails and enforces its configured authentication rate limits.
6. Verify the `forum-assets` public Storage bucket and policies were created. Only staff can upload images.
7. Confirm the organizing institution’s privacy policy, contact information, venue and arrangements for minors before opening applications. Set `registrationEnabled` to `false` in `site_settings` until these are ready.

Database schema contains profiles, applications, promo codes/redemptions, tickets/scans, events/registrations/attendance, speakers, panel questions, competitions/entries/teams, zones, partners, reward rules/transactions, achievements, certificates, audit logs and settings.

## Development

Requires Node.js 22.18+.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The project uses Webpack because the local sandbox disallows subprocess ports used by Turbopack. You may switch to Turbopack in an unrestricted environment.

```sh
npm run typecheck
npm run build
npm start
```

Fonts are bundled locally. Logo variants are in `public/`. The hero is an original SVG construction, not a remote image or copied event logo.

## Migrations and seed

Apply all three migration files in timestamp order, then the seed. Never rerun migrations manually against an already-migrated database. To regenerate the seed after changing the canonical program:

```sh
npm run seed
```

Re-running the seed preserves existing content inserts but resets event-to-reward-rule mappings; use it for initial provisioning, not as a routine production content update.

## First administrator

Sign in once to create your profile. In the trusted Supabase SQL editor:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'amantaibatyrkhan11@gmail.com';
```

Visit `/admin`. Only a trusted database administrator can change account roles. Organizer invitation **pass types do not grant organizer account permissions**. Never add client-side profile role update permissions.

## Invitations

In `/admin/promocodes`, generate 1–500 secure invitation codes, select a pass type and set uses per code. For 100 guest invitations, enter `100`, `GUEST`, `1`. Export the generated records with **Export CSV**. The editor can set expiration, name, notes and active state. Codes already referenced by redemptions cannot be deleted; disable them instead.

A participant signs in, completes their application details and enters the code at `/activate`. Activation runs in one database transaction with a row lock, usage-limit validation and duplicate protection. Five attempts are allowed per account per 15-minute window; failed attempts are committed, not rolled back. A user with an existing pass does not consume another invitation.

## Application approval and Digital Pass

`/apply` submits a verified-email application. `/admin/applications` supports individual and bulk approval, waitlisting and rejection. Approval creates a single pass per user. The user opens `/dashboard/pass` and can expand the QR fullscreen. Approval is idempotent. Changing an approved application to another status does not silently revoke an already-issued pass; use explicit ticket revocation in `/admin/tickets`.

QR values use `dnf://ticket/<64-character-random-token>`, with 256 bits of randomness from PostgreSQL `pgcrypto`. They contain no PII or sequential identifier. Protect them as bearer credentials. Pass inspection requires a staff session even when using `/verify/<token>`.

## Check-in and attendance

Open `/admin/check-in` on an HTTPS phone or tablet (localhost is also permitted by browsers). Grant camera permission. Select **GENERAL ENTRY** or a session, start the camera, scan, inspect the participant and confirm check-in. **Scan next** resumes the paused camera. Manual token entry is available when the camera is unavailable.

General admission returns the previous check-in timestamp on repeats. Session attendance has a unique `(user_id, event_id)` constraint and unique reward source key. Repeated scans never award points twice. Each successful scan records the staff member and timestamp. Physical camera operation must be tested with event devices before opening doors.

## Schedules and capacity

Users need an active pass to reserve a session. Event capacity is protected with a database row lock. When capacity is reached, the same action adds the user to a waitlist. A repeated reservation returns the existing status. Session scanning changes registration to ATTENDED. This version does not provide cancellation or automatic waitlist promotion; organizers manage attendance through the scanner and capacity through the event editor.

## Digital Coins and achievements

`/admin/coins` provides transaction history, reward rules and manual signed adjustments with a required reason. Registration and admission use their named rules. Events may link to `reward_rule_key`; editing that rule updates the linked event award amount. With no linked rule, the event’s `coins` value is used. Existing transactions are immutable; rule changes affect future activity only.

Selecting a competition finalist awards its configured participation reward once. Moving a finalist to FINAL or WINNER does not award it again. Removing finalist status does not silently erase already-issued points; use a reasoned negative adjustment if necessary. Every adjustment is audited with actor, timestamp, amount and reason.

## Certificates

The `certificateThreshold` setting defaults to 400. New rewards and target changes recalculate eligibility. Certificates are issued automatically and have random UUIDs. `/certificate/[id]` verifies an issued certificate without exposing the user’s email. The name is deliberately public to anyone holding that verification link. Revoked certificates return not found. Lowering points after issuance does not automatically revoke a certificate; use the explicit revoke action. Revoked certificates are not reissued by ordinary reward recalculation.

Use **Print / Save as PDF** for a print-specific layout. Official signatures remain placeholders until approved by the organizing team.

## Content and competitions

The organizer panel provides searchable records and schema-shaped JSON editors. These are functional staff tools; they do not impersonate a polished CMS WYSIWYG editor. Speakers have secret/public state, profile details, images and session metadata. Secret speaker rows cannot be fetched by ordinary users. Upload cleared public media using the media uploader, then paste the returned HTTPS URL into the photo/logo field. Do not upload unreleased private portraits to the public bucket.

Competition applications appear in `/admin/competitions`. Select FINALIST, FINAL or WINNER, assign a place and then set the parent competition’s `published` flag. Publication requires this explicit action; the calendar alone does not reveal private results. FIFA rounds use `bracket: [{"name":"SEMIFINALS","matches":["Team A 2 — 1 Team B"]}]` and render on `/fifa`.

`/admin/content` manages zones and allowed settings, including `faq` (question/answer pairs), `stats` (value/label pairs), announcements and contacts. `/admin/partners` manages organizer and partner categories. No sponsor is seeded.

## Verification

```sh
npm run typecheck
npm run build
npm run test:db
npm test
```

Database tests run the real migrations/functions/RLS in PGlite (PostgreSQL WASM) with explicitly test-only Auth/Storage and randomness adapters. They cover all eight requested core database flows, repeat scans/rewards, secret publication, unauthorized access, invitation limits and capacity waitlisting. They do not replace a full staging Supabase test of SMTP, PostgREST and real concurrent network requests.

Browser tests use installed Google Chrome via Playwright. Change the channel or install Playwright Chromium when Chrome is unavailable. Tests cover public routes, program filters, language persistence, mobile navigation, protected-route redirects, honest disconnected-service errors and WCAG checks. Screenshots are written to `test-results/`.

## Deployment and launch boundary

Deploy to a Node-compatible Next.js host such as Vercel. Apply migrations and seed to your own Supabase project first. Set environment variables, configure SMTP and Auth redirects, provision the first admin and use HTTPS. No external project has been provisioned or deployed by this repository creation.

Before public launch, validate all flows against the real Supabase project, review permissions with organizer accounts, load-test peak registration/check-in traffic, test cameras, publish final event policies and translations, and measure production Lighthouse scores. Lighthouse targets are goals, not claimed measured results. Admin tables currently read up to 2,000 rows; use database reporting/pagination work before scaling beyond that. Pass access links can be resent through Supabase email authentication; delivery requires configured SMTP. Full trilingual editorial/CMS content still needs editorial translations.
