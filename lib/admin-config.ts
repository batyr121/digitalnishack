export const adminCollections: Record<
  string,
  { table: string; columns: string[]; template?: Record<string, unknown> }
> = {
  applications: {
    table: 'applications',
    columns: ['id', 'user_id', 'profiles', 'status', 'created_at'],
  },
  promocodes: {
    table: 'promo_codes',
    columns: ['id', 'code', 'type', 'used_count', 'max_uses', 'active', 'expires_at'],
    template: {
      code: '',
      name: '',
      type: 'GUEST',
      max_uses: 1,
      expires_at: null,
      active: true,
      notes: '',
    },
  },
  tickets: {
    table: 'tickets',
    columns: ['id', 'user_id', 'profiles', 'type', 'status', 'checked_in_at', 'created_at'],
  },
  events: {
    table: 'events',
    columns: ['id', 'title', 'day', 'time', 'track', 'capacity', 'coins', 'published'],
    template: {
      title: '',
      description: '',
      day: 19,
      time: 'TBA',
      track: 'MAIN STAGE',
      location: 'Venue TBA',
      speaker_id: null,
      capacity: null,
      registration_required: true,
      coins: 30,
      published: true,
      reward_rule_key: null,
    },
  },
  speakers: {
    table: 'speakers',
    columns: ['id', 'name', 'kind', 'secret', 'company', 'topic'],
    template: {
      secret: true,
      kind: 'KEYNOTE',
      name: 'SECRET SPEAKER',
      position: '',
      company: '',
      photo: null,
      bio: '',
      topic: 'TOPIC TO BE REVEALED',
      session: '',
      social: {},
      sort_order: 0,
    },
  },
  competitions: {
    table: 'competitions',
    columns: ['id', 'slug', 'title', 'published', 'rules', 'bracket'],
    template: {
      slug: '',
      title: '',
      description: '',
      rules: 'Rules to be announced.',
      judging: 'Judging to be announced.',
      published: false,
      bracket: [],
    },
  },
  coins: {
    table: 'coin_transactions',
    columns: ['user_id', 'amount', 'reason', 'admin_id', 'created_at'],
  },
  certificates: {
    table: 'certificates',
    columns: ['id', 'user_id', 'recipient_name', 'status', 'created_at'],
  },
  partners: {
    table: 'partners',
    columns: ['id', 'name', 'type', 'logo', 'website'],
    template: { name: '', logo: null, website: null, type: 'PARTNER' },
  },
  content: { table: 'site_settings', columns: ['key', 'value'], template: { value: '' } },
  questions: { table: 'questions', columns: ['id', 'user_id', 'body', 'status', 'created_at'] },
  logs: {
    table: 'admin_logs',
    columns: ['admin_id', 'action', 'entity', 'entity_id', 'created_at'],
  },
};
