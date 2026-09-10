delete from competition_entries
where competition_id in (select id from competitions where slug = 'jas-startuper');

delete from competitions
where slug = 'jas-startuper';

delete from coin_rules
where key = 'jas_startuper';
