update competitions
set description = description || ' Общий призовой фонд конкурсов — 200 000 тг.'
where slug in ('startup-battle', 'jas-startuper', 'hackathon', 'fifa')
  and description not ilike '%200 000%';
