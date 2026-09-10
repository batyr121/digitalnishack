import { writeFileSync } from 'node:fs';
import { events, competitions, zones } from '../lib/config.ts';
const sql = (s: unknown) =>
  s === null || s === undefined
    ? 'null'
    : typeof s === 'boolean' || typeof s === 'number'
      ? String(s)
      : "'" + String(s).replaceAll("'", "''") + "'";
let output = '-- Generated from lib/config.ts. No fabricated people or partners.\n';
output += events
  .map(
    (e) =>
      `insert into events(id,title,description,day,time,track,location,capacity,registration_required,coins) values(${[e.id, e.title, e.description, e.day, e.time, e.track, e.location, e.capacity, e.registration_required, e.coins].map(sql).join(',')}) on conflict(id) do nothing;`,
  )
  .join('\n');
output +=
  '\n' +
  competitions
    .map(
      (c, i) =>
        `insert into competitions(id,slug,title,description) values('10000000-0000-4000-8000-00000000000${i + 1}',${[c.slug, c.title, c.description].map(sql).join(',')}) on conflict(slug) do nothing;`,
    )
    .join('\n');
output +=
  '\n' +
  zones
    .map(
      (z, i) =>
        `insert into zones(id,name,description,icon,sort_order) values('20000000-0000-4000-8000-00000000000${i + 1}',${[z.name, z.description, z.icon, i].map(sql).join(',')}) on conflict(id) do nothing;`,
    )
    .join('\n');
for (let i = 1; i <= 6; i++)
  output += `\ninsert into speakers(id,secret,kind,name,sort_order) values('30000000-0000-4000-8000-00000000000${i}',true,'${i <= 3 ? 'KEYNOTE' : 'PANELIST'}','${i <= 3 ? 'SECRET SPEAKER' : 'PANELIST'} 0${i <= 3 ? i : i - 3}',${i}) on conflict(id) do nothing;`;
for (const [key, name, points] of [
  ['registration', 'Forum registration', 20],
  ['check_in', 'Forum check-in', 50],
  ['masterclass', 'Masterclass attendance', 50],
  ['speaker', 'Speaker session', 30],
  ['panel', 'Panel discussion', 40],
  ['startup_audience', 'Startup Battle audience', 30],
  ['hackathon', 'Hackathon participant', 100],
  ['startup_finalist', 'Startup Battle finalist', 150],
  ['jas_startuper', 'Startup Women participant', 100],
  ['fifa', 'FIFA Tournament 7–8 participant', 80],
  ['3d', '3D workshop', 50],
  ['special', 'Special activity', 20],
])
  output += `\ninsert into coin_rules(key,name,points) values(${[key, name, points].map(sql).join(',')}) on conflict(key) do nothing;`;
for (const [key, name, description] of [
  ['FIRST_STEP', 'FIRST STEP', 'Registration completed'],
  ['DIGITAL_EXPLORER', 'DIGITAL EXPLORER', 'Visit 3 sessions'],
  ['BUILDER', 'BUILDER', 'Attend a workshop'],
  ['NETWORKER', 'NETWORKER', 'Participate in the panel'],
  ['STARTUP_MIND', 'STARTUP MIND', 'Attend Startup Battle'],
  ['DIGITAL_MASTER', 'DIGITAL MASTER', 'Reach the certificate target'],
])
  output += `\ninsert into achievements(key,name,description) values(${[key, name, description].map(sql).join(',')}) on conflict(key) do nothing;`;
output +=
  "\ninsert into site_settings(key,value) values('certificateThreshold','400'),('registrationEnabled','true'),('finalists_published','false'),('announcement','\"\"') on conflict(key) do nothing;\n";
output += `
update events set reward_rule_key=case when title='Panel Discussion' then 'panel' when title like 'Session %' then 'speaker' when title like 'Startup Battle%' then 'startup_audience' when track='3D' then '3d' when track='GAMING' then 'fifa' when track in ('WORKSHOPS','HACKATHON') or title in ('Startup Commercialization','Mock Pitching','Startup acceleration') then 'masterclass' else null end;
`;
writeFileSync('supabase/seed.sql', output);
