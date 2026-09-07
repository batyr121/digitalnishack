import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const migrations = readdirSync('supabase/migrations').filter(name => name.endsWith('.sql')).sort();
const files = [...migrations.map(name => `supabase/migrations/${name}`), 'supabase/seed.sql'];
writeFileSync('supabase/setup.sql', '-- INITIAL SETUP ONLY: run once in an empty Supabase project.\n-- Generated with npm run setup:sql. Do not run alongside the individual migrations.\nbegin;\n' + files.map(path => `\n-- ${path}\n${readFileSync(path, 'utf8')}`).join('\n') + '\ncommit;\n');
console.log('Generated supabase/setup.sql for an empty project.');
